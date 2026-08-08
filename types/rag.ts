/**
 * types/rag.ts
 *
 * RAG & Semantic Chunking Architecture Contracts (Milestone 4.1 & 4.2)
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
