/**
 * server/context-builder.ts
 *
 * Retrieved Context Builder (Milestone 7.1)
 *
 * Converts ranked retrieved chunks (Semantic, BM25, Hybrid, or Candidate-Aware)
 * into clean, LLM-ready formatted context strings with source citation tracking manifests,
 * deduplication, and payload size limiting.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  CandidateAwareRetrievedChunk,
  ContextBuilderOptions,
  ContextSourceReference,
  FormattedContextResponse,
} from "@/types/rag";
import { FormattedContextResponseSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";

/**
 * Formats a single retrieved chunk into a clean LLM context source block.
 *
 * @param chunk - RetrievedChunk candidate item
 * @param index - 1-based index of source in context payload
 * @param headerPrefix - Custom prefix for source header (default "Source")
 * @param headerStyle - Header style "colon" ("Source 1:") or "brackets" ("[Source 1]")
 * @returns Formatted source string block
 */
export function formatSingleChunkSource(
  chunk: RetrievedChunk | CandidateAwareRetrievedChunk,
  index: number,
  headerPrefix = "Source",
  headerStyle: "colon" | "brackets" = "colon"
): string {
  const sourceHeader =
    headerStyle === "brackets"
      ? `[${headerPrefix} ${index}]`
      : `${headerPrefix} ${index}:`;
  const cleanContent = chunk.content.trim();
  return `${sourceHeader}\n\n${cleanContent}`;
}

/**
 * Builds clean, structured, LLM-ready formatted context string and source tracking manifest
 * from an array of ranked retrieved chunks.
 *
 * Flow:
 * Ranked Results -> Deduplication -> Score Sorting -> Format Blocks -> Size Limit -> Formatted Context
 *
 * @param chunks - Array of RetrievedChunk or CandidateAwareRetrievedChunk objects
 * @param options - ContextBuilderOptions (maxContextLength, maxChunks, headerPrefix, headerStyle)
 * @returns FormattedContextResponse
 */
export function buildFormattedContext(
  chunks: (RetrievedChunk | CandidateAwareRetrievedChunk)[],
  options?: ContextBuilderOptions
): FormattedContextResponse {
  const maxContextLength = options?.maxContextLength ?? 4000;
  const maxChunks = options?.maxChunks ?? 5;
  const headerPrefix = options?.headerPrefix ?? "Source";
  const headerStyle = options?.headerStyle ?? "colon";

  if (!chunks || chunks.length === 0) {
    const emptyResponse: FormattedContextResponse = {
      context: "",
      sources: [],
      totalChunksUsed: 0,
      characterCount: 0,
      truncated: false,
    };
    return strictValidate(
      FormattedContextResponseSchema,
      emptyResponse,
      "Formatted Context Response"
    );
  }

  // 1. Deduplicate chunks by chunkId (preserving highest scoring instance)
  const uniqueChunkMap = new Map<string, RetrievedChunk | CandidateAwareRetrievedChunk>();
  for (const chunk of chunks) {
    const existing = uniqueChunkMap.get(chunk.chunkId);
    const itemScore = chunk.finalScore ?? chunk.score;
    const existingScore = existing ? (existing.finalScore ?? existing.score) : -Infinity;

    if (!existing || itemScore > existingScore) {
      uniqueChunkMap.set(chunk.chunkId, chunk);
    }
  }

  // 2. Sort deduplicated chunks by score / finalScore descending
  const sortedChunks = Array.from(uniqueChunkMap.values()).sort((a, b) => {
    const scoreA = a.finalScore ?? a.score;
    const scoreB = b.finalScore ?? b.score;
    return scoreB - scoreA;
  });

  // 3. Format context string blocks and collect source references up to size limits
  const formattedBlocks: string[] = [];
  const sourcesManifest: ContextSourceReference[] = [];
  let currentLength = 0;
  let isTruncated = false;

  for (let i = 0; i < sortedChunks.length; i++) {
    if (formattedBlocks.length >= maxChunks) {
      isTruncated = true;
      break;
    }

    const chunk = sortedChunks[i];
    const sourceIndex = formattedBlocks.length + 1;
    const formattedBlock = formatSingleChunkSource(
      chunk,
      sourceIndex,
      headerPrefix,
      headerStyle
    );
    const blockLengthWithSeparator =
      formattedBlock.length + (formattedBlocks.length > 0 ? 2 : 0);

    if (currentLength + blockLengthWithSeparator > maxContextLength) {
      isTruncated = true;
      break;
    }

    formattedBlocks.push(formattedBlock);
    currentLength += blockLengthWithSeparator;

    sourcesManifest.push({
      chunkId: chunk.chunkId,
      topic: (chunk.metadata.topic as string) || (chunk.metadata.sourceRef ? `Day ${chunk.metadata.sourceRef.day}` : undefined),
      concept: (chunk.metadata.concept as string) || undefined,
      score: chunk.finalScore ?? chunk.score,
      metadata: chunk.metadata,
    });
  }

  const finalContext = formattedBlocks.join("\n\n");

  const response: FormattedContextResponse = {
    context: finalContext,
    sources: sourcesManifest,
    totalChunksUsed: sourcesManifest.length,
    characterCount: finalContext.length,
    truncated: isTruncated || sortedChunks.length > sourcesManifest.length,
  };

  return strictValidate(
    FormattedContextResponseSchema,
    response,
    "Formatted Context Response"
  );
}
