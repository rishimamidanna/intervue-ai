/**
 * types/rag.ts
 *
 * RAG, Semantic Chunking, Embedding, Vector Storage, Retrieval, Hybrid Fusion & Candidate-Aware Ranking Contracts (Milestones 4, 5 & 6)
 *
 * Owner: Shared (types/ directory) - Member 2 (Data + RAG)
 */

import type { ConceptDifficultyLevel, CurriculumSourceRef } from "./curriculum";
import type { CandidateProfile, CandidateIntelligenceProfile } from "./candidate";

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
// Embedding Architecture Contracts (Milestone 5.1 & 5.2)
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
  content: string;
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

// ---------------------------------------------------------------------------
// Vector Storage Architecture Contracts (Milestone 5.3)
// ---------------------------------------------------------------------------

export interface VectorRecord {
  chunkId: string;
  vector: number[];
  content: string;
  metadata: ChunkMetadata;
  dimensions: number;
  createdAt: string;
}

export interface VectorStorageStats {
  totalRecords: number;
  dimensions: number;
  providerName: string;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Retrieval Architecture, Hybrid Fusion & Candidate Ranking Contracts (Milestones 6.1 - 6.5)
// ---------------------------------------------------------------------------

export type RetrievalSource = "semantic" | "bm25" | "hybrid" | "candidate-aware" | string;

export interface RetrievalFilter {
  day?: number;
  category?: string;
  difficulty?: ConceptDifficultyLevel;
}

export interface HybridConfig {
  semanticWeight: number;
  bm25Weight: number;
  fetchTopK?: number;
}

export interface CandidateAwareConfig {
  hybridWeight: number;
  candidateWeight: number;
}

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
  filter?: RetrievalFilter;
  hybridConfig?: HybridConfig;
  candidateAwareConfig?: CandidateAwareConfig;
  candidateProfile?: CandidateProfile | CandidateIntelligenceProfile;
}

export interface RetrievedChunk {
  chunkId: string;
  content: string;
  metadata: ChunkMetadata;
  score: number;
  retrievalSource: RetrievalSource;
  sources?: RetrievalSource[];
  hybridScore?: number;
  candidateScore?: number;
  finalScore?: number;
}

export interface CandidateAwareRetrievedChunk extends RetrievedChunk {
  hybridScore: number;
  candidateScore: number;
  finalScore: number;
}

export interface RetrievalResponse {
  query: string;
  results: RetrievedChunk[];
  totalRetrieved: number;
  durationMs: number;
  retrievalSource: RetrievalSource;
}
