import type {
  RetrievedChunk,
  RetrievalOptions,
  OptimizedRAGResponse,
  RAGCacheStats,
} from "@/types/rag";
import { OptimizedRAGResponseSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch, performCandidateAwareSearch } from "./retrieval-service";
import { defaultQueryAnalyzer } from "./query-analyzer";
import { defaultInterviewMemoryRAG } from "./interview-memory";
import { buildFormattedContext } from "./context-builder";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-Memory LRU & TTL Cache for RAG Pipeline Optimization.
 */
export class RAGPipelineCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxCapacity: number;
  private defaultTTLMs: number;
  private hits = 0;
  private misses = 0;

  constructor(maxCapacity = 100, defaultTTLMs = 5 * 60 * 1000) {
    this.maxCapacity = maxCapacity;
    this.defaultTTLMs = defaultTTLMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.hits++;
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    if (this.cache.size >= this.maxCapacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const expiresAt = Date.now() + (ttlMs ?? this.defaultTTLMs);
    this.cache.set(key, { value, expiresAt });
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats(): RAGCacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
    };
  }
}

export const defaultRAGPipelineCache = new RAGPipelineCache<OptimizedRAGResponse>();
export const queryAnalysisCache = new RAGPipelineCache<any>(200, 10 * 60 * 1000);

export class OptimizedRAGPipeline {
  /**
   * Executes the RAG pipeline with parallelized steps, caching, and duplicate computation removal.
   *
   * @param query - Input search question
   * @param candidateId - Optional active candidate ID for personalized retrieval & memory
   * @param options - Retrieval options (topK, filters)
   * @returns OptimizedRAGResponse
   */
  async execute(
    query: string,
    candidateId?: string,
    options?: RetrievalOptions
  ): Promise<OptimizedRAGResponse> {
    const startTime = performance.now();
    const cacheKey = `${query.trim().toLowerCase()}::${candidateId || "none"}::topK:${options?.topK || 5}`;

    // 1. Caching Check
    const cachedResponse = defaultRAGPipelineCache.get(cacheKey);
    if (cachedResponse) {
      return {
        ...cachedResponse,
        cached: true,
        durationMs: Number((performance.now() - startTime).toFixed(2)),
      };
    }

    // 2. Parallel Execution (Retrieval + Query Analysis + Candidate Memory Fetching)
    const retrievalPromise = candidateId
      ? defaultInterviewMemoryRAG
          .getOrCreateMemory(candidateId)
          .then((candidateProfile) =>
            performCandidateAwareSearch(query, candidateProfile as any, options)
          )
      : performHybridSearch(query, options);

    const intentPromise = (async () => {
      const cachedIntent = queryAnalysisCache.get(query);
      if (cachedIntent) return cachedIntent;

      const analyzed = await defaultQueryAnalyzer.analyze(query);
      queryAnalysisCache.set(query, analyzed);
      return analyzed;
    })();

    const [retrievedChunks, intent] = await Promise.all([
      retrievalPromise,
      intentPromise,
    ]);

    // 3. Duplicate Computation Removal (Context formatting)
    const formattedContextObj = buildFormattedContext(retrievedChunks);
    const context =
      typeof formattedContextObj === "string"
        ? formattedContextObj
        : (formattedContextObj as any).context ||
          (formattedContextObj as any).formattedContext ||
          "";

    const durationMs = Number((performance.now() - startTime).toFixed(2));

    const response: OptimizedRAGResponse = {
      query,
      context,
      intent,
      retrievedChunks: retrievedChunks as RetrievedChunk[],
      cached: false,
      durationMs,
    };

    // Cache compiled response
    defaultRAGPipelineCache.set(cacheKey, response);

    return strictValidate(
      OptimizedRAGResponseSchema,
      response,
      "Optimized RAG Response"
    );
  }
}

export const defaultOptimizedRAGPipeline = new OptimizedRAGPipeline();
