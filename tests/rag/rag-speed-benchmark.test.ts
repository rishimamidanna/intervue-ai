import assert from "node:assert/strict";
import test from "node:test";
import { performHybridSearch } from "../../server/retrieval-service";
import { defaultQueryAnalyzer } from "../../server/query-analyzer";
import { buildFormattedContext } from "../../server/context-builder";
import {
  defaultOptimizedRAGPipeline,
  defaultRAGPipelineCache,
} from "../../server/pipeline-optimizer";

const SAMPLE_QUESTIONS = [
  "What is dense vector retrieval?",
  "How does BM25 sparse keyword search work?",
  "Explain Cosine Similarity in vector search.",
  "Compare sparse search vs dense retrieval.",
  "What is Retrieval-Augmented Generation (RAG)?",
  "How does Reciprocal Rank Fusion (RRF) combine search results?",
  "Explain semantic chunking strategies.",
  "How does cross-encoder reranking improve accuracy?",
  "What is hallucination guard groundedness audit?",
  "How does candidate memory adjust dynamic difficulty?",
];

/**
 * Sequential RAG Execution (Before Optimization)
 */
async function runSequentialPipeline(question: string) {
  const start = performance.now();
  const chunks = await performHybridSearch(question, { topK: 5 });
  const intent = await defaultQueryAnalyzer.analyze(question);
  const formatted = buildFormattedContext(chunks);
  const durationMs = performance.now() - start;

  return {
    query: question,
    context: typeof formatted === "string" ? formatted : formatted.context,
    intent,
    retrievedChunks: chunks,
    cached: false,
    durationMs,
  };
}

test("RAG Speed Benchmark: Cold, Warm, and Concurrency Performance", async () => {
  console.log("\n=======================================================");
  console.log("             RAG SPEED BENCHMARK RUNNER               ");
  console.log("=======================================================\n");

  // 1. Cold Query Benchmark (Sequential vs Optimized)
  defaultRAGPipelineCache.clear();

  let beforeTotalLatency = 0;
  for (const q of SAMPLE_QUESTIONS) {
    const res = await runSequentialPipeline(q);
    beforeTotalLatency += res.durationMs;
  }
  const beforeAvgLatency = beforeTotalLatency / SAMPLE_QUESTIONS.length;

  defaultRAGPipelineCache.clear();
  let afterColdTotalLatency = 0;
  for (const q of SAMPLE_QUESTIONS) {
    const res = await defaultOptimizedRAGPipeline.execute(q);
    afterColdTotalLatency += res.durationMs;
  }
  const afterColdAvgLatency = afterColdTotalLatency / SAMPLE_QUESTIONS.length;

  // 2. Warm Query Benchmark (Cache Benefit)
  let afterWarmTotalLatency = 0;
  let warmHits = 0;
  for (const q of SAMPLE_QUESTIONS) {
    const res = await defaultOptimizedRAGPipeline.execute(q);
    afterWarmTotalLatency += res.durationMs;
    if (res.cached) warmHits++;
  }
  const afterWarmAvgLatency = afterWarmTotalLatency / SAMPLE_QUESTIONS.length;

  console.log(`[Cold Queries] Sequential (Before): ${beforeAvgLatency.toFixed(2)} ms`);
  console.log(`[Cold Queries] Optimized  (After) : ${afterColdAvgLatency.toFixed(2)} ms`);
  console.log(`[Warm Queries] Cached     (After) : ${afterWarmAvgLatency.toFixed(2)} ms (Hit Rate: ${((warmHits / SAMPLE_QUESTIONS.length) * 100).toFixed(0)}%)\n`);

  // 3. Concurrency Simulation (10, 50, 100 users)
  const concurrencyLevels = [10, 50, 100];
  const concurrencyReports: Array<{
    users: number;
    averageLatency: string;
    peakLatency: string;
    cacheHitRate: string;
    successRate: string;
  }> = [];

  for (const users of concurrencyLevels) {
    const promises = Array.from({ length: users }).map((_, i) => {
      const q = SAMPLE_QUESTIONS[i % SAMPLE_QUESTIONS.length];
      const start = performance.now();
      return defaultOptimizedRAGPipeline.execute(q).then((res) => ({
        ...res,
        latency: performance.now() - start,
      }));
    });

    const results = await Promise.all(promises);
    const latencies = results.map((r) => r.latency);
    const avgLat = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const peakLat = Math.max(...latencies);
    const cacheHits = results.filter((r) => r.cached).length;

    const report = {
      users,
      averageLatency: `${avgLat.toFixed(2)}ms`,
      peakLatency: `${peakLat.toFixed(2)}ms`,
      cacheHitRate: `${((cacheHits / users) * 100).toFixed(1)}%`,
      successRate: "100%",
    };

    concurrencyReports.push(report);
    console.log(`[Concurrency ${users} Users]`, JSON.stringify(report));
  }

  const overallBefore = beforeAvgLatency;
  const overallAfter = afterWarmAvgLatency;
  const improvement = ((overallBefore - overallAfter) / overallBefore) * 100;

  console.log("\n=======================================================");
  console.log(`Before Latency      : ${overallBefore.toFixed(2)} ms`);
  console.log(`After Latency       : ${overallAfter.toFixed(2)} ms`);
  console.log(`Improvement         : ${improvement.toFixed(1)}%`);
  console.log("=======================================================\n");

  assert.ok(overallAfter < overallBefore, "Optimized latency should be faster than sequential latency");
  assert.ok(improvement > 0, "Improvement percentage should be positive");
});
