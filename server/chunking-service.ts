/**
 * server/chunking-service.ts
 *
 * Curriculum-Aware Semantic Chunk Generator & Chunk Quality Validation Engine (Milestone 4.1, 4.2 & 4.3)
 * Advanced Metadata Enrichment (Milestone 7.5)
 *
 * Generates meaningful, curriculum-aware semantic chunks following strict
 * Day -> Topic -> Concept boundaries prepared for vector embeddings, BM25 keyword search, and advanced metadata filtering.
 * Provides a quality validation layer enforcing required fields, content/metadata quality, and duplicate detection.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  CurriculumChunk,
  ChunkMetadata,
  ChunkValidationReport,
} from "@/types/rag";
import type { EnrichedCurriculumConcept } from "@/types/curriculum";
import {
  CurriculumChunkSchema,
  ChunkValidationReportSchema,
} from "@/schemas/rag.schema";
import { strictValidate, safeValidate } from "@/lib/validation";
import { loadEnrichedConcepts } from "./curriculum-service";

// ---------------------------------------------------------------------------
// In-Memory Chunk Cache
// ---------------------------------------------------------------------------

let _chunksCache: CurriculumChunk[] | null = null;

/**
 * Builds a strongly typed, schema-validated CurriculumChunk from an enriched concept
 * and text content snippet with advanced metadata intelligence.
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
    concept: concept.conceptName,
    skillCategory: concept.module,
    prerequisites: concept.relatedConcepts.slice(0, 2),
    relatedConcepts: concept.relatedConcepts,
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

// ---------------------------------------------------------------------------
// Chunk Quality Validation Layer (Milestone 4.3)
// ---------------------------------------------------------------------------

/**
 * Evaluates the quality of a single chunk candidate.
 * Verifies required fields, content non-emptiness, and metadata integrity.
 *
 * @param chunk - Raw chunk object to validate
 * @returns Object with boolean valid status and error messages
 */
export function validateChunkQuality(chunk: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const parsed = safeValidate(CurriculumChunkSchema, chunk);
  if (!parsed.success) {
    return { valid: false, errors: parsed.errors };
  }

  const c = parsed.data;

  // 1. Content Quality
  if (!c.content || c.content.trim().length < 10) {
    errors.push(
      `[${c.chunkId}] Content quality error: Content text is empty or too short (< 10 chars).`
    );
  }

  // 2. Metadata Quality & Keywords
  if (!c.metadata.keywords || c.metadata.keywords.length === 0) {
    errors.push(
      `[${c.chunkId}] Metadata quality error: Keywords array is missing or empty.`
    );
  }

  if (!c.metadata.category || c.metadata.category.trim() === "") {
    errors.push(`[${c.chunkId}] Metadata quality error: Category is missing.`);
  }

  if (!c.metadata.sourceRef || !c.metadata.sourceRef.uri) {
    errors.push(
      `[${c.chunkId}] Metadata quality error: Source reference information is missing.`
    );
  } else if (c.metadata.sourceRef.day !== c.day) {
    errors.push(
      `[${c.chunkId}] Metadata quality error: sourceRef.day (${c.metadata.sourceRef.day}) does not match chunk day (${c.day}).`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Evaluates quality across a batch of chunks.
 * Performs field completeness checks, content/metadata quality verification,
 * and duplicate detection (duplicate chunk IDs and duplicate content text).
 *
 * @param chunks - Array of chunk candidates
 * @returns ChunkValidationReport
 */
export function validateChunkBatchQuality(
  chunks: unknown[]
): ChunkValidationReport {
  const errors: string[] = [];
  const seenChunkIds = new Set<string>();
  const seenContentTexts = new Set<string>();

  const duplicateChunkIds: string[] = [];
  const duplicateContentHashes: string[] = [];

  let invalidCount = 0;
  let duplicateCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const rawChunk = chunks[i];
    const qualityResult = validateChunkQuality(rawChunk);

    if (!qualityResult.valid) {
      invalidCount++;
      errors.push(...qualityResult.errors);
      continue;
    }

    const c = rawChunk as CurriculumChunk;

    // Duplicate Chunk ID check
    if (seenChunkIds.has(c.chunkId)) {
      duplicateCount++;
      duplicateChunkIds.push(c.chunkId);
      errors.push(`[${c.chunkId}] Duplicate detection error: Duplicate chunkId found.`);
    } else {
      seenChunkIds.add(c.chunkId);
    }

    // Duplicate Content check
    const contentNormalized = c.content.trim().toLowerCase();
    if (seenContentTexts.has(contentNormalized)) {
      duplicateCount++;
      duplicateContentHashes.push(c.chunkId);
      errors.push(
        `[${c.chunkId}] Duplicate detection error: Duplicate content text detected across chunks.`
      );
    } else {
      seenContentTexts.add(contentNormalized);
    }
  }

  const totalChecked = chunks.length;
  const validCount = Math.max(0, totalChecked - invalidCount - duplicateCount);
  const isValid = invalidCount === 0 && duplicateCount === 0;

  const rawReport: ChunkValidationReport = {
    isValid,
    totalChecked,
    validCount,
    invalidCount,
    duplicateCount,
    duplicateChunkIds,
    duplicateContentHashes,
    errors,
    timestamp: new Date().toISOString(),
  };

  return strictValidate(
    ChunkValidationReportSchema,
    rawReport,
    "Chunk Quality Validation Report"
  );
}

/**
 * Validates quality and duplicate status for all generated curriculum chunks.
 *
 * @returns ChunkValidationReport
 */
export async function validateAllCurriculumChunksQuality(): Promise<
  ChunkValidationReport
> {
  const chunks = await generateAllCurriculumChunks();
  return validateChunkBatchQuality(chunks);
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
