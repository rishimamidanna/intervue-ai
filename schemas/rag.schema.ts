/**
 * schemas/rag.schema.ts
 *
 * Zod validation schema for RAG Semantic Chunks, Metadata & Validation Reports.
 *
 * Owner: Member 2 (Data + RAG)
 */

import { z } from "zod";
import {
  ConceptDifficultyLevelSchema,
  CurriculumSourceRefSchema,
} from "./curriculum.schema";

export const ChunkMetadataSchema = z
  .object({
    keywords: z.array(z.string()).min(1, "Keywords array must not be empty"),
    category: z.string().min(1, "Category is required"),
    difficulty: ConceptDifficultyLevelSchema,
    sourceRef: CurriculumSourceRefSchema,
    chunkIndex: z.number().int().min(0).optional(),
    totalChunks: z.number().int().min(1).optional(),
  })
  .passthrough();

export const CurriculumChunkSchema = z.object({
  chunkId: z.string().min(1, "chunkId is required"),
  day: z.number().int().min(1, "day must be a positive integer"),
  topic: z.string().min(1, "topic is required"),
  concept: z.string().min(1, "concept is required"),
  content: z.string().min(1, "content is required"),
  keywords: z.array(z.string()).min(1, "keywords array must not be empty"),
  metadata: ChunkMetadataSchema,
});

export const CurriculumChunkArraySchema = z.array(CurriculumChunkSchema);

// ---------------------------------------------------------------------------
// Chunk Quality Validation Report Schema (Milestone 4.3)
// ---------------------------------------------------------------------------

export const ChunkValidationReportSchema = z.object({
  isValid: z.boolean(),
  totalChecked: z.number().int().min(0),
  validCount: z.number().int().min(0),
  invalidCount: z.number().int().min(0),
  duplicateCount: z.number().int().min(0),
  duplicateChunkIds: z.array(z.string()),
  duplicateContentHashes: z.array(z.string()),
  errors: z.array(z.string()),
  timestamp: z.string(),
});
