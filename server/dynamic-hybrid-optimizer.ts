/**
 * server/dynamic-hybrid-optimizer.ts
 *
 * Dynamic Hybrid Search Optimization Layer (Milestone 7.18)
 *
 * Automatically and dynamically optimizes search fusion weights (Semantic vs BM25)
 * depending on query intent and classification before running hybrid search.
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  RetrievedChunk,
  RetrievalOptions,
  DynamicHybridDecision,
  DynamicHybridWeightConfig,
} from "@/types/rag";
import { DynamicHybridDecisionSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch } from "./retrieval-service";

export class DynamicHybridOptimizer {
  /**
   * Evaluates query classification and returns adaptive weights.
   *
   * @param query - Input query string
   * @returns DynamicHybridDecision
   */
  planWeights(query: string): DynamicHybridDecision {
    const cleaned = query.trim().toLowerCase();

    let queryType = "standard";
    let weights: DynamicHybridWeightConfig = { semanticWeight: 0.5, bm25Weight: 0.5 };
    let explanation = "Standard exploratory query: adopting a balanced hybrid retrieval weight config.";

    // 1. Concept / Comparison queries (high semantic value)
    const isConcept = /\b(explain|compare|versus|vs|difference|conceptual|how does|why|similarity|relationship)\b/i.test(cleaned);

    // 2. Definition / Lexical / Factual queries (high keyword specificity value)
    const isDefinition = /\b(what is|what are|define|definition|exact|list|syntax|code|metrics|command|path|file)\b/i.test(cleaned);

    if (isConcept && !isDefinition) {
      queryType = "concept";
      weights = { semanticWeight: 0.7, bm25Weight: 0.3 };
      explanation = "Conceptual query focusing on high-level definitions, architectural comparisons, or vector space alignment: prioritizing dense semantic search.";
    } else if (isDefinition) {
      queryType = "definition";
      weights = { semanticWeight: 0.4, bm25Weight: 0.6 };
      explanation = "Definition/lexical query requiring exact term frequency matching, syntax lookup, or specific keywords: prioritizing sparse BM25 retrieval.";
    }

    const decision: DynamicHybridDecision = {
      query,
      queryType,
      weights,
      explanation,
    };

    return strictValidate(
      DynamicHybridDecisionSchema,
      decision,
      "Dynamic Hybrid Decision"
    );
  }

  /**
   * Executes hybrid search with dynamically planned weights.
   *
   * @param query - Input search query
   * @param options - Optional RetrievalOptions passed to hybrid search
   * @returns Retrieved chunks and weight decision
   */
  async executeAdaptiveSearch(
    query: string,
    options?: RetrievalOptions
  ): Promise<{ decision: DynamicHybridDecision; results: RetrievedChunk[] }> {
    const decision = this.planWeights(query);

    const adaptiveOptions: RetrievalOptions = {
      ...options,
      hybridConfig: {
        ...options?.hybridConfig,
        semanticWeight: decision.weights.semanticWeight,
        bm25Weight: decision.weights.bm25Weight,
      },
    };

    const results = await performHybridSearch(query, adaptiveOptions);

    return {
      decision,
      results,
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultDynamicHybridOptimizer = new DynamicHybridOptimizer();
