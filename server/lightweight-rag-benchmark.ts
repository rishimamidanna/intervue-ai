import fs from "node:fs";
import path from "node:path";
import type {
  LightweightBenchmarkItem,
  LightweightBenchmarkReport,
} from "@/types/rag";
import { LightweightBenchmarkReportSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch } from "./retrieval-service";
import { buildFormattedContext } from "./context-builder";

export class LightweightRAGBenchmarkRunner {
  /**
   * Runs the lightweight RAG benchmark dataset and generates quality metrics.
   *
   * @param dataset - Optional custom dataset array or loads default JSON
   * @returns LightweightBenchmarkReport
   */
  async runBenchmark(
    dataset?: LightweightBenchmarkItem[]
  ): Promise<LightweightBenchmarkReport> {
    let items = dataset;

    if (!items || items.length === 0) {
      try {
        const datasetPath = path.join(process.cwd(), "data", "rag_benchmark_dataset.json");
        const fileContent = fs.readFileSync(datasetPath, "utf-8");
        items = JSON.parse(fileContent) as LightweightBenchmarkItem[];
      } catch {
        items = [];
      }
    }

    if (!items || items.length === 0) {
      return {
        totalQuestions: 0,
        retrievalScore: "0.0%",
        contextScore: "0.0%",
        averageLatency: "0.0ms",
        overallScore: "0.0%",
      };
    }

    let totalRetrievalScoreSum = 0;
    let totalContextScoreSum = 0;
    let totalLatencySum = 0;

    for (const item of items) {
      const startTime = performance.now();

      // 1. Measure Retrieval Latency & Quality
      const retrievalStart = performance.now();
      const chunks = await performHybridSearch(item.question, { topK: 5 });
      const retrievalLatency = performance.now() - retrievalStart;

      // 2. Measure Context Building Latency
      const contextStart = performance.now();
      const formattedContext = buildFormattedContext(chunks);
      const contextLatency = performance.now() - contextStart;

      const totalItemLatency = performance.now() - startTime;
      totalLatencySum += totalItemLatency;

      // Check Retrieval Quality: Concept & Topic presence in chunks
      const expectedElements = [...(item.expectedConcepts || []), ...(item.expectedTopics || [])];
      let retrievalHits = 0;

      for (const expected of expectedElements) {
        const normExpected = expected.toLowerCase().trim();
        const terms = normExpected.split(/\s+/).filter((t) => t.length > 2);

        const hasMatch = chunks.some((chunk) => {
          const topic = String(chunk.metadata.topic || "").toLowerCase();
          const concept = String(chunk.metadata.concept || "").toLowerCase();
          const category = String(chunk.metadata.category || "").toLowerCase();
          const content = chunk.content.toLowerCase();

          return (
            topic.includes(normExpected) ||
            concept.includes(normExpected) ||
            category.includes(normExpected) ||
            content.includes(normExpected) ||
            (terms.length > 0 && terms.some((term) => content.includes(term)))
          );
        });

        if (hasMatch) retrievalHits++;
      }

      const itemRetrievalScore =
        expectedElements.length > 0 ? retrievalHits / expectedElements.length : 1.0;
      totalRetrievalScoreSum += itemRetrievalScore;

      // Check Context Quality:
      // a. Relevant chunks included (scores >= 0.30 or matched concept)
      let relevantCount = 0;
      for (const chunk of chunks) {
        const score = chunk.finalScore ?? chunk.score ?? 0;
        if (score >= 0.30) {
          relevantCount++;
        }
      }
      const relevanceRatio = chunks.length > 0 ? relevantCount / chunks.length : 1.0;

      // b. Duplicate chunks avoided
      const uniqueChunkIds = new Set(chunks.map((c) => c.chunkId));
      const noDuplicatesRatio = chunks.length > 0 ? uniqueChunkIds.size / chunks.length : 1.0;

      // c. Sources available
      const contextString =
        typeof formattedContext === "string"
          ? formattedContext
          : (formattedContext as any).context ||
            (formattedContext as any).formattedContext ||
            "";
      const sourcesAvailable = contextString.trim().length > 0 ? 1.0 : 0.0;

      const itemContextScore = (relevanceRatio + noDuplicatesRatio + sourcesAvailable) / 3;
      totalContextScoreSum += itemContextScore;
    }

    const count = items.length;
    const avgRetrieval = count > 0 ? totalRetrievalScoreSum / count : 0;
    const avgContext = count > 0 ? totalContextScoreSum / count : 0;
    const avgLatency = count > 0 ? totalLatencySum / count : 0;
    const overall = (avgRetrieval + avgContext) / 2;

    const report: LightweightBenchmarkReport = {
      totalQuestions: count,
      retrievalScore: `${(avgRetrieval * 100).toFixed(1)}%`,
      contextScore: `${(avgContext * 100).toFixed(1)}%`,
      averageLatency: `${avgLatency.toFixed(1)}ms`,
      overallScore: `${(overall * 100).toFixed(1)}%`,
    };

    return strictValidate(
      LightweightBenchmarkReportSchema,
      report,
      "Lightweight Benchmark Report"
    );
  }
}

export const defaultLightweightRAGBenchmarkRunner = new LightweightRAGBenchmarkRunner();
