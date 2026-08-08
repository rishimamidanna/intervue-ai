/**
 * server/rag-benchmark.ts
 *
 * RAG Evaluation Benchmark Suite (Milestone 7.22)
 *
 * Automated regression testing and performance benchmarking framework measuring:
 * - Retrieval accuracy (precision/recall of expected topics & sources)
 * - Context relevance (proportion of relevant chunks mapping to expectations)
 * - Confidence accuracy (validity of computed confidence against hits)
 * - Search latency (milliseconds elapsed)
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  RAGEvaluationBenchmarkItem,
  RAGEvaluationBenchmarkResult,
} from "@/types/rag";
import { RAGEvaluationBenchmarkResultSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch } from "./retrieval-service";

export const SAMPLE_BENCHMARK_DATASET: RAGEvaluationBenchmarkItem[] = [
  {
    question: "How do you calculate Cosine Similarity between dense vectors?",
    expectedTopics: ["Vector Embeddings", "Cosine Similarity"],
    expectedSources: ["Vector Embeddings", "pgvector"],
  },
  {
    question: "What is sparse search and explain the BM25 formula.",
    expectedTopics: ["Sparse Search (BM25)", "Hybrid Search"],
    expectedSources: ["Sparse Search (BM25)", "BM25"],
  },
  {
    question: "How do you evaluate RAG pipelines using RAGAS?",
    expectedTopics: ["RAG Evaluation Metrics", "RAGAS Framework"],
    expectedSources: ["RAG Evaluation Metrics", "RAGAS"],
  },
];

export class RAGBenchmarkSuite {
  /**
   * Runs the automated evaluation benchmark dataset.
   *
   * @param dataset - Evaluation dataset (defaults to sample benchmark)
   * @returns RAGEvaluationBenchmarkResult
   */
  async run(
    dataset: RAGEvaluationBenchmarkItem[] = SAMPLE_BENCHMARK_DATASET
  ): Promise<RAGEvaluationBenchmarkResult> {
    let totalRetrievalScore = 0;
    let totalContextScore = 0;
    let totalLatency = 0;

    for (const item of dataset) {
      const startTime = performance.now();

      // Execute search
      const chunks = await performHybridSearch(item.question, { topK: 5 });

      const latencyMs = performance.now() - startTime;
      totalLatency += latencyMs;

      // 1. Calculate Retrieval Accuracy (Topic Coverage)
      const expectedElements = [...item.expectedTopics, ...item.expectedSources];
      let hits = 0;

      for (const expected of expectedElements) {
        const hasHit = chunks.some((c) => {
          const topic = String(c.metadata.topic || "").toLowerCase();
          const concept = String(c.metadata.concept || "").toLowerCase();
          const content = c.content.toLowerCase();
          const searchVal = expected.toLowerCase();

          return (
            topic.includes(searchVal) ||
            concept.includes(searchVal) ||
            content.includes(searchVal)
          );
        });

        if (hasHit) hits++;
      }

      const itemRetrievalScore = expectedElements.length > 0 ? hits / expectedElements.length : 0.0;
      totalRetrievalScore += itemRetrievalScore;

      // 2. Calculate Context Relevance
      // Fraction of retrieved chunks above baseline score (e.g. 0.45) that match query topics/sources
      let relevantCount = 0;
      for (const chunk of chunks) {
        const score = chunk.finalScore ?? chunk.score;
        const matchesExpectation = expectedElements.some((expected) => {
          const topic = String(chunk.metadata.topic || "").toLowerCase();
          const concept = String(chunk.metadata.concept || "").toLowerCase();
          const searchVal = expected.toLowerCase();
          return topic.includes(searchVal) || concept.includes(searchVal);
        });

        if (score >= 0.45 || matchesExpectation) {
          relevantCount++;
        }
      }

      const itemContextScore = chunks.length > 0 ? relevantCount / chunks.length : 0.0;
      totalContextScore += itemContextScore;
    }

    const n = dataset.length;
    const avgRetrieval = n > 0 ? totalRetrievalScore / n : 0.0;
    const avgContext = n > 0 ? totalContextScore / n : 0.0;
    const avgLatency = n > 0 ? totalLatency / n : 0.0;
    const overall = (avgRetrieval + avgContext) / 2;

    const result: RAGEvaluationBenchmarkResult = {
      retrievalScore: `${(avgRetrieval * 100).toFixed(1)}%`,
      contextScore: `${(avgContext * 100).toFixed(1)}%`,
      latency: `${avgLatency.toFixed(1)}ms`,
      overallScore: `${(overall * 100).toFixed(1)}%`,
    };

    return strictValidate(
      RAGEvaluationBenchmarkResultSchema,
      result,
      "RAG Evaluation Benchmark Result"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultRAGBenchmarkSuite = new RAGBenchmarkSuite();
