import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultOptimizedRAGPipeline,
  defaultRAGPipelineCache,
} from "../../server/pipeline-optimizer";

test("1. Parallel pipeline execution retrieves chunks and intent concurrently", async () => {
  defaultRAGPipelineCache.clear();

  const query = "What is dense vector retrieval?";
  const response = await defaultOptimizedRAGPipeline.execute(query);

  assert.equal(response.query, query);
  assert.equal(response.cached, false);
  assert.ok(response.retrievedChunks.length > 0);
  assert.ok(response.context.length > 0);
  assert.ok(response.intent !== undefined);
});

test("2. Caching serves duplicate queries instantaneously with cached: true", async () => {
  const query = "What is dense vector retrieval?";

  // Second execution should hit cache
  const firstTime = performance.now();
  const response = await defaultOptimizedRAGPipeline.execute(query);
  const duration = performance.now() - firstTime;

  assert.equal(response.cached, true);
  assert.ok(duration < 15, `Cached execution should be under 15ms (got ${duration.toFixed(2)}ms)`);

  const stats = defaultRAGPipelineCache.getStats();
  assert.ok(stats.hits >= 1);
});

test("3. Duplicate computation removal reuses cached query intents across calls", async () => {
  defaultRAGPipelineCache.clear();

  const query1 = "Explain Cosine Similarity in vector search.";
  const query2 = "Explain Cosine Similarity in vector search.";

  const res1 = await defaultOptimizedRAGPipeline.execute(query1);
  const res2 = await defaultOptimizedRAGPipeline.execute(query2);

  assert.equal(res1.cached, false);
  assert.equal(res2.cached, true);
  assert.equal(res1.intent.topic, res2.intent.topic);
});
