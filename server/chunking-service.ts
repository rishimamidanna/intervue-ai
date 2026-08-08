/**
 * server/chunking-service.ts
 *
 * Curriculum-Aware Semantic Chunk Generator & Validation Engine (Milestone 4.1 & 4.2)
 *
 * Generates meaningful, curriculum-aware semantic chunks following strict
 * Day -> Topic -> Concept boundaries prepared for vector embeddings and BM25 keyword search.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type { CurriculumChunk, ChunkMetadata } from "@/types/rag";
import type { EnrichedCurriculumConcept } from "@/types/curriculum";
import { CurriculumChunkSchema } from "@/schemas/rag.schema";
import { strictValidate, safeValidate } from "@/lib/validation";
import { loadEnrichedConcepts } from "./curriculum-service";

// ---------------------------------------------------------------------------
// In-Memory Chunk Cache
// ---------------------------------------------------------------------------

let _chunksCache: CurriculumChunk[] | null = null;

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
  const dayStr = String(concept.sourceDay).padStart(2, "0");
  const chunkId = `chunk-day-${dayStr}-${concept.id}`;

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
    keywords: concept.keywords,
    metadata,
  };

  return strictValidate(
    CurriculumChunkSchema,
    rawChunk,
    `Curriculum Chunk ${chunkId}`
  );
}

// ---------------------------------------------------------------------------
// Semantic Chunk Generation (Milestone 4.2)
// ---------------------------------------------------------------------------

/**
 * Deterministically generates a curriculum-aware semantic chunk for a single
 * concept unit, adhering to Day -> Topic -> Concept semantic boundaries.
 * Formats structured content text optimized for future vector embeddings & BM25 retrieval.
 *
 * @param concept - EnrichedCurriculumConcept
 * @returns CurriculumChunk
 */
export function generateConceptChunk(
  concept: EnrichedCurriculumConcept
): CurriculumChunk {
  const toolsText =
    concept.tools.length > 0 ? concept.tools.join(", ") : "Standard Frameworks";
  const relatedText =
    concept.relatedConcepts.length > 0
      ? concept.relatedConcepts.join(", ")
      : "Core Fundamentals";
  const keywordText = concept.keywords.join(", ");

  const formattedContent = [
    `Concept: ${concept.conceptName} | Module: ${concept.module} | Topic: ${concept.sourceTopic} (Day ${concept.sourceDay})`,
    `Overview & Context: ${concept.description}`,
    `Associated Tools & Ecosystem: ${toolsText}`,
    `Related Curriculum Concepts: ${relatedText}`,
    `Search Keywords: ${keywordText}`,
  ].join("\n\n");

  return buildChunkFromConcept(concept, formattedContent, 0, 1);
}

/**
 * Generates semantic chunks across all enriched concepts in the curriculum.
 * Output is cached in memory.
 *
 * @param enrichedConcepts - Optional pre-loaded enriched concepts
 * @returns Array of CurriculumChunk objects
 */
export async function generateAllCurriculumChunks(
  enrichedConcepts?: EnrichedCurriculumConcept[]
): Promise<CurriculumChunk[]> {
  if (_chunksCache) return _chunksCache;

  const concepts = enrichedConcepts || (await loadEnrichedConcepts());
  _chunksCache = concepts.map((concept) => generateConceptChunk(concept));
  return _chunksCache;
}

/**
 * Retrieves all generated semantic chunks for a given curriculum day.
 *
 * @param day - Day number (1-indexed)
 * @returns Array of CurriculumChunk objects
 */
export async function getChunksByDay(day: number): Promise<CurriculumChunk[]> {
  const allChunks = await generateAllCurriculumChunks();
  return allChunks.filter((chunk) => chunk.day === day);
}

/**
 * Retrieves all generated semantic chunks matching a concept name (case-insensitive).
 *
 * @param conceptName - Concept name or search string
 * @returns Array of CurriculumChunk objects
 */
export async function getChunksByConcept(
  conceptName: string
): Promise<CurriculumChunk[]> {
  const allChunks = await generateAllCurriculumChunks();
  const searchLower = conceptName.trim().toLowerCase();
  return allChunks.filter(
    (chunk) =>
      chunk.concept.toLowerCase() === searchLower || chunk.chunkId === conceptName
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

/**
 * Clears the in-memory chunks cache.
 */
export function clearChunkCache(): void {
  _chunksCache = null;
}
