/**
 * schemas/rag.schema.ts
 *
 * Zod validation schema for RAG Semantic Chunks, Metadata, Embeddings, Vector Storage, Hybrid Retrieval & Candidate-Aware Ranking.
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

// ---------------------------------------------------------------------------
// Embedding Architecture Schemas (Milestone 5.1 & 5.2)
// ---------------------------------------------------------------------------

export const EmbeddingConfigSchema = z.object({
  provider: z.string().min(1, "provider name is required"),
  model: z.string().min(1, "model name is required"),
  dimensions: z.number().int().positive("dimensions must be a positive integer"),
  batchSize: z.number().int().positive("batchSize must be a positive integer"),
});

export const VectorEmbeddingSchema = z.object({
  chunkId: z.string().min(1, "chunkId is required"),
  content: z.string().min(1, "content is required"),
  vector: z.array(z.number()).min(1, "vector must not be empty"),
  dimensions: z.number().int().positive(),
  modelName: z.string().min(1),
  metadata: ChunkMetadataSchema,
  createdAt: z.string(),
});

// ---------------------------------------------------------------------------
// Vector Storage Schemas (Milestone 5.3)
// ---------------------------------------------------------------------------

export const VectorRecordSchema = z.object({
  chunkId: z.string().min(1, "chunkId is required"),
  vector: z.array(z.number()).min(1, "vector must not be empty"),
  content: z.string().min(1, "content is required"),
  metadata: ChunkMetadataSchema,
  dimensions: z.number().int().positive(),
  createdAt: z.string(),
});

export const VectorStorageStatsSchema = z.object({
  totalRecords: z.number().int().min(0),
  dimensions: z.number().int().min(0),
  providerName: z.string().min(1),
  lastUpdated: z.string(),
});

// ---------------------------------------------------------------------------
// Retrieval Architecture, Hybrid Fusion & Candidate Ranking Schemas (Milestones 6.1 - 6.5)
// ---------------------------------------------------------------------------

export const RetrievalFilterSchema = z.object({
  day: z.number().int().positive().optional(),
  category: z.string().optional(),
  difficulty: ConceptDifficultyLevelSchema.optional(),
});

export const HybridConfigSchema = z.object({
  semanticWeight: z.number().min(0).max(1),
  bm25Weight: z.number().min(0).max(1),
  fetchTopK: z.number().int().positive().optional(),
});

export const CandidateAwareConfigSchema = z.object({
  hybridWeight: z.number().min(0).max(1),
  candidateWeight: z.number().min(0).max(1),
});

export const RetrievalOptionsSchema = z.object({
  topK: z.number().int().positive().optional(),
  minScore: z.number().min(-1).optional(),
  filter: RetrievalFilterSchema.optional(),
  hybridConfig: HybridConfigSchema.optional(),
  candidateAwareConfig: CandidateAwareConfigSchema.optional(),
});

export const RetrievedChunkSchema = z.object({
  chunkId: z.string().min(1, "chunkId is required"),
  content: z.string().min(1, "content is required"),
  metadata: ChunkMetadataSchema,
  score: z.number(),
  retrievalSource: z.string().min(1, "retrievalSource is required"),
  sources: z.array(z.string()).optional(),
  hybridScore: z.number().optional(),
  candidateScore: z.number().optional(),
  finalScore: z.number().optional(),
});

export const CandidateAwareRetrievedChunkSchema = RetrievedChunkSchema.extend({
  hybridScore: z.number(),
  candidateScore: z.number(),
  finalScore: z.number(),
});

export const RetrievalResponseSchema = z.object({
  query: z.string().min(1, "query is required"),
  results: z.array(RetrievedChunkSchema),
  totalRetrieved: z.number().int().min(0),
  durationMs: z.number().min(0),
  retrievalSource: z.string().min(1),
});
