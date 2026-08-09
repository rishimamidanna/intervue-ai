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

export interface RetrievalLatencyMetrics {
  embedding: number;
  vectorSearch: number;
  bm25: number;
  ranking: number;
}

export interface RetrievalResponse {
  query: string;
  results: RetrievedChunk[];
  totalRetrieved: number;
  durationMs: number;
  retrievalSource: RetrievalSource;
  latency?: RetrievalLatencyMetrics;
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

// ---------------------------------------------------------------------------
// Cross Encoder Reranking Contracts (Milestone 7.9)
// ---------------------------------------------------------------------------

/**
 * Configuration for the cross-encoder reranker.
 */
export interface CrossEncoderConfig {
  /** Weight applied to the original retrieval score (0.0–1.0). */
  originalScoreWeight: number;
  /** Weight applied to the cross-encoder reranking score (0.0–1.0). */
  rerankScoreWeight: number;
  /** Maximum number of results to rerank from the candidate pool. */
  rerankTopK: number;
  /** Maximum number of results to return after reranking. */
  finalTopK: number;
  /** Minimum first-stage retrieval score required to enter reranking pool. Default: 0.10 */
  minInitialScoreThreshold?: number;
  /** Batch size for batch-scoring documents in cross-encoder. Default: 10 */
  batchSize?: number;
  /** Candidate pool size limit before reranking. Default: 15 */
  candidatePoolSize?: number;
}

/**
 * Individual reranked chunk with full score breakdown.
 */
export interface RerankResult {
  chunkId: string;
  content: string;
  originalScore: number;
  rerankScore: number;
  finalScore: number;
  metadata: ChunkMetadata;
  retrievalSource: RetrievalSource;
  sources?: RetrievalSource[];
  rankChange: number;
}

export interface RerankPerformanceMetrics {
  retrievalTime: string | number;
  rerankingTime: string | number;
  finalAccuracy: string | number;
}

/**
 * Full reranking response with original and reranked results.
 */
export interface RerankResponse {
  query: string;
  results: RerankResult[];
  totalCandidates: number;
  totalReranked: number;
  durationMs: number;
  config: CrossEncoderConfig;
  tracking?: RerankPerformanceMetrics;
}

// ---------------------------------------------------------------------------
// Multi Query Retrieval Contracts (Milestone 7.10)
// ---------------------------------------------------------------------------

/**
 * Configuration for multi-query retrieval.
 */
export interface MultiQueryConfig {
  /** Maximum number of expanded queries to generate. */
  maxExpandedQueries: number;
  /** Top-K results to fetch per individual query. */
  perQueryTopK: number;
  /** Final top-K results after merging and deduplication. */
  finalTopK: number;
}

/**
 * Full multi-query retrieval response.
 */
export interface MultiQueryRetrievalResponse {
  originalQuery: string;
  generatedQueries: string[];
  results: RetrievedChunk[];
  totalCandidatesBeforeMerge: number;
  totalAfterDedup: number;
  durationMs: number;
  config: MultiQueryConfig;
}

// ---------------------------------------------------------------------------
// Query Understanding Layer Contracts (Milestone 7.11)
// ---------------------------------------------------------------------------

export type QueryIntentType =
  | "conceptual"
  | "procedural"
  | "evaluative"
  | "factual"
  | "exploratory"
  | "comparison"
  | string;

export type QueryRequiredDepth = "overview" | "standard" | "deep-dive" | string;

/**
 * Structured Query Intent produced by Query Analyzer before retrieval.
 */
export interface StructuredQueryIntent {
  query: string;
  intent: QueryIntentType;
  topic: string;
  difficulty: ConceptDifficultyLevel | string;
  requiredDepth: QueryRequiredDepth;
  keywords: string[];
}

// ---------------------------------------------------------------------------
// Adaptive Retrieval Contracts (Milestone 7.12)
// ---------------------------------------------------------------------------

export interface AdaptiveRetrievalConfig {
  /** Top-K for high confidence queries (fewer chunks). Default: 3 */
  highConfidenceTopK: number;
  /** Top-K for medium confidence queries (balanced chunks). Default: 5 */
  mediumConfidenceTopK: number;
  /** Top-K for low confidence queries (more chunks). Default: 8 */
  lowConfidenceTopK: number;
  /** Initial candidate pool size for confidence analysis. Default: 10 */
  initialCandidateK: number;
}

export interface AdaptiveRetrievalStrategy {
  confidence: RetrievalConfidenceLevel | string;
  selectedTopK: number;
  reasoning: string;
}

export interface AdaptiveRetrievalResponse {
  query: string;
  strategy: AdaptiveRetrievalStrategy;
  confidenceAnalysis: RetrievalConfidenceAnalysis;
  results: RetrievedChunk[];
  totalRetrieved: number;
  durationMs: number;
  config: AdaptiveRetrievalConfig;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Enhanced RAG Contracts (Milestone 7.13)
// ---------------------------------------------------------------------------

export type GraphNodeType = "concept" | "topic" | "skill" | string;
export type GraphEdgeRelation = "requires" | "related_to" | "prerequisite_of" | string;

export interface GraphNode {
  id: string;
  name: string;
  type: GraphNodeType;
  metadata?: Record<string, unknown>;
}

export interface GraphRelationship {
  source: string;
  target: string;
  relation: GraphEdgeRelation;
  weight?: number;
}

export interface ConceptGraphData {
  nodes: GraphNode[];
  edges: GraphRelationship[];
}

export interface KnowledgeGraphRAGResponse {
  query?: string;
  concepts: string[];
  relationships: GraphRelationship[];
  supportingChunks: RetrievedChunk[];
  durationMs?: number;
}

// ---------------------------------------------------------------------------
// Self Correcting RAG Contracts (Milestone 7.14)
// ---------------------------------------------------------------------------

export interface SelfCorrectingRAGConfig {
  /** Minimum relevance score required to consider context "Good". Default: 0.55 */
  minRelevanceThreshold: number;
  /** Maximum number of query improvement retries allowed to avoid infinite loops. Default: 2 */
  maxRetries: number;
  /** Default topK chunks to retrieve per attempt. Default: 5 */
  topK: number;
}

export interface SelfCorrectingAttempt {
  query: string;
  isRelevant: boolean;
  score: number;
  chunks: RetrievedChunk[];
  reasons: string[];
}

export interface SelfCorrectingRAGResponse {
  firstAttempt: SelfCorrectingAttempt;
  retryPerformed: boolean;
  retryCount: number;
  finalContext: SelfCorrectingAttempt;
  durationMs: number;
  config: SelfCorrectingRAGConfig;
}

// ---------------------------------------------------------------------------
// Interview Memory RAG Contracts (Milestone 7.15)
// ---------------------------------------------------------------------------

export interface CandidatePerformanceRecord {
  topic: string;
  score: number;
  attempts: number;
  timestamp: string;
  notes?: string;
}

export interface CandidateFeedback {
  question: string;
  performance: string;
  difficulty: string;
  weakness: string;
}

export interface CandidateMemoryStore {
  id: string;
  previousQuestions: string[];
  weakAreas: string[];
  strengths: string[];
  weaknesses?: string[];
  recommendedTopics?: string[];
  performance: CandidatePerformanceRecord[];
  feedback?: CandidateFeedback[];
}

export interface MemoryHistoryItem {
  type: "question" | "weakness" | "strength" | "performance" | string;
  content: string;
  topic?: string;
  relevanceScore?: number;
  timestamp?: string;
}

export interface InterviewMemoryResponse {
  candidateId: string;
  candidateContext: string;
  relevantHistory: MemoryHistoryItem[];
  personalizedChunks: RetrievedChunk[];
  memory: CandidateMemoryStore;
  durationMs?: number;
}

// ---------------------------------------------------------------------------
// Intelligent Caching Contracts (Performance Milestone P2)
// ---------------------------------------------------------------------------

export type CacheCategory =
  | "query_embeddings"
  | "retrieval_results"
  | "candidate_context"
  | "generated_context";

export interface CacheResponseMetadata {
  cacheHit: boolean;
  responseTime: string;
  category?: CacheCategory | string;
  cacheKey?: string;
  ttlMs?: number;
}

export interface IntelligentCacheStats {
  hits: number;
  misses: number;
  hitRatio: number;
  totalEntries: number;
  categories: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Parallel Processing Contracts (Performance Milestone P3)
// ---------------------------------------------------------------------------

export interface ParallelTaskTimingMetrics {
  retrievalMs: number;
  memoryLookupMs: number;
  metadataLookupMs: number;
  candidateAnalysisMs: number;
  totalParallelMs: number;
  sequentialEquivalentMs: number;
  timeSavedMs: number;
}

export interface ParallelTaskStatuses {
  retrieval: "fulfilled" | "rejected";
  memoryLookup: "fulfilled" | "rejected";
  metadataLookup: "fulfilled" | "rejected";
  candidateAnalysis: "fulfilled" | "rejected";
}

export interface ParallelRAGResponse {
  query: string;
  candidateId?: string;
  results: RetrievedChunk[];
  candidateContext?: string;
  relevantHistory: MemoryHistoryItem[];
  relationships: GraphRelationship[];
  candidateIntelligence?: CandidateIntelligenceProfile | null;
  timings: ParallelTaskTimingMetrics;
  taskStatuses: ParallelTaskStatuses;
}

// ---------------------------------------------------------------------------
// Streaming AI Response Contracts (Performance Milestone P5)
// ---------------------------------------------------------------------------

export type StreamingEventType = "start" | "token" | "sources" | "done" | "interrupted";

export interface SourceCitation {
  chunkId: string;
  title: string;
  sourceType: string;
  score: number;
}

export interface StreamingEvent {
  event: StreamingEventType;
  token?: string;
  accumulated?: string;
  sources?: SourceCitation[];
  fullText?: string;
  partialText?: string;
  totalTokens?: number;
  durationMs?: number;
  reason?: string;
}

export interface StreamingRAGOptions {
  abortSignal?: AbortSignal;
  chunkSize?: number;
  delayMs?: number;
  temperature?: number;
}

// ---------------------------------------------------------------------------
// RAG Performance Monitoring Contracts (Performance Milestone P6)
// ---------------------------------------------------------------------------

export interface RAGPipelineTimings {
  embedding: string | number;
  vectorSearch: string | number;
  bm25: string | number;
  hybridRanking: string | number;
  reranking: string | number;
  contextBuilding: string | number;
  promptBuilding: string | number;
  total: string | number;
}

export interface RAGPipelineCacheMetrics {
  hit: boolean;
  category?: string;
  responseTime?: string;
}

export interface RAGPipelineRetrievalMetrics {
  chunksRetrieved: number;
  averageScore: number;
  topScore?: number;
}

export interface RAGPipelinePerformanceMetrics {
  requestId: string;
  query?: string;
  timestamp?: string;
  timings: RAGPipelineTimings;
  cache: RAGPipelineCacheMetrics;
  retrieval: RAGPipelineRetrievalMetrics;
}

export interface RAGSystemSummaryStats {
  totalRequestsTracked: number;
  averageTotalLatencyMs: number;
  cacheHitRatio: number;
  bottlenecksIdentified: { stage: string; avgLatencyMs: number; percentageOfTotal: string }[];
}

// ---------------------------------------------------------------------------
// Retrieval Planner Contracts (Milestone 7.16)
// ---------------------------------------------------------------------------

export interface RetrievalStrategy {
  semantic: boolean;
  bm25: boolean;
  metadataFilter: boolean;
  topK: number;
  memoryRetrieval: boolean;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface RetrievalPlannerDecision {
  query: string;
  strategy: RetrievalStrategy;
  reasoning: string[];
}

// ---------------------------------------------------------------------------
// Query Decomposition Contracts (Milestone 7.17)
// ---------------------------------------------------------------------------

export interface QueryDecompositionResponse {
  originalQuery: string;
  subQuestions: string[];
  results: RetrievedChunk[];
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Dynamic Hybrid Search Contracts (Milestone 7.18)
// ---------------------------------------------------------------------------

export interface DynamicHybridWeightConfig {
  semanticWeight: number;
  bm25Weight: number;
}

export interface DynamicHybridDecision {
  query: string;
  queryType: string;
  weights: DynamicHybridWeightConfig;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Dynamic Difficulty Contracts (Milestone 7.20)
// ---------------------------------------------------------------------------

export interface CandidateAssessment {
  score: number;
  confidence: number;
  weaknessesTracked?: string[];
}

export interface DifficultyDecision {
  currentLevel: string;
  nextLevel: string;
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Knowledge Gap Detection Contracts (Milestone 7.19)
// ---------------------------------------------------------------------------

export interface KnowledgeGap {
  skill: string;
  gap: string;
  severity: "low" | "medium" | "high" | "none";
  recommendation: string;
}

export interface KnowledgeGapResponse {
  candidateId: string;
  gapsDetected: KnowledgeGap[];
}

// ---------------------------------------------------------------------------
// Hallucination Guard Contracts (Milestone 7.21)
// ---------------------------------------------------------------------------

export interface HallucinationGuardResponse {
  supported: boolean;
  confidence: number;
  unsupportedClaims: string[];
  explanation: string;
}

// ---------------------------------------------------------------------------
// RAG Evaluation Benchmark Contracts (Milestone 7.22)
// ---------------------------------------------------------------------------

export interface RAGEvaluationBenchmarkItem {
  question: string;
  expectedTopics: string[];
  expectedSources: string[];
}

export interface RAGEvaluationBenchmarkResult {
  retrievalScore: string;
  contextScore: string;
  latency: string;
  overallScore: string;
}

// ---------------------------------------------------------------------------
// Self-Evaluation Reflection Contracts (Milestone 7.29)
// ---------------------------------------------------------------------------

export interface ReflectionEvaluationChecks {
  grounded: boolean;
  complete: boolean;
  relevant: boolean;
}

export interface ReflectionEvaluationResult {
  answerQuality: number;
  checks: ReflectionEvaluationChecks;
  improvements: string[];
}

// ---------------------------------------------------------------------------
// Skill Graph Intelligence Contracts (Milestone 7.30)
// ---------------------------------------------------------------------------

export interface SkillGraphNode {
  id: string;
  type: "skill" | "concept" | "topic" | "prerequisite";
  name: string;
}

export interface SkillGraphEdge {
  source: string;
  target: string;
  relation: "requires" | "related_to" | "prerequisite_of" | "weak_in";
}

export interface CandidateGraphState {
  candidate: string;
  skills: Record<string, number>;
  gaps: string[];
}

// ---------------------------------------------------------------------------
// Reasoning-Based Retrieval Contracts
// ---------------------------------------------------------------------------

/**
 * Retrieved knowledge grouped by the role it plays in answering a question.
 */
export interface ReasoningRetrievalLayers {
  direct: RetrievedChunk[];
  prerequisite: RetrievedChunk[];
  related: RetrievedChunk[];
}

/**
 * Public response returned by the modular reasoning retrieval service.
 */
export interface ReasoningRetrievalResponse {
  query: string;
  requiredConcepts: string[];
  retrievalLayers: ReasoningRetrievalLayers;
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Lightweight Knowledge Gap Detector Contracts (Milestone 7.33)
// ---------------------------------------------------------------------------

export interface LightweightGapInput {
  question: string;
  expectedConcepts: string[];
  candidateAnswer: string;
}

export interface LightweightGapOutput {
  missingConcepts: string[];
  coveredConcepts: string[];
  severity: "low" | "medium" | "high";
}

// ---------------------------------------------------------------------------
// Lightweight Dynamic Difficulty Engine Contracts (Milestone 7.34)
// ---------------------------------------------------------------------------

export interface LightweightDifficultyInput {
  score: number;
  confidence?: string;
  currentDifficulty: string;
}

export interface LightweightDifficultyOutput {
  nextDifficulty: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Lightweight Self Reflection Layer Contracts (Milestone 7.35)
// ---------------------------------------------------------------------------

export interface LightweightReflectionInput {
  answer: string;
  context?: string | boolean | any[];
  expectedConcepts?: string[];
  confidence?: "high" | "medium" | "low" | number | string;
}

export interface LightweightReflectionOutput {
  quality: "good" | "needs_review";
  confidence: string;
  issues: string[];
  recommendation?: string;
}

// ---------------------------------------------------------------------------
// Lightweight RAG Quality Benchmark Contracts (Milestone 7.36)
// ---------------------------------------------------------------------------

export interface LightweightBenchmarkItem {
  question: string;
  expectedConcepts: string[];
  expectedTopics: string[];
}

export interface LightweightBenchmarkReport {
  totalQuestions: number | string;
  retrievalScore: string;
  contextScore: string;
  averageLatency: string;
  overallScore: string;
}

// ---------------------------------------------------------------------------
// RAG Pipeline Optimization Contracts (Milestone 7.37)
// ---------------------------------------------------------------------------

export interface RAGCacheStats {
  hits: number;
  misses: number;
  size: number;
}

export interface OptimizedRAGResponse {
  query: string;
  context: string;
  intent?: any;
  retrievedChunks: RetrievedChunk[];
  cached: boolean;
  durationMs: number;
}
