/**
 * server/rag-performance-monitor.ts
 *
 * RAG Performance Monitoring Dashboard System (Performance Milestone P6)
 *
 * Internal monitoring system that tracks fine-grained end-to-end latency across all 8 stages:
 * 1. embedding
 * 2. vectorSearch
 * 3. bm25
 * 4. hybridRanking
 * 5. reranking
 * 6. contextBuilding
 * 7. promptBuilding
 * 8. total
 *
 * Exact Required Metric Structure:
 * {
 *   "requestId": "req-1723123456-abc",
 *   "timings": {
 *     "embedding": "1.8ms",
 *     "vectorSearch": "3.6ms",
 *     "bm25": "2.2ms",
 *     "hybridRanking": "1.3ms",
 *     "reranking": "4.2ms",
 *     "contextBuilding": "2.1ms",
 *     "promptBuilding": "1.5ms",
 *     "total": "16.7ms"
 *   },
 *   "cache": {
 *     "hit": false
 *   },
 *   "retrieval": {
 *     "chunksRetrieved": 5,
 *     "averageScore": 0.824
 *   }
 * }
 *
 * Features:
 * - Decoupled monitoring architecture (does not alter retrieval logic or accuracy)
 * - Zero-overhead lightweight timing utilities
 * - Bottleneck detection & summary reporting for future dashboard integration
 *
 * Owner: Member 2 (Advanced RAG + Performance)
 */

import type {
  RAGPipelinePerformanceMetrics,
  RAGPipelineTimings,
  RAGPipelineCacheMetrics,
  RAGPipelineRetrievalMetrics,
  RAGSystemSummaryStats,
  RetrievedChunk,
} from "@/types/rag";
import {
  RAGPipelinePerformanceMetricsSchema,
  RAGSystemSummaryStatsSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Reusable Timing Utility: RAGPerformanceTracker
// ---------------------------------------------------------------------------

export type RAGStage =
  | "embedding"
  | "vectorSearch"
  | "bm25"
  | "hybridRanking"
  | "reranking"
  | "contextBuilding"
  | "promptBuilding";

export class RAGPerformanceTracker {
  public readonly requestId: string;
  public readonly query: string;
  public readonly startTime: number;
  private rawTimingsMs: Record<string, number> = {
    embedding: 0,
    vectorSearch: 0,
    bm25: 0,
    hybridRanking: 0,
    reranking: 0,
    contextBuilding: 0,
    promptBuilding: 0,
  };
  private cacheMetrics: RAGPipelineCacheMetrics = { hit: false };
  private retrievalMetrics: RAGPipelineRetrievalMetrics = {
    chunksRetrieved: 0,
    averageScore: 0,
  };

  constructor(requestId?: string, query?: string) {
    this.requestId =
      requestId || `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.query = query || "";
    this.startTime = performance.now();
  }

  /**
   * Records execution duration for a specific pipeline stage.
   */
  recordStage(stage: RAGStage, durationMs: number): void {
    this.rawTimingsMs[stage] = Number(durationMs.toFixed(2));
  }

  /**
   * Wraps an async function execution to measure stage latency automatically.
   */
  async measureStage<T>(stage: RAGStage, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const elapsed = performance.now() - start;
      this.recordStage(stage, elapsed);
    }
  }

  /**
   * Sets cache performance metrics.
   */
  setCacheMetrics(hit: boolean, category?: string, responseTime?: string): void {
    this.cacheMetrics = { hit, category, responseTime };
  }

  /**
   * Sets retrieval quality metrics from output chunks.
   */
  setRetrievalMetrics(chunks: RetrievedChunk[]): void {
    if (!chunks || chunks.length === 0) {
      this.retrievalMetrics = { chunksRetrieved: 0, averageScore: 0, topScore: 0 };
      return;
    }
    const scores = chunks.map((c) => c.finalScore ?? c.score ?? 0);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const top = Math.max(...scores);

    this.retrievalMetrics = {
      chunksRetrieved: chunks.length,
      averageScore: Number(avg.toFixed(4)),
      topScore: Number(top.toFixed(4)),
    };
  }

  /**
   * Finalizes tracker and produces the exact RAGPipelinePerformanceMetrics structure.
   */
  finalize(): RAGPipelinePerformanceMetrics {
    const totalMs = Number((performance.now() - this.startTime).toFixed(2));

    const formattedTimings: RAGPipelineTimings = {
      embedding: `${this.rawTimingsMs.embedding.toFixed(1)}ms`,
      vectorSearch: `${this.rawTimingsMs.vectorSearch.toFixed(1)}ms`,
      bm25: `${this.rawTimingsMs.bm25.toFixed(1)}ms`,
      hybridRanking: `${this.rawTimingsMs.hybridRanking.toFixed(1)}ms`,
      reranking: `${this.rawTimingsMs.reranking.toFixed(1)}ms`,
      contextBuilding: `${this.rawTimingsMs.contextBuilding.toFixed(1)}ms`,
      promptBuilding: `${this.rawTimingsMs.promptBuilding.toFixed(1)}ms`,
      total: `${totalMs.toFixed(1)}ms`,
    };

    const metrics: RAGPipelinePerformanceMetrics = {
      requestId: this.requestId,
      query: this.query,
      timestamp: new Date().toISOString(),
      timings: formattedTimings,
      cache: this.cacheMetrics,
      retrieval: this.retrievalMetrics,
    };

    return strictValidate(
      RAGPipelinePerformanceMetricsSchema,
      metrics,
      "RAG Pipeline Performance Metrics"
    );
  }
}

// ---------------------------------------------------------------------------
// RAG Performance Monitor Engine
// ---------------------------------------------------------------------------

export class RAGPerformanceMonitor {
  private history: RAGPipelinePerformanceMetrics[] = [];
  private maxHistorySize = 1000;

  /**
   * Starts a new tracker instance for a request.
   */
  startTracker(requestId?: string, query?: string): RAGPerformanceTracker {
    return new RAGPerformanceTracker(requestId, query);
  }

  /**
   * Records a finalized metrics payload into the historical monitoring log.
   */
  recordMetrics(metrics: RAGPipelinePerformanceMetrics): void {
    const validated = strictValidate(
      RAGPipelinePerformanceMetricsSchema,
      metrics,
      "Record RAG Metrics"
    );
    this.history.push(validated);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Returns recent request metrics.
   */
  getRecentMetrics(limit = 10): RAGPipelinePerformanceMetrics[] {
    return this.history.slice(-limit);
  }

  /**
   * Analyzes history to calculate summary statistics and identify pipeline bottlenecks.
   */
  getSummaryStats(): RAGSystemSummaryStats {
    if (this.history.length === 0) {
      return {
        totalRequestsTracked: 0,
        averageTotalLatencyMs: 0,
        cacheHitRatio: 0,
        bottlenecksIdentified: [],
      };
    }

    let totalLatencySum = 0;
    let cacheHits = 0;

    const stageSums: Record<string, number> = {
      embedding: 0,
      vectorSearch: 0,
      bm25: 0,
      hybridRanking: 0,
      reranking: 0,
      contextBuilding: 0,
      promptBuilding: 0,
    };

    for (const item of this.history) {
      const totalMs = parseFloat(String(item.timings.total).replace("ms", "")) || 0;
      totalLatencySum += totalMs;

      if (item.cache.hit) cacheHits++;

      for (const stage of Object.keys(stageSums)) {
        const valMs =
          parseFloat(
            String(item.timings[stage as keyof RAGPipelineTimings]).replace("ms", "")
          ) || 0;
        stageSums[stage] += valMs;
      }
    }

    const n = this.history.length;
    const avgTotal = totalLatencySum / n;
    const cacheHitRatio = Number((cacheHits / n).toFixed(4));

    // Identify bottlenecks by ranking average stage latency
    const bottlenecksIdentified = Object.entries(stageSums)
      .map(([stage, sum]) => {
        const avgStageMs = sum / n;
        const pct = avgTotal > 0 ? (avgStageMs / avgTotal) * 100 : 0;
        return {
          stage,
          avgLatencyMs: Number(avgStageMs.toFixed(2)),
          percentageOfTotal: `${pct.toFixed(1)}%`,
        };
      })
      .sort((a, b) => b.avgLatencyMs - a.avgLatencyMs);

    const stats: RAGSystemSummaryStats = {
      totalRequestsTracked: n,
      averageTotalLatencyMs: Number(avgTotal.toFixed(2)),
      cacheHitRatio,
      bottlenecksIdentified,
    };

    return strictValidate(
      RAGSystemSummaryStatsSchema,
      stats,
      "RAG System Summary Stats"
    );
  }

  /**
   * Clears historical metrics.
   */
  clearHistory(): void {
    this.history = [];
  }
}

// ---------------------------------------------------------------------------
// Singleton Instance
// ---------------------------------------------------------------------------

export const defaultRAGPerformanceMonitor = new RAGPerformanceMonitor();
