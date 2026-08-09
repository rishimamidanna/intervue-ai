import assert from "node:assert/strict";
import test from "node:test";
import { defaultLightweightRAGBenchmarkRunner } from "../../server/lightweight-rag-benchmark";

test("RAG Quality Benchmark runs over 15 sample questions and outputs report", async () => {
  const report = await defaultLightweightRAGBenchmarkRunner.runBenchmark();

  console.log("\n=== RAG QUALITY BENCHMARK REPORT ===");
  console.log(JSON.stringify(report, null, 2));
  console.log("===================================\n");

  assert.equal(report.totalQuestions, 15);
  assert.ok(report.retrievalScore.endsWith("%"));
  assert.ok(report.contextScore.endsWith("%"));
  assert.ok(report.averageLatency.endsWith("ms"));
  assert.ok(report.overallScore.endsWith("%"));

  const retrievalNum = parseFloat(report.retrievalScore);
  const contextNum = parseFloat(report.contextScore);
  const overallNum = parseFloat(report.overallScore);

  assert.ok(!isNaN(retrievalNum), "Retrieval score should be a number");
  assert.ok(!isNaN(contextNum), "Context score should be a number");
  assert.ok(!isNaN(overallNum), "Overall score should be a number");
});
