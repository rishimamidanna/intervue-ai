/**
 * server/chunking-service.ts
 *
 * Chunking Architecture & Validation Engine (Milestone 4.1)
 *
 * Builds, formats, and validates curriculum-aware semantic chunks.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type { CurriculumChunk, ChunkMetadata } from "@/types/rag";
import type { EnrichedCurriculumConcept } from "@/types/curriculum";
import { CurriculumChunkSchema } from "@/schemas/rag.schema";
import { strictValidate, safeValidate } from "@/lib/validation";

/**
 * Builds a strongly typed, schema-validated CurriculumChunk from an enriched concept
 * and text content snippet.
 *
 * @param concept - EnrichedCurriculumConcept metadata source
 * @param contentChunk - Text content for this chunk
 * @param chunkIndex - Optional 0-indexed position
 * @param totalChunks - Optional total chunks count
 * @returns CurriculumChunk
 */
export function buildChunkFromConcept(
  concept: EnrichedCurriculumConcept,
  contentChunk: string,
  chunkIndex: number = 0,
  totalChunks: number = 1
): CurriculumChunk {
  const indexStr = String(chunkIndex + 1).padStart(2, "0");
  const chunkId = `${concept.id}-chunk-${indexStr}`;

  const metadata: ChunkMetadata = {
    keywords: concept.keywords,
    category: concept.category,
    difficulty: concept.difficultyLevel,
    sourceRef: {
      file: concept.sourceMapping.file,
      day: concept.sourceMapping.day,
      uri: concept.sourceMapping.uri,
    },
    chunkIndex,
    totalChunks,
  };

  const rawChunk: CurriculumChunk = {
    chunkId,
    day: concept.sourceDay,
    topic: concept.sourceTopic,
    concept: concept.conceptName,
    content: contentChunk.trim(),
    metadata,
  };

  return strictValidate(
    CurriculumChunkSchema,
    rawChunk,
    `Curriculum Chunk ${chunkId}`
  );
}

/**
 * Validates any raw input object against CurriculumChunkSchema.
 *
 * @param input - Unknown object to validate
 * @returns CurriculumChunk
 */
export function validateChunk(input: unknown): CurriculumChunk {
  return strictValidate(CurriculumChunkSchema, input, "Curriculum Chunk");
}

/**
 * Safely validates any raw input object against CurriculumChunkSchema without throwing.
 *
 * @param input - Unknown object to validate
 */
export function safeValidateChunk(input: unknown) {
  return safeValidate(CurriculumChunkSchema, input);
}
