/**
 * server/rag-evaluator.ts
 *
 * Lightweight RAG Evaluation Framework (Milestone 7.7)
 *
 * Evaluates retrieval runs, measuring:
 * - Retrieval scores (averageScore, topScore, lowestScore, scoreVariance)
 * - Top-K accuracy (ratio of top-K results meeting relevance threshold)
 * - Confidence level ("high" | "medium" | "low")
 * - Context relevance score (weighted composite score)
 * - Source usage count (unique source chunks)
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  CandidateAwareRetrievedChunk,
  ExplainedRetrievedChunk,
  EvaluationResult,
} from "@/types/rag";
import { EvaluationResultSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { analyzeRetrievalConfidence } from "./retrieval-confidence";

/**
 * Normalizes content text for duplicate tracking.
 */
function normalizeContentText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Helper to extract relevance score across chunk type variants.
 */
function getItemScore(
  chunk: RetrievedChunk | CandidateAwareRetrievedChunk | ExplainedRetrievedChunk
): number {
  if ("scores" in chunk && chunk.scores && typeof chunk.scores.final === "number") {
    return chunk.scores.final;
  }
  const retrieved = chunk as RetrievedChunk;
  return retrieved.finalScore ?? retrieved.score ?? 0;
}

/**
 * Options for RAG retrieval evaluation.
 */
export interface RAGEvaluationOptions {
  expectedTopic?: string;
  minRelevanceThreshold?: number;
}

/**
 * Evaluates a RAG retrieval run and produces an EvaluationResult payload.
 *
 * Example Output:
 * {
 *   "query": "Explain vector databases",
 *   "averageScore": 0.88,
 *   "topKAccuracy": 1.0,
 *   "sourcesUsed": 4,
 *   "confidence": "high",
 *   "contextRelevanceScore": 0.91,
 *   "metrics": { ... },
 *   "timestamp": "2026-08-08T..."
 * }
 *
 * @param query - User search query
 * @param chunks - Array of retrieved chunk candidates
 * @param options - RAGEvaluationOptions
 * @returns EvaluationResult
 */
export function evaluateRAGRetrieval(
  query: string,
  chunks: (RetrievedChunk | CandidateAwareRetrievedChunk | ExplainedRetrievedChunk)[],
  options?: RAGEvaluationOptions
): EvaluationResult {
  const minThreshold = options?.minRelevanceThreshold ?? 0.50;
  const expectedTopic = options?.expectedTopic?.toLowerCase();

  if (!chunks || chunks.length === 0) {
    const emptyResult: EvaluationResult = {
      query: query || "",
      averageScore: 0.0,
      topKAccuracy: 0.0,
      sourcesUsed: 0,
      confidence: "low",
      contextRelevanceScore: 0.0,
      metrics: {
        topScore: 0.0,
        lowestScore: 0.0,
        duplicateCount: 0,
        irrelevantCount: 0,
        scoreVariance: 0.0,
      },
      timestamp: new Date().toISOString(),
    };
    return strictValidate(EvaluationResultSchema, emptyResult, "RAG Evaluation Result");
  }

  const scores = chunks.map(getItemScore);
  const topScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  const averageScore = Number((sum / scores.length).toFixed(4));

  // Score variance calculation
  const variance =
    scores.reduce((acc, curr) => acc + Math.pow(curr - averageScore, 2), 0) /
    scores.length;

  // Track unique source chunks and duplicates
  const seenIds = new Set<string>();
  const seenContent = new Set<string>();
  let duplicateCount = 0;

  for (const chunk of chunks) {
    const normContent = normalizeContentText(chunk.content);
    if (seenIds.has(chunk.chunkId) || seenContent.has(normContent)) {
      duplicateCount++;
    } else {
      seenIds.add(chunk.chunkId);
      seenContent.add(normContent);
    }
  }

  const sourcesUsed = seenIds.size;

  // Track irrelevant chunks (< minThreshold)
  let irrelevantCount = 0;
  let accurateCount = 0;

  for (const chunk of chunks) {
    const score = getItemScore(chunk);
    if (score < minThreshold) {
      irrelevantCount++;
    }

    const matchesTopic =
      expectedTopic &&
      ((chunk.metadata.topic as string)?.toLowerCase().includes(expectedTopic) ||
        (chunk.metadata.concept as string)?.toLowerCase().includes(expectedTopic) ||
        (chunk.metadata.category as string)?.toLowerCase().includes(expectedTopic));

    if (score >= minThreshold || matchesTopic) {
      accurateCount++;
    }
  }

  const topKAccuracy = Number((accurateCount / chunks.length).toFixed(4));

  // Confidence analysis
  const confidenceAnalysis = analyzeRetrievalConfidence({
    query,
    results: chunks as RetrievedChunk[],
    totalRetrieved: chunks.length,
    durationMs: 0,
    retrievalSource: chunks[0]?.retrievalSource || "hybrid",
  });

  // Context relevance score: composite weighted 0.6 * topScore + 0.4 * averageScore
  const rawContextRelevance = 0.6 * topScore + 0.4 * averageScore;
  const contextRelevanceScore = Number(
    Math.min(1.0, Math.max(0.0, rawContextRelevance)).toFixed(4)
  );

  const evaluationResult: EvaluationResult = {
    query,
    averageScore,
    topKAccuracy,
    sourcesUsed,
    confidence: confidenceAnalysis.confidence,
    contextRelevanceScore,
    metrics: {
      topScore: Number(topScore.toFixed(4)),
      lowestScore: Number(lowestScore.toFixed(4)),
      duplicateCount,
      irrelevantCount,
      scoreVariance: Number(variance.toFixed(6)),
    },
    timestamp: new Date().toISOString(),
  };

  return strictValidate(
    EvaluationResultSchema,
    evaluationResult,
    "RAG Evaluation Result"
  );
}
