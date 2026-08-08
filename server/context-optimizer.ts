/**
 * server/context-optimizer.ts
 *
 * Context Quality Optimization Engine (Milestone 7.6)
 *
 * Optimizes retrieved RAG chunks before prompt construction by:
 * 1. Filtering out low-scoring irrelevant chunks
 * 2. Deduplicating chunk IDs and identical content text snippets while preserving highest-scoring sources
 * 3. Enforcing top-K chunk source count limits
 * 4. Enforcing character length payload budgets
 * 5. Returning structured OptimizedContextResponse { context, sources, removedChunks }
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  CandidateAwareRetrievedChunk,
  ExplainedRetrievedChunk,
  ContextOptimizerOptions,
  ContextSourceReference,
  RemovedChunkDetail,
  OptimizedContextResponse,
} from "@/types/rag";
import { OptimizedContextResponseSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";

/**
 * Normalizes content text for strict content deduplication checking.
 */
function normalizeContentText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Extracts unified final relevance score across any chunk variant.
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
 * Formats source block for context string.
 */
function formatSourceBlock(
  content: string,
  index: number,
  headerPrefix = "Source",
  headerStyle: "colon" | "brackets" = "colon"
): string {
  const sourceHeader =
    headerStyle === "brackets"
      ? `[${headerPrefix} ${index}]`
      : `${headerPrefix} ${index}:`;
  return `${sourceHeader}\n${content.trim()}`;
}

/**
 * Optimizes an array of retrieved context chunks to ensure maximum relevance and quality.
 *
 * Output format:
 * {
 *   context: "...",
 *   sources: [ { chunkId, topic, concept, score, metadata } ],
 *   removedChunks: [ { chunkId, reason, score, contentSnippet } ]
 * }
 *
 * @param chunks - Array of retrieved chunk candidates
 * @param options - ContextOptimizerOptions
 * @returns OptimizedContextResponse
 */
export function optimizeContext(
  chunks: (RetrievedChunk | CandidateAwareRetrievedChunk | ExplainedRetrievedChunk)[],
  options?: ContextOptimizerOptions
): OptimizedContextResponse {
  const minRelevanceScore = options?.minRelevanceScore ?? 0.15;
  const maxChunks = options?.maxChunks ?? 5;
  const maxContextLength = options?.maxContextLength ?? 4000;
  const headerPrefix = options?.headerPrefix ?? "Source";
  const headerStyle = options?.headerStyle ?? "colon";

  const totalChunksOriginal = chunks ? chunks.length : 0;
  const removedChunks: RemovedChunkDetail[] = [];

  if (!chunks || chunks.length === 0) {
    const emptyResponse: OptimizedContextResponse = {
      context: "",
      sources: [],
      removedChunks: [],
      totalChunksOriginal: 0,
      totalChunksUsed: 0,
      characterCount: 0,
      truncated: false,
    };
    return strictValidate(
      OptimizedContextResponseSchema,
      emptyResponse,
      "Optimized Context Response"
    );
  }

  // Step 1: Minimum Relevance Score Filtering (Irrelevant Chunks Removal)
  const relevantChunks: (RetrievedChunk | CandidateAwareRetrievedChunk | ExplainedRetrievedChunk)[] = [];
  for (const chunk of chunks) {
    const score = getItemScore(chunk);
    if (score < minRelevanceScore) {
      removedChunks.push({
        chunkId: chunk.chunkId,
        reason: "irrelevant_score",
        score: Number(score.toFixed(6)),
        contentSnippet: chunk.content.slice(0, 100).trim() + "...",
      });
    } else {
      relevantChunks.push(chunk);
    }
  }

  // Step 2: Content & Chunk ID Deduplication (Preserving Highest Scoring Candidate)
  const uniqueMap = new Map<string, RetrievedChunk | CandidateAwareRetrievedChunk | ExplainedRetrievedChunk>();
  const seenContentMap = new Map<string, RetrievedChunk | CandidateAwareRetrievedChunk | ExplainedRetrievedChunk>();

  for (const chunk of relevantChunks) {
    const itemScore = getItemScore(chunk);
    const contentNorm = normalizeContentText(chunk.content);

    // Check Chunk ID duplicate
    const existingIdChunk = uniqueMap.get(chunk.chunkId);
    if (existingIdChunk) {
      const existingScore = getItemScore(existingIdChunk);
      if (itemScore > existingScore) {
        removedChunks.push({
          chunkId: existingIdChunk.chunkId,
          reason: "duplicate_id",
          score: Number(existingScore.toFixed(6)),
          contentSnippet: existingIdChunk.content.slice(0, 100).trim() + "...",
        });
        uniqueMap.set(chunk.chunkId, chunk);
      } else {
        removedChunks.push({
          chunkId: chunk.chunkId,
          reason: "duplicate_id",
          score: Number(itemScore.toFixed(6)),
          contentSnippet: chunk.content.slice(0, 100).trim() + "...",
        });
        continue;
      }
    } else {
      uniqueMap.set(chunk.chunkId, chunk);
    }

    // Check Content Duplicate
    const existingContentChunk = seenContentMap.get(contentNorm);
    if (existingContentChunk && existingContentChunk.chunkId !== chunk.chunkId) {
      const existingScore = getItemScore(existingContentChunk);
      if (itemScore > existingScore) {
        removedChunks.push({
          chunkId: existingContentChunk.chunkId,
          reason: "duplicate_content",
          score: Number(existingScore.toFixed(6)),
          contentSnippet: existingContentChunk.content.slice(0, 100).trim() + "...",
        });
        seenContentMap.set(contentNorm, chunk);
        uniqueMap.delete(existingContentChunk.chunkId);
      } else {
        removedChunks.push({
          chunkId: chunk.chunkId,
          reason: "duplicate_content",
          score: Number(itemScore.toFixed(6)),
          contentSnippet: chunk.content.slice(0, 100).trim() + "...",
        });
        uniqueMap.delete(chunk.chunkId);
      }
    } else {
      seenContentMap.set(contentNorm, chunk);
    }
  }

  // Step 3: Relevance Sorting (Highest Scoring Sources Preserved First)
  const sortedChunks = Array.from(uniqueMap.values()).sort((a, b) => {
    const scoreA = getItemScore(a);
    const scoreB = getItemScore(b);
    return scoreB - scoreA;
  });

  // Step 4: Top-K Source Count Limit
  const countAcceptedChunks: (RetrievedChunk | CandidateAwareRetrievedChunk | ExplainedRetrievedChunk)[] = [];
  for (let i = 0; i < sortedChunks.length; i++) {
    const chunk = sortedChunks[i];
    const score = getItemScore(chunk);

    if (i >= maxChunks) {
      removedChunks.push({
        chunkId: chunk.chunkId,
        reason: "max_chunks_limit",
        score: Number(score.toFixed(6)),
        contentSnippet: chunk.content.slice(0, 100).trim() + "...",
      });
    } else {
      countAcceptedChunks.push(chunk);
    }
  }

  // Step 5: Character Budget Enforcement & Output Assembly
  const formattedBlocks: string[] = [];
  const sourcesManifest: ContextSourceReference[] = [];
  let currentLength = 0;
  let isTruncated = false;

  for (let i = 0; i < countAcceptedChunks.length; i++) {
    const chunk = countAcceptedChunks[i];
    const sourceIndex = formattedBlocks.length + 1;
    const formattedBlock = formatSourceBlock(
      chunk.content,
      sourceIndex,
      headerPrefix,
      headerStyle
    );
    const blockLengthWithSeparator =
      formattedBlock.length + (formattedBlocks.length > 0 ? 2 : 0);

    if (currentLength + blockLengthWithSeparator > maxContextLength) {
      isTruncated = true;
      const score = getItemScore(chunk);
      removedChunks.push({
        chunkId: chunk.chunkId,
        reason: "max_length_limit",
        score: Number(score.toFixed(6)),
        contentSnippet: chunk.content.slice(0, 100).trim() + "...",
      });
      continue;
    }

    formattedBlocks.push(formattedBlock);
    currentLength += blockLengthWithSeparator;

    sourcesManifest.push({
      chunkId: chunk.chunkId,
      topic:
        (chunk.metadata.topic as string) ||
        (chunk.metadata.sourceRef ? `Day ${chunk.metadata.sourceRef.day}` : undefined),
      concept: (chunk.metadata.concept as string) || undefined,
      score: getItemScore(chunk),
      metadata: chunk.metadata,
    });
  }

  const finalContext = formattedBlocks.join("\n\n");

  const response: OptimizedContextResponse = {
    context: finalContext,
    sources: sourcesManifest,
    removedChunks,
    totalChunksOriginal,
    totalChunksUsed: sourcesManifest.length,
    characterCount: finalContext.length,
    truncated: isTruncated || removedChunks.length > 0,
  };

  return strictValidate(
    OptimizedContextResponseSchema,
    response,
    "Optimized Context Response"
  );
}
