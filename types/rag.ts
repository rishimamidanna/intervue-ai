/**
 * types/rag.ts
 *
 * RAG, Semantic Chunking & Embedding Architecture Contracts (Milestone 4 & 5.1)
 *
 * Owner: Shared (types/ directory) - Member 2 (Data + RAG)
 */

import type { ConceptDifficultyLevel, CurriculumSourceRef } from "./curriculum";

/**
 * Metadata associated with a curriculum-aware semantic chunk.
 * Preserves keywords, category, difficulty, source reference, and chunk index tracking.
 */
export interface ChunkMetadata {
  keywords: string[];
  category: string;
  difficulty: ConceptDifficultyLevel;
  sourceRef: CurriculumSourceRef;
  chunkIndex?: number;
  totalChunks?: number;
  [key: string]: unknown;
}

/**
 * Core CurriculumChunk structure for curriculum-aware RAG chunking.
 */
export interface CurriculumChunk {
  chunkId: string;
  day: number;
  topic: string;
  concept: string;
  content: string;
  keywords: string[];
  metadata: ChunkMetadata;
}

/**
 * Index mapping chunk ID to CurriculumChunk for O(1) retrieval.
 */
export type ChunkIndex = Record<string, CurriculumChunk>;

// ---------------------------------------------------------------------------
// Chunk Quality Validation Contracts (Milestone 4.3)
// ---------------------------------------------------------------------------

export interface ChunkValidationError {
  chunkId?: string;
  field: string;
  message: string;
}

export interface ChunkValidationReport {
  isValid: boolean;
  totalChecked: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  duplicateChunkIds: string[];
  duplicateContentHashes: string[];
  errors: string[];
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Embedding Architecture Contracts (Milestone 5.1)
// ---------------------------------------------------------------------------

export type EmbeddingProviderType = "mock" | "openai" | "cohere" | "local" | string;

export interface EmbeddingConfig {
  provider: EmbeddingProviderType;
  model: string;
  dimensions: number;
  batchSize: number;
}

export interface VectorEmbedding {
  chunkId: string;
  vector: number[];
  dimensions: number;
  modelName: string;
  metadata: ChunkMetadata;
  createdAt: string;
}

export interface EmbeddingResult {
  chunkId: string;
  embedding: VectorEmbedding;
  tokenUsage?: number;
  durationMs: number;
}
