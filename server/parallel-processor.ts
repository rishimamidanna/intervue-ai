/**
 * server/parallel-processor.ts
 *
 * Parallel Processing Engine (Performance Milestone P3)
 *
 * Orchestrates 4 independent operations concurrently using Promise.allSettled:
 * 1. Retrieval (hybrid vector + BM25 search)
 * 2. Memory Lookup (candidate memory store & relevant history)
 * 3. Metadata Lookup (concept knowledge graph relationships)
 * 4. Candidate Analysis (candidate intelligence profile evaluation)
 *
 * Requirements:
 * - Preserves strict output order
 * - Implements robust error boundaries / fallback handling on task rejection
 * - Measures fine-grained timing metrics (retrievalMs, memoryLookupMs, metadataLookupMs, candidateAnalysisMs, totalParallelMs, timeSavedMs)
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  RetrievalOptions,
  MemoryHistoryItem,
  GraphRelationship,
  ParallelRAGResponse,
  ParallelTaskTimingMetrics,
  ParallelTaskStatuses,
} from "@/types/rag";
import type { CandidateIntelligenceProfile } from "@/types/candidate";
import { ParallelRAGResponseSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch } from "./retrieval-service";
import { defaultInterviewMemoryRAG } from "./interview-memory";
import { defaultKnowledgeGraphRAG } from "./concept-graph";
import { getCandidateIntelligenceProfile } from "./candidate-service";

// ---------------------------------------------------------------------------
// Helper: Task Timing Wrapper
// ---------------------------------------------------------------------------

interface TaskResult<T> {
  status: "fulfilled" | "rejected";
  value: T;
  durationMs: number;
}

async function executeTimedTask<T>(
  taskName: string,
  fn: () => Promise<T>,
  fallbackValue: T
): Promise<TaskResult<T>> {
  const start = performance.now();
  try {
    const val = await fn();
    const durationMs = Number((performance.now() - start).toFixed(2));
    return {
      status: "fulfilled",
      value: val,
      durationMs,
    };
  } catch (err) {
    const durationMs = Number((performance.now() - start).toFixed(2));
    console.warn(`[ParallelProcessor] Task '${taskName}' failed:`, err);
    return {
      status: "rejected",
      value: fallbackValue,
      durationMs,
    };
  }
}

// ---------------------------------------------------------------------------
// Parallel Processing Engine Class
// ---------------------------------------------------------------------------

export class ParallelRAGProcessor {
  /**
   * Executes 4 independent operations in parallel:
   * 1. Retrieval
   * 2. Memory Lookup
   * 3. Metadata Lookup
   * 4. Candidate Analysis
   *
   * @param query - Input query string
   * @param candidateId - Optional candidate ID
   * @param options - Optional RetrievalOptions
   * @returns ParallelRAGResponse
   */
  async executeParallelRAG(
    query: string,
    candidateId?: string,
    options?: RetrievalOptions
  ): Promise<ParallelRAGResponse> {
    const wallStart = performance.now();

    // 1. Define Independent Task 1: Retrieval
    const task1 = () => performHybridSearch(query, options);

    // 2. Define Independent Task 2: Memory Lookup
    const task2 = async () => {
      if (!candidateId) {
        return { candidateContext: "", relevantHistory: [] as MemoryHistoryItem[] };
      }
      const memory = await defaultInterviewMemoryRAG.getOrCreateMemory(candidateId);
      const relevantHistory = defaultInterviewMemoryRAG.retrieveRelevantHistory(query, memory);
      const candidateContext = defaultInterviewMemoryRAG.buildCandidateContext(
        candidateId,
        memory,
        relevantHistory
      );
      return { candidateContext, relevantHistory };
    };

    // 3. Define Independent Task 3: Metadata Lookup (Concept Graph)
    const task3 = async () => {
      const graph = defaultKnowledgeGraphRAG.getGraph();
      const allNodes = graph.exportGraph().nodes;
      const lowerQuery = query.toLowerCase();

      const matchedConcepts: string[] = [];
      for (const node of allNodes) {
        if (lowerQuery.includes(node.name.toLowerCase())) {
          matchedConcepts.push(node.name);
        }
      }

      if (matchedConcepts.length === 0) {
        // Fallback default keywords
        matchedConcepts.push("Hybrid Search", "Vector Embeddings");
      }

      return graph.findRelationships(matchedConcepts);
    };

    // 4. Define Independent Task 4: Candidate Analysis
    const task4 = async (): Promise<CandidateIntelligenceProfile | null> => {
      if (!candidateId) return null;
      return getCandidateIntelligenceProfile(candidateId);
    };

    // Execute all 4 independent operations concurrently with error boundaries
    const [res1, res2, res3, res4] = await Promise.all([
      executeTimedTask<RetrievedChunk[]>("retrieval", task1, []),
      executeTimedTask<{ candidateContext: string; relevantHistory: MemoryHistoryItem[] }>(
        "memoryLookup",
        task2,
        { candidateContext: "", relevantHistory: [] }
      ),
      executeTimedTask<GraphRelationship[]>("metadataLookup", task3, []),
      executeTimedTask<CandidateIntelligenceProfile | null>("candidateAnalysis", task4, null),
    ]);

    const totalParallelMs = Number((performance.now() - wallStart).toFixed(2));

    // Calculate timing metrics
    const retrievalMs = res1.durationMs;
    const memoryLookupMs = res2.durationMs;
    const metadataLookupMs = res3.durationMs;
    const candidateAnalysisMs = res4.durationMs;

    const sequentialEquivalentMs = Number(
      (retrievalMs + memoryLookupMs + metadataLookupMs + candidateAnalysisMs).toFixed(2)
    );
    const timeSavedMs = Number((sequentialEquivalentMs - totalParallelMs).toFixed(2));

    const timings: ParallelTaskTimingMetrics = {
      retrievalMs,
      memoryLookupMs,
      metadataLookupMs,
      candidateAnalysisMs,
      totalParallelMs,
      sequentialEquivalentMs,
      timeSavedMs,
    };

    const taskStatuses: ParallelTaskStatuses = {
      retrieval: res1.status,
      memoryLookup: res2.status,
      metadataLookup: res3.status,
      candidateAnalysis: res4.status,
    };

    // Assemble final response preserving output ordering
    const rawResponse: ParallelRAGResponse = {
      query,
      candidateId,
      results: res1.value,
      candidateContext: res2.value.candidateContext,
      relevantHistory: res2.value.relevantHistory,
      relationships: res3.value,
      candidateIntelligence: res4.value,
      timings,
      taskStatuses,
    };

    return strictValidate(
      ParallelRAGResponseSchema,
      rawResponse,
      "Parallel RAG Response"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultParallelProcessor = new ParallelRAGProcessor();
