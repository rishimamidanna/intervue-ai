/**
 * server/self-correcting-rag.ts
 *
 * Self Correcting RAG Engine (Milestone 7.14)
 *
 * Automatically improves weak retrieval context by evaluating relevance,
 * triggering a query improvement pass when context quality is inadequate,
 * and re-executing retrieval up to a configurable maximum retry limit.
 *
 * Flow:
 *   Retrieve → Evaluate Context → Good?
 *     YES → Continue
 *     NO  → Improve Query → Retrieve Again (up to maxRetries)
 *
 * Required Output Structure:
 * {
 *   firstAttempt: { query, isRelevant, score, chunks, reasons },
 *   retryPerformed: boolean,
 *   retryCount: number,
 *   finalContext: { query, isRelevant, score, chunks, reasons }
 * }
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  RetrievalOptions,
  SelfCorrectingRAGConfig,
  SelfCorrectingAttempt,
  SelfCorrectingRAGResponse,
} from "@/types/rag";
import {
  SelfCorrectingAttemptSchema,
  SelfCorrectingRAGResponseSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch } from "./retrieval-service";

// ---------------------------------------------------------------------------
// Configuration Defaults & Constants
// ---------------------------------------------------------------------------

export const DEFAULT_SELF_CORRECTING_CONFIG: SelfCorrectingRAGConfig = {
  minRelevanceThreshold: 0.55,
  maxRetries: 2,
  topK: 5,
};

// ---------------------------------------------------------------------------
// Relevance Checker Engine
// ---------------------------------------------------------------------------

/**
 * Evaluates whether a set of retrieved chunks meets the relevance threshold for a query.
 *
 * @param query - Target search query
 * @param chunks - Array of RetrievedChunk objects
 * @param threshold - Minimum relevance score required (0.0 to 1.0)
 * @returns SelfCorrectingAttempt object
 */
export function evaluateContextRelevance(
  query: string,
  chunks: RetrievedChunk[],
  threshold: number
): SelfCorrectingAttempt {
  if (!chunks || chunks.length === 0) {
    const attempt: SelfCorrectingAttempt = {
      query,
      isRelevant: false,
      score: 0,
      chunks: [],
      reasons: ["Zero chunks retrieved from vector search"],
    };
    return strictValidate(
      SelfCorrectingAttemptSchema,
      attempt,
      "Self Correcting Attempt (Empty)"
    );
  }

  const scores = chunks.map((c) => c.finalScore ?? c.score ?? 0);
  const topScore = Math.max(...scores);
  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const avgScore = totalScore / scores.length;

  // Composite relevance score: 70% top score strength, 30% average context score
  const compositeScore = Number((0.7 * topScore + 0.3 * avgScore).toFixed(6));
  const isRelevant = compositeScore >= threshold;

  const reasons: string[] = [];
  if (isRelevant) {
    reasons.push(
      `Retrieved context meets quality threshold (${compositeScore} >= ${threshold})`
    );
    reasons.push(`Top chunk similarity score: ${topScore.toFixed(4)}`);
  } else {
    reasons.push(
      `Weak context relevance (${compositeScore} < ${threshold}); query improvement required`
    );
    reasons.push(`Top chunk similarity score: ${topScore.toFixed(4)}`);
  }

  const attempt: SelfCorrectingAttempt = {
    query,
    isRelevant,
    score: compositeScore,
    chunks,
    reasons,
  };

  return strictValidate(
    SelfCorrectingAttemptSchema,
    attempt,
    "Self Correcting Attempt"
  );
}

// ---------------------------------------------------------------------------
// Query Reformulation / Improvement Engine
// ---------------------------------------------------------------------------

/**
 * Reformulates and improves a query when context relevance is insufficient.
 * Applies progressive query enhancement strategies:
 *   1. Prepend core domain topic indicators and strip filler phrases
 *   2. Expand keywords with explicit domain taxonomy concepts
 *
 * @param originalQuery - User input query
 * @param retryAttempt - Current retry index (1-based)
 * @returns Reformulated query string
 */
export function reformulateQuery(originalQuery: string, retryAttempt: number): string {
  // Strip common conversational filler prefixes
  let cleaned = originalQuery
    .replace(/^(can you tell me|what is the concept of|explain to me|give info on|tell me about|how to)\s+/i, "")
    .replace(/[?.!]+$/, "")
    .trim();

  if (cleaned.length === 0) cleaned = originalQuery;

  if (retryAttempt === 1) {
    // Strategy 1: Expand with core enterprise AI domain terms
    return `vector search embeddings ${cleaned} RAG foundations`;
  }

  if (retryAttempt >= 2) {
    // Strategy 2: Extract key tokens and append curriculum module concepts
    const tokens = cleaned
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);
    return `${tokens.join(" ")} RAG retrieval evaluation architecture`;
  }

  return cleaned;
}

// ---------------------------------------------------------------------------
// Self Correcting RAG Service Engine
// ---------------------------------------------------------------------------

export class SelfCorrectingRAG {
  private config: SelfCorrectingRAGConfig;

  constructor(config?: Partial<SelfCorrectingRAGConfig>) {
    this.config = { ...DEFAULT_SELF_CORRECTING_CONFIG, ...config };
  }

  /**
   * Returns active configuration.
   */
  getConfig(): SelfCorrectingRAGConfig {
    return { ...this.config };
  }

  /**
   * Updates configuration.
   */
  setConfig(config: Partial<SelfCorrectingRAGConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Executes Self-Correcting RAG pipeline:
   * 1. Initial retrieval pass for user query.
   * 2. Evaluate context relevance (relevance checker).
   * 3. If relevance >= threshold, return immediately.
   * 4. If relevance < threshold, trigger query improvement pass up to maxRetries.
   * 5. Return full response payload containing firstAttempt, retryPerformed, retryCount, finalContext.
   *
   * @param query - Initial search query
   * @param options - Optional retrieval options
   * @param configOverride - Optional per-call config overrides
   * @returns SelfCorrectingRAGResponse
   */
  async executeSelfCorrectingRAG(
    query: string,
    options?: RetrievalOptions,
    configOverride?: Partial<SelfCorrectingRAGConfig>
  ): Promise<SelfCorrectingRAGResponse> {
    const startTime = Date.now();
    const activeConfig = { ...this.config, ...configOverride };

    const topK = options?.topK ?? activeConfig.topK;
    const seenQueries = new Set<string>([query]);

    // 1. Initial Retrieval Pass
    const initialChunks = await performHybridSearch(query, { ...options, topK });

    // 2. Evaluate Context Quality
    const firstAttempt = evaluateContextRelevance(
      query,
      initialChunks,
      activeConfig.minRelevanceThreshold
    );

    // If initial retrieval is already good, return without retry
    if (firstAttempt.isRelevant) {
      const durationMs = Date.now() - startTime;
      const response: SelfCorrectingRAGResponse = {
        firstAttempt,
        retryPerformed: false,
        retryCount: 0,
        finalContext: firstAttempt,
        durationMs,
        config: activeConfig,
      };
      return strictValidate(
        SelfCorrectingRAGResponseSchema,
        response,
        "Self Correcting RAG Response (No Retry)"
      );
    }

    // 3. Query Improvement & Retry Loop (Self-Correction Pass)
    let retryCount = 0;
    let lastAttempt: SelfCorrectingAttempt = firstAttempt;

    while (retryCount < activeConfig.maxRetries) {
      retryCount++;
      const improvedQuery = reformulateQuery(query, retryCount);

      // Infinite loop prevention: stop if query has already been tried
      if (seenQueries.has(improvedQuery)) {
        break;
      }
      seenQueries.add(improvedQuery);

      const retryChunks = await performHybridSearch(improvedQuery, { ...options, topK });
      const currentAttempt = evaluateContextRelevance(
        improvedQuery,
        retryChunks,
        activeConfig.minRelevanceThreshold
      );

      lastAttempt = currentAttempt;

      // Exit loop early if query improvement achieved good context relevance
      if (currentAttempt.isRelevant) {
        break;
      }
    }

    const durationMs = Date.now() - startTime;

    const response: SelfCorrectingRAGResponse = {
      firstAttempt,
      retryPerformed: true,
      retryCount,
      finalContext: lastAttempt,
      durationMs,
      config: activeConfig,
    };

    return strictValidate(
      SelfCorrectingRAGResponseSchema,
      response,
      "Self Correcting RAG Response (Retry Performed)"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultSelfCorrectingRAG = new SelfCorrectingRAG();
