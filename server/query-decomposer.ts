/**
 * server/query-decomposer.ts
 *
 * Query Decomposition Layer (Milestone 7.17)
 *
 * Breaks down complex, multi-topic technical queries into clear, focused sub-questions,
 * executes parallel hybrid search, and merges context results back together.
 *
 * Flow:
 *   Complex Question → Question Analyzer → Sub Questions → Independent Retrieval → Merged Context
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  RetrievedChunk,
  RetrievalOptions,
  QueryDecompositionResponse,
} from "@/types/rag";
import { QueryDecompositionResponseSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch } from "./retrieval-service";

export class QueryDecomposer {
  /**
   * Decomposes a complex technical question into clear, independent sub-questions.
   * Preserves original query intent and removes duplicate entries.
   *
   * @param query - Original search query
   * @returns Array of sub-question strings
   */
  decompose(query: string): string[] {
    const cleaned = query.trim().replace(/[?.!]+$/, "");
    const subQuestions: string[] = [];

    // Helper: Normalize & capitalize first letter
    const formatQuestion = (str: string) => {
      const trimmed = str.trim();
      if (!trimmed) return "";
      const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      return capitalized.endsWith("?") ? capitalized : `${capitalized}?`;
    };

    // 1. Detect Comparison Queries (e.g. "Explain X and compare it with Y")
    const comparisonRegex = /(?:explain|compare|difference|versus|vs)\s+(.+?)\s+(?:and|with|vs|versus)\s+(.+)/i;
    const match = cleaned.match(comparisonRegex);

    if (match && match.length >= 3) {
      const topicA = match[1].replace(/(?:compare|explain|difference|between|it)\s+/gi, "").trim();
      const topicB = match[2].replace(/(?:compare|explain|difference|between|it|with|v[ss]?|versus)\s+/gi, "").trim();

      subQuestions.push(formatQuestion(`What is ${topicA}`));
      subQuestions.push(formatQuestion(`How does ${topicA} work`));
      subQuestions.push(formatQuestion(`What is ${topicB}`));
      subQuestions.push(formatQuestion(`Difference between ${topicA} and ${topicB}`));
    } else {
      // 2. Conjunction splitting for multi-topic queries (e.g., "RAG and prompt engineering")
      const clauses = cleaned.split(/\s+and\s+|,\s*|\s+coupled\s+with\s+/i);
      if (clauses.length > 1) {
        for (const clause of clauses) {
          const subject = clause.replace(/^(?:explain|describe|what is|how do|implement)\s+/gi, "").trim();
          if (subject.length > 2) {
            subQuestions.push(formatQuestion(`What is ${subject}`));
            subQuestions.push(formatQuestion(`Explain ${subject}`));
          }
        }
      }
    }

    // Fallback: if no split matches, rephrase the original query
    if (subQuestions.length === 0) {
      subQuestions.push(formatQuestion(cleaned));
    }

    // Deduplicate sub-questions while preserving order
    const seen = new Set<string>();
    const uniqueQuestions: string[] = [];

    for (const q of subQuestions) {
      const norm = q.toLowerCase().trim();
      if (q && !seen.has(norm)) {
        uniqueQuestions.push(q);
        seen.add(norm);
      }
    }

    return uniqueQuestions;
  }

  /**
   * Executes multi-stage retrieval: decomposes query, retrieves parallel context, and merges.
   *
   * @param query - Input search query
   * @param options - Optional RetrievalOptions passed to hybrid retrieval
   * @returns QueryDecompositionResponse
   */
  async executeDecomposedSearch(
    query: string,
    options?: RetrievalOptions
  ): Promise<QueryDecompositionResponse> {
    const startTime = performance.now();

    // 1. Decompose query into sub-questions
    const subQuestions = this.decompose(query);

    // 2. Execute parallel hybrid searches
    const searchPromises = subQuestions.map((subQ) =>
      performHybridSearch(subQ, {
        topK: options?.topK ?? 5,
        filter: options?.filter,
        minScore: options?.minScore,
      })
    );

    const allResults = await Promise.all(searchPromises);

    // 3. Merge and deduplicate context results
    const mergedMap = new Map<string, RetrievedChunk>();

    for (const resultSet of allResults) {
      for (const chunk of resultSet) {
        const existing = mergedMap.get(chunk.chunkId);
        const chunkScore = chunk.finalScore ?? chunk.score;
        const existingScore = existing ? (existing.finalScore ?? existing.score) : -Infinity;

        if (!existing || chunkScore > existingScore) {
          mergedMap.set(chunk.chunkId, { ...chunk });
        }
      }
    }

    // 4. Sort merged results by score and slice to topK
    const topK = options?.topK ?? 5;
    const finalResults = Array.from(mergedMap.values())
      .sort((a, b) => (b.finalScore ?? b.score) - (a.finalScore ?? a.score))
      .slice(0, topK);

    const durationMs = Number((performance.now() - startTime).toFixed(2));

    const response: QueryDecompositionResponse = {
      originalQuery: query,
      subQuestions,
      results: finalResults,
      durationMs,
    };

    return strictValidate(
      QueryDecompositionResponseSchema,
      response,
      "Query Decomposition Response"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultQueryDecomposer = new QueryDecomposer();
