/**
 * schemas/rag.schema.ts
 *
 * Zod validation schema for RAG Semantic Chunks, Metadata, Embeddings, Vector Storage, Vector Insertion Pipeline, Hybrid Retrieval, Candidate Ranking, Context Builder, Prompt Context Builder, Explainability, Confidence, Context Quality Optimization & RAG Evaluation Framework.
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
    concept: z.string().optional(),
    skillCategory: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
    relatedConcepts: z.array(z.string()).optional(),
    chunkIndex: z.number().int().min(0).optional(),
    totalChunks: z.number().int().min(0).optional(),
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
// Vector Storage Schemas (Milestone 5.3 & 5.4)
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
// Vector Insertion Pipeline Schemas (Milestone 5.5)
// ---------------------------------------------------------------------------

export const VectorInsertionReportSchema = z.object({
  totalSubmitted: z.number().int().min(0),
  totalInserted: z.number().int().min(0),
  duplicateCount: z.number().int().min(0),
  batchCount: z.number().int().min(0),
  durationMs: z.number().min(0),
  timestamp: z.string(),
});

// ---------------------------------------------------------------------------
// Retrieval Architecture, Hybrid Fusion & Candidate Ranking Schemas (Milestones 6.1 - 6.5)
// ---------------------------------------------------------------------------

export const RetrievalFilterSchema = z.object({
  day: z.number().int().positive().optional(),
  category: z.string().optional(),
  skillCategory: z.string().optional(),
  difficulty: ConceptDifficultyLevelSchema.optional(),
  concept: z.string().optional(),
  prerequisite: z.string().optional(),
  relatedConcept: z.string().optional(),
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

export const RetrievalLatencyMetricsSchema = z.object({
  embedding: z.number().min(0),
  vectorSearch: z.number().min(0),
  bm25: z.number().min(0),
  ranking: z.number().min(0),
});

export const RetrievalResponseSchema = z.object({
  query: z.string().min(1, "query is required"),
  results: z.array(RetrievedChunkSchema),
  totalRetrieved: z.number().int().min(0),
  durationMs: z.number().min(0),
  retrievalSource: z.string().min(1),
  latency: RetrievalLatencyMetricsSchema.optional(),
});

// ---------------------------------------------------------------------------
// Context Builder Schemas (Milestone 7.1)
// ---------------------------------------------------------------------------

export const ContextSourceReferenceSchema = z.object({
  chunkId: z.string().min(1, "chunkId is required"),
  topic: z.string().optional(),
  concept: z.string().optional(),
  score: z.number().optional(),
  metadata: ChunkMetadataSchema,
});

export const ContextBuilderOptionsSchema = z.object({
  maxContextLength: z.number().int().positive().optional(),
  maxChunks: z.number().int().positive().optional(),
  headerPrefix: z.string().optional(),
  headerStyle: z.enum(["colon", "brackets"]).optional(),
  includeMetadataHeader: z.boolean().optional(),
});

export const FormattedContextResponseSchema = z.object({
  context: z.string(),
  sources: z.array(ContextSourceReferenceSchema),
  totalChunksUsed: z.number().int().min(0),
  characterCount: z.number().int().min(0),
  truncated: z.boolean(),
});

// ---------------------------------------------------------------------------
// Prompt Context Builder Schemas (Milestone 7.2)
// ---------------------------------------------------------------------------

export const LLMPromptMetadataSchema = z.object({
  sources: z.array(ContextSourceReferenceSchema),
  totalChunks: z.number().int().min(0),
  candidateId: z.string().optional(),
  candidateRole: z.string().optional(),
  experienceYears: z.number().optional(),
});

export const LLMPromptPayloadSchema = z.object({
  systemPrompt: z.string().min(1, "systemPrompt is required"),
  userPrompt: z.string().min(1, "userPrompt is required"),
  metadata: LLMPromptMetadataSchema,
});

// ---------------------------------------------------------------------------
// Retrieval Explainability Schemas (Milestone 7.3)
// ---------------------------------------------------------------------------

export const DetailedRetrievalScoresSchema = z.object({
  semantic: z.number(),
  bm25: z.number(),
  candidate: z.number(),
  final: z.number(),
});

export const ExplainedRetrievedChunkSchema = z.object({
  chunkId: z.string().min(1, "chunkId is required"),
  content: z.string().min(1, "content is required"),
  metadata: ChunkMetadataSchema,
  scores: DetailedRetrievalScoresSchema,
  reasons: z.array(z.string()),
  retrievalSource: z.string().min(1, "retrievalSource is required"),
  sources: z.array(z.string()).optional(),
});

export const ExplainedRetrievalResponseSchema = z.object({
  query: z.string().min(1, "query is required"),
  results: z.array(ExplainedRetrievedChunkSchema),
  totalRetrieved: z.number().int().min(0),
  durationMs: z.number().min(0),
  retrievalSource: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Retrieval Confidence Scoring Schemas (Milestone 7.4)
// ---------------------------------------------------------------------------

export const RetrievalConfidenceLevelSchema = z.enum(["high", "medium", "low"]);

export const RetrievalConfidenceMetricsSchema = z.object({
  averageScore: z.number(),
  topScore: z.number(),
  sourceCount: z.number().int().min(0),
  scoreVariance: z.number(),
});

export const RetrievalConfidenceAnalysisSchema = z.object({
  confidence: RetrievalConfidenceLevelSchema,
  confidenceScore: z.number().min(0).max(1),
  metrics: RetrievalConfidenceMetricsSchema,
  reasons: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Context Quality Optimization Schemas (Milestone 7.6)
// ---------------------------------------------------------------------------

export const ContextRemovalReasonSchema = z.enum([
  "duplicate_id",
  "duplicate_content",
  "irrelevant_score",
  "max_chunks_limit",
  "max_length_limit",
]);

export const RemovedChunkDetailSchema = z.object({
  chunkId: z.string().min(1, "chunkId is required"),
  reason: ContextRemovalReasonSchema,
  score: z.number(),
  contentSnippet: z.string(),
});

export const ContextOptimizerOptionsSchema = z.object({
  minRelevanceScore: z.number().min(0).optional(),
  maxChunks: z.number().int().positive().optional(),
  maxContextLength: z.number().int().positive().optional(),
  headerPrefix: z.string().optional(),
  headerStyle: z.enum(["colon", "brackets"]).optional(),
});

export const OptimizedContextResponseSchema = z.object({
  context: z.string(),
  sources: z.array(ContextSourceReferenceSchema),
  removedChunks: z.array(RemovedChunkDetailSchema),
  totalChunksOriginal: z.number().int().min(0),
  totalChunksUsed: z.number().int().min(0),
  characterCount: z.number().int().min(0),
  truncated: z.boolean(),
});

// ---------------------------------------------------------------------------
// RAG Evaluation Framework Schemas (Milestone 7.7)
// ---------------------------------------------------------------------------

export const RAGEvaluationMetricsSchema = z.object({
  topScore: z.number(),
  lowestScore: z.number(),
  duplicateCount: z.number().int().min(0),
  irrelevantCount: z.number().int().min(0),
  scoreVariance: z.number(),
});

export const EvaluationResultSchema = z.object({
  query: z.string().min(1, "query is required"),
  averageScore: z.number().min(0).max(1),
  topKAccuracy: z.number().min(0).max(1),
  sourcesUsed: z.number().int().min(0),
  confidence: RetrievalConfidenceLevelSchema,
  contextRelevanceScore: z.number().min(0).max(1),
  metrics: RAGEvaluationMetricsSchema,
  timestamp: z.string(),
});

// ---------------------------------------------------------------------------
// Cross Encoder Reranking Schemas (Milestone 7.9)
// ---------------------------------------------------------------------------

export const CrossEncoderConfigSchema = z.object({
  originalScoreWeight: z.number().min(0).max(1),
  rerankScoreWeight: z.number().min(0).max(1),
  rerankTopK: z.number().int().positive(),
  finalTopK: z.number().int().positive(),
  minInitialScoreThreshold: z.number().min(0).max(1).optional(),
  batchSize: z.number().int().positive().optional(),
  candidatePoolSize: z.number().int().positive().optional(),
});

export const RerankResultSchema = z.object({
  chunkId: z.string().min(1, "chunkId is required"),
  content: z.string().min(1, "content is required"),
  originalScore: z.number(),
  rerankScore: z.number(),
  finalScore: z.number(),
  metadata: ChunkMetadataSchema,
  retrievalSource: z.string().min(1, "retrievalSource is required"),
  sources: z.array(z.string()).optional(),
  rankChange: z.number().int(),
});

export const RerankPerformanceMetricsSchema = z.object({
  retrievalTime: z.union([z.string(), z.number()]),
  rerankingTime: z.union([z.string(), z.number()]),
  finalAccuracy: z.union([z.string(), z.number()]),
});

export const RerankResponseSchema = z.object({
  query: z.string().min(1, "query is required"),
  results: z.array(RerankResultSchema),
  totalCandidates: z.number().int().min(0),
  totalReranked: z.number().int().min(0),
  durationMs: z.number().min(0),
  config: CrossEncoderConfigSchema,
  tracking: RerankPerformanceMetricsSchema.optional(),
});

// ---------------------------------------------------------------------------
// Multi Query Retrieval Schemas (Milestone 7.10)
// ---------------------------------------------------------------------------

export const MultiQueryConfigSchema = z.object({
  maxExpandedQueries: z.number().int().positive(),
  perQueryTopK: z.number().int().positive(),
  finalTopK: z.number().int().positive(),
});

export const MultiQueryRetrievalResponseSchema = z.object({
  originalQuery: z.string().min(1, "originalQuery is required"),
  generatedQueries: z.array(z.string()),
  results: z.array(RetrievedChunkSchema),
  totalCandidatesBeforeMerge: z.number().int().min(0),
  totalAfterDedup: z.number().int().min(0),
  durationMs: z.number().min(0),
  config: MultiQueryConfigSchema,
});

// ---------------------------------------------------------------------------
// Query Understanding Layer Schemas (Milestone 7.11)
// ---------------------------------------------------------------------------

export const StructuredQueryIntentSchema = z.object({
  query: z.string().min(1, "query is required"),
  intent: z.string().min(1, "intent is required"),
  topic: z.string().min(1, "topic is required"),
  difficulty: z.string().min(1, "difficulty is required"),
  requiredDepth: z.string().min(1, "requiredDepth is required"),
  keywords: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Adaptive Retrieval Schemas (Milestone 7.12)
// ---------------------------------------------------------------------------

export const AdaptiveRetrievalConfigSchema = z.object({
  highConfidenceTopK: z.number().int().positive(),
  mediumConfidenceTopK: z.number().int().positive(),
  lowConfidenceTopK: z.number().int().positive(),
  initialCandidateK: z.number().int().positive(),
});

export const AdaptiveRetrievalStrategySchema = z.object({
  confidence: z.string().min(1, "confidence is required"),
  selectedTopK: z.number().int().positive(),
  reasoning: z.string().min(1, "reasoning is required"),
});

export const AdaptiveRetrievalResponseSchema = z.object({
  query: z.string().min(1, "query is required"),
  strategy: AdaptiveRetrievalStrategySchema,
  confidenceAnalysis: RetrievalConfidenceAnalysisSchema,
  results: z.array(RetrievedChunkSchema),
  totalRetrieved: z.number().int().min(0),
  durationMs: z.number().min(0),
  config: AdaptiveRetrievalConfigSchema,
});

// ---------------------------------------------------------------------------
// Knowledge Graph Enhanced RAG Schemas (Milestone 7.13)
// ---------------------------------------------------------------------------

export const GraphNodeTypeSchema = z.enum(["concept", "topic", "skill"]).or(z.string());
export const GraphEdgeRelationSchema = z.enum(["requires", "related_to", "prerequisite_of"]).or(z.string());

export const GraphNodeSchema = z.object({
  id: z.string().min(1, "id is required"),
  name: z.string().min(1, "name is required"),
  type: GraphNodeTypeSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const GraphRelationshipSchema = z.object({
  source: z.string().min(1, "source is required"),
  target: z.string().min(1, "target is required"),
  relation: GraphEdgeRelationSchema,
  weight: z.number().optional(),
});

export const ConceptGraphDataSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphRelationshipSchema),
});

export const KnowledgeGraphRAGResponseSchema = z.object({
  query: z.string().optional(),
  concepts: z.array(z.string()),
  relationships: z.array(GraphRelationshipSchema),
  supportingChunks: z.array(RetrievedChunkSchema),
  durationMs: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Self Correcting RAG Schemas (Milestone 7.14)
// ---------------------------------------------------------------------------

export const SelfCorrectingRAGConfigSchema = z.object({
  minRelevanceThreshold: z.number().min(0).max(1),
  maxRetries: z.number().int().min(1),
  topK: z.number().int().positive(),
});

export const SelfCorrectingAttemptSchema = z.object({
  query: z.string().min(1, "query is required"),
  isRelevant: z.boolean(),
  score: z.number(),
  chunks: z.array(RetrievedChunkSchema),
  reasons: z.array(z.string()),
});

export const SelfCorrectingRAGResponseSchema = z.object({
  firstAttempt: SelfCorrectingAttemptSchema,
  retryPerformed: z.boolean(),
  retryCount: z.number().int().min(0),
  finalContext: SelfCorrectingAttemptSchema,
  durationMs: z.number().min(0),
  config: SelfCorrectingRAGConfigSchema,
});

// ---------------------------------------------------------------------------
// Interview Memory RAG Schemas (Milestone 7.15)
// ---------------------------------------------------------------------------

export const CandidatePerformanceRecordSchema = z.object({
  topic: z.string().min(1, "topic is required"),
  score: z.number(),
  attempts: z.number().int().min(0),
  timestamp: z.string().min(1),
  notes: z.string().optional(),
});

export const CandidateFeedbackSchema = z.object({
  question: z.string().min(1, "question is required"),
  performance: z.string().min(1, "performance is required"),
  difficulty: z.string().min(1, "difficulty is required"),
  weakness: z.string().min(1, "weakness is required"),
});

export const CandidateMemoryStoreSchema = z.object({
  id: z.string().min(1, "id is required"),
  previousQuestions: z.array(z.string()),
  weakAreas: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()).optional(),
  recommendedTopics: z.array(z.string()).optional(),
  performance: z.array(CandidatePerformanceRecordSchema),
  feedback: z.array(CandidateFeedbackSchema).optional(),
});

export const MemoryHistoryItemSchema = z.object({
  type: z.enum(["question", "weakness", "strength", "performance"]).or(z.string()),
  content: z.string().min(1, "content is required"),
  topic: z.string().optional(),
  relevanceScore: z.number().optional(),
  timestamp: z.string().optional(),
});

export const InterviewMemoryResponseSchema = z.object({
  candidateId: z.string().min(1, "candidateId is required"),
  candidateContext: z.string(),
  relevantHistory: z.array(MemoryHistoryItemSchema),
  personalizedChunks: z.array(RetrievedChunkSchema),
  memory: CandidateMemoryStoreSchema,
  durationMs: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Intelligent Caching Schemas (Performance Milestone P2)
// ---------------------------------------------------------------------------

export const CacheResponseMetadataSchema = z.object({
  cacheHit: z.boolean(),
  responseTime: z.string().min(1, "responseTime is required"),
  category: z.string().optional(),
  cacheKey: z.string().optional(),
  ttlMs: z.number().optional(),
});

export const IntelligentCacheStatsSchema = z.object({
  hits: z.number().int().min(0),
  misses: z.number().int().min(0),
  hitRatio: z.number().min(0).max(1),
  totalEntries: z.number().int().min(0),
  categories: z.record(z.string(), z.number()),
});

// ---------------------------------------------------------------------------
// Parallel Processing Schemas (Performance Milestone P3)
// ---------------------------------------------------------------------------

export const ParallelTaskTimingMetricsSchema = z.object({
  retrievalMs: z.number().min(0),
  memoryLookupMs: z.number().min(0),
  metadataLookupMs: z.number().min(0),
  candidateAnalysisMs: z.number().min(0),
  totalParallelMs: z.number().min(0),
  sequentialEquivalentMs: z.number().min(0),
  timeSavedMs: z.number(),
});

export const ParallelTaskStatusesSchema = z.object({
  retrieval: z.enum(["fulfilled", "rejected"]),
  memoryLookup: z.enum(["fulfilled", "rejected"]),
  metadataLookup: z.enum(["fulfilled", "rejected"]),
  candidateAnalysis: z.enum(["fulfilled", "rejected"]),
});

export const ParallelRAGResponseSchema = z.object({
  query: z.string().min(1, "query is required"),
  candidateId: z.string().optional(),
  results: z.array(RetrievedChunkSchema),
  candidateContext: z.string().optional(),
  relevantHistory: z.array(MemoryHistoryItemSchema),
  relationships: z.array(GraphRelationshipSchema),
  candidateIntelligence: z.any().optional(),
  timings: ParallelTaskTimingMetricsSchema,
  taskStatuses: ParallelTaskStatusesSchema,
});

// ---------------------------------------------------------------------------
// Streaming AI Response Schemas (Performance Milestone P5)
// ---------------------------------------------------------------------------

export const SourceCitationSchema = z.object({
  chunkId: z.string().min(1, "chunkId is required"),
  title: z.string().min(1, "title is required"),
  sourceType: z.string().min(1, "sourceType is required"),
  score: z.number(),
});

export const StreamingEventSchema = z.object({
  event: z.enum(["start", "token", "sources", "done", "interrupted"]),
  token: z.string().optional(),
  accumulated: z.string().optional(),
  sources: z.array(SourceCitationSchema).optional(),
  fullText: z.string().optional(),
  partialText: z.string().optional(),
  totalTokens: z.number().int().min(0).optional(),
  durationMs: z.number().min(0).optional(),
  reason: z.string().optional(),
});

// ---------------------------------------------------------------------------
// RAG Performance Monitoring Schemas (Performance Milestone P6)
// ---------------------------------------------------------------------------

export const RAGPipelineTimingsSchema = z.object({
  embedding: z.union([z.string(), z.number()]),
  vectorSearch: z.union([z.string(), z.number()]),
  bm25: z.union([z.string(), z.number()]),
  hybridRanking: z.union([z.string(), z.number()]),
  reranking: z.union([z.string(), z.number()]),
  contextBuilding: z.union([z.string(), z.number()]),
  promptBuilding: z.union([z.string(), z.number()]),
  total: z.union([z.string(), z.number()]),
});

export const RAGPipelineCacheMetricsSchema = z.object({
  hit: z.boolean(),
  category: z.string().optional(),
  responseTime: z.string().optional(),
});

export const RAGPipelineRetrievalMetricsSchema = z.object({
  chunksRetrieved: z.number().int().min(0),
  averageScore: z.number(),
  topScore: z.number().optional(),
});

export const RAGPipelinePerformanceMetricsSchema = z.object({
  requestId: z.string().min(1, "requestId is required"),
  query: z.string().optional(),
  timestamp: z.string().optional(),
  timings: RAGPipelineTimingsSchema,
  cache: RAGPipelineCacheMetricsSchema,
  retrieval: RAGPipelineRetrievalMetricsSchema,
});

export const RAGSystemSummaryStatsSchema = z.object({
  totalRequestsTracked: z.number().int().min(0),
  averageTotalLatencyMs: z.number().min(0),
  cacheHitRatio: z.number().min(0).max(1),
  bottlenecksIdentified: z.array(
    z.object({
      stage: z.string(),
      avgLatencyMs: z.number(),
      percentageOfTotal: z.string(),
    })
  ),
});

// ---------------------------------------------------------------------------
// Retrieval Planner Schemas (Milestone 7.16)
// ---------------------------------------------------------------------------

export const RetrievalStrategySchema = z.object({
  semantic: z.boolean(),
  bm25: z.boolean(),
  metadataFilter: z.boolean(),
  topK: z.number().int().positive(),
  memoryRetrieval: z.boolean(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

export const RetrievalPlannerDecisionSchema = z.object({
  query: z.string().min(1, "query is required"),
  strategy: RetrievalStrategySchema,
  reasoning: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Query Decomposition Schemas (Milestone 7.17)
// ---------------------------------------------------------------------------

export const QueryDecompositionResponseSchema = z.object({
  originalQuery: z.string().min(1, "originalQuery is required"),
  subQuestions: z.array(z.string()),
  results: z.array(RetrievedChunkSchema),
  durationMs: z.number().min(0),
});

// ---------------------------------------------------------------------------
// Dynamic Hybrid Search Schemas (Milestone 7.18)
// ---------------------------------------------------------------------------

export const DynamicHybridWeightConfigSchema = z.object({
  semanticWeight: z.number().min(0).max(1),
  bm25Weight: z.number().min(0).max(1),
});

export const DynamicHybridDecisionSchema = z.object({
  query: z.string().min(1, "query is required"),
  queryType: z.string().min(1, "queryType is required"),
  weights: DynamicHybridWeightConfigSchema,
  explanation: z.string().min(1, "explanation is required"),
});

// ---------------------------------------------------------------------------
// Dynamic Difficulty Schemas (Milestone 7.20)
// ---------------------------------------------------------------------------

export const DifficultyDecisionSchema = z.object({
  currentLevel: z.string().min(1, "currentLevel is required"),
  nextLevel: z.string().min(1, "nextLevel is required"),
  reasoning: z.string().min(1, "reasoning is required"),
});

// ---------------------------------------------------------------------------
// Knowledge Gap Detection Schemas (Milestone 7.19)
// ---------------------------------------------------------------------------

export const KnowledgeGapSchema = z.object({
  skill: z.string().min(1, "skill is required"),
  gap: z.string().min(1, "gap is required"),
  severity: z.enum(["low", "medium", "high", "none"]),
  recommendation: z.string().min(1, "recommendation is required"),
});

export const KnowledgeGapResponseSchema = z.object({
  candidateId: z.string().min(1, "candidateId is required"),
  gapsDetected: z.array(KnowledgeGapSchema),
});

// ---------------------------------------------------------------------------
// Hallucination Guard Schemas (Milestone 7.21)
// ---------------------------------------------------------------------------

export const HallucinationGuardResponseSchema = z.object({
  supported: z.boolean(),
  confidence: z.number().min(0).max(1),
  unsupportedClaims: z.array(z.string()),
  explanation: z.string().min(1, "explanation is required"),
});

// ---------------------------------------------------------------------------
// RAG Evaluation Benchmark Schemas (Milestone 7.22)
// ---------------------------------------------------------------------------

export const RAGEvaluationBenchmarkItemSchema = z.object({
  question: z.string().min(1, "question is required"),
  expectedTopics: z.array(z.string()),
  expectedSources: z.array(z.string()),
});

export const RAGEvaluationBenchmarkResultSchema = z.object({
  retrievalScore: z.string().min(1, "retrievalScore is required"),
  contextScore: z.string().min(1, "contextScore is required"),
  latency: z.string().min(1, "latency is required"),
  overallScore: z.string().min(1, "overallScore is required"),
});

// ---------------------------------------------------------------------------
// Self-Evaluation Reflection Schemas (Milestone 7.29)
// ---------------------------------------------------------------------------

export const ReflectionEvaluationChecksSchema = z.object({
  grounded: z.boolean(),
  complete: z.boolean(),
  relevant: z.boolean(),
});

export const ReflectionEvaluationResultSchema = z.object({
  answerQuality: z.number().min(0).max(1),
  checks: ReflectionEvaluationChecksSchema,
  improvements: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Skill Graph Intelligence Schemas (Milestone 7.30)
// ---------------------------------------------------------------------------

export const SkillGraphNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["skill", "concept", "topic", "prerequisite"]),
  name: z.string().min(1),
});

export const SkillGraphEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  relation: z.enum(["requires", "related_to", "prerequisite_of", "weak_in"]),
});

export const CandidateGraphStateSchema = z.object({
  candidate: z.string().min(1),
  skills: z.record(z.string(), z.number()),
  gaps: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Reasoning-Based Retrieval Schemas
// ---------------------------------------------------------------------------

export const ReasoningRetrievalLayersSchema = z.object({
  direct: z.array(RetrievedChunkSchema),
  prerequisite: z.array(RetrievedChunkSchema),
  related: z.array(RetrievedChunkSchema),
});

export const ReasoningRetrievalResponseSchema = z.object({
  query: z.string().min(1, "query is required"),
  requiredConcepts: z.array(z.string().min(1)).min(1),
  retrievalLayers: ReasoningRetrievalLayersSchema,
  reasoning: z.string().min(1, "reasoning is required"),
});
