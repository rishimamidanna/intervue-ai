/**
 * types/rag.ts
 *
 * RAG, Semantic Chunking, Embedding, Vector Storage, Vector Insertion Pipeline, Hybrid Fusion, Candidate Ranking, Context Builder, Prompt Context Builder, Explainability, Confidence, Metadata, Context Quality Optimization & RAG Evaluation Contracts (Milestones 4 - 7)
 *
 * Owner: Shared (types/ directory) - Member 2 (Data + RAG)
 */

import type { ConceptDifficultyLevel, CurriculumSourceRef } from "./curriculum";
import type { CandidateProfile, CandidateIntelligenceProfile } from "./candidate";

/**
 * Advanced metadata associated with a curriculum-aware semantic chunk.
 * Preserves keywords, category, difficulty, concept name, skill category, prerequisites, related concepts, source reference, and chunk index tracking.
 */
export interface ChunkMetadata {
  keywords: string[];
  category: string;
  difficulty: ConceptDifficultyLevel;
  sourceRef: CurriculumSourceRef;
  concept?: string;
  skillCategory?: string;
  prerequisites?: string[];
  relatedConcepts?: string[];
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
// Vector Storage Architecture Contracts (Milestone 5.3 & 5.4)
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
// Vector Insertion Pipeline Contracts (Milestone 5.5)
// ---------------------------------------------------------------------------

export interface VectorInsertionReport {
  totalSubmitted: number;
  totalInserted: number;
  duplicateCount: number;
  batchCount: number;
  durationMs: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Retrieval Architecture, Hybrid Fusion & Candidate Ranking Contracts (Milestones 6.1 - 6.5)
// ---------------------------------------------------------------------------

export type RetrievalSource = "semantic" | "bm25" | "hybrid" | "candidate-aware" | string;

export interface RetrievalFilter {
  day?: number;
  category?: string;
  skillCategory?: string;
  difficulty?: ConceptDifficultyLevel;
  concept?: string;
  prerequisite?: string;
  relatedConcept?: string;
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

// ---------------------------------------------------------------------------
// Context Builder Contracts (Milestone 7.1)
// ---------------------------------------------------------------------------

export interface ContextSourceReference {
  chunkId: string;
  topic?: string;
  concept?: string;
  score?: number;
  metadata: ChunkMetadata;
}

export interface ContextBuilderOptions {
  maxContextLength?: number;
  maxChunks?: number;
  headerPrefix?: string;
  headerStyle?: "colon" | "brackets";
  includeMetadataHeader?: boolean;
}

export interface FormattedContextResponse {
  context: string;
  sources: ContextSourceReference[];
  totalChunksUsed: number;
  characterCount: number;
  truncated: boolean;
}

// ---------------------------------------------------------------------------
// Prompt Context Builder Contracts (Milestone 7.2)
// ---------------------------------------------------------------------------

export interface PromptBuilderInput {
  question: string;
  candidateProfile?: CandidateProfile | CandidateIntelligenceProfile | Record<string, unknown>;
  chunks?: (RetrievedChunk | CandidateAwareRetrievedChunk)[];
  contextResponse?: FormattedContextResponse;
  customInstructions?: string;
}

export interface LLMPromptMetadata {
  sources: ContextSourceReference[];
  totalChunks: number;
  candidateId?: string;
  candidateRole?: string;
  experienceYears?: number;
}

export interface LLMPromptPayload {
  systemPrompt: string;
  userPrompt: string;
  metadata: LLMPromptMetadata;
}

// ---------------------------------------------------------------------------
// Retrieval Explainability Contracts (Milestone 7.3)
// ---------------------------------------------------------------------------

export interface DetailedRetrievalScores {
  semantic: number;
  bm25: number;
  candidate: number;
  final: number;
}

export interface ExplainedRetrievedChunk {
  chunkId: string;
  content: string;
  metadata: ChunkMetadata;
  scores: DetailedRetrievalScores;
  reasons: string[];
  retrievalSource: RetrievalSource;
  sources?: RetrievalSource[];
}

export interface ExplainedRetrievalResponse {
  query: string;
  results: ExplainedRetrievedChunk[];
  totalRetrieved: number;
  durationMs: number;
  retrievalSource: RetrievalSource;
}

// ---------------------------------------------------------------------------
// Retrieval Confidence Scoring Contracts (Milestone 7.4)
// ---------------------------------------------------------------------------

export type RetrievalConfidenceLevel = "high" | "medium" | "low";

export interface RetrievalConfidenceMetrics {
  averageScore: number;
  topScore: number;
  sourceCount: number;
  scoreVariance: number;
}

export interface RetrievalConfidenceAnalysis {
  confidence: RetrievalConfidenceLevel;
  confidenceScore: number;
  metrics: RetrievalConfidenceMetrics;
  reasons: string[];
}

// ---------------------------------------------------------------------------
// Context Quality Optimization Contracts (Milestone 7.6)
// ---------------------------------------------------------------------------

export type ContextRemovalReason =
  | "duplicate_id"
  | "duplicate_content"
  | "irrelevant_score"
  | "max_chunks_limit"
  | "max_length_limit";

export interface RemovedChunkDetail {
  chunkId: string;
  reason: ContextRemovalReason;
  score: number;
  contentSnippet: string;
}

export interface ContextOptimizerOptions {
  minRelevanceScore?: number;
  maxChunks?: number;
  maxContextLength?: number;
  headerPrefix?: string;
  headerStyle?: "colon" | "brackets";
}

export interface OptimizedContextResponse {
  context: string;
  sources: ContextSourceReference[];
  removedChunks: RemovedChunkDetail[];
  totalChunksOriginal: number;
  totalChunksUsed: number;
  characterCount: number;
  truncated: boolean;
}

// ---------------------------------------------------------------------------
// RAG Evaluation Framework Contracts (Milestone 7.7)
// ---------------------------------------------------------------------------

export interface RAGEvaluationMetrics {
  topScore: number;
  lowestScore: number;
  duplicateCount: number;
  irrelevantCount: number;
  scoreVariance: number;
}

export interface EvaluationResult {
  query: string;
  averageScore: number;
  topKAccuracy: number;
  sourcesUsed: number;
  confidence: RetrievalConfidenceLevel;
  contextRelevanceScore: number;
  metrics: RAGEvaluationMetrics;
  timestamp: string;
}
