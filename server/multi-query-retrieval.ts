/**
 * server/multi-query-retrieval.ts
 *
 * Multi Query Retrieval Layer (Milestone 7.10)
 *
 * Improves retrieval recall by expanding a single user query into multiple
 * diverse search queries, running them in parallel against the hybrid
 * retrieval engine, and merging deduplicated results into a single ranked set.
 *
 * Flow:
 *   User Query → Query Expansion → Multiple Queries → Parallel Retrieval → Merged Results
 *
 * Query expansion strategies:
 *   1. Synonym substitution — replaces key terms with known synonyms
 *   2. Perspective rephrasing — rewrites from different angles
 *   3. Specificity broadening — removes narrow qualifiers for broader recall
 *   4. Keyword decomposition — splits compound queries into sub-queries
 *
 * Design:
 *   - Modular: pluggable IQueryExpander interface
 *   - Configurable: control expanded query count, per-query top-k, final top-k
 *   - Deduplication: merges by chunkId, keeps highest score
 *   - Compatible: uses performHybridSearch from retrieval-service
 *
 * Owner: Member 2 (Advanced RAG)
 */

import type {
  RetrievedChunk,
  RetrievalOptions,
  MultiQueryConfig,
  MultiQueryRetrievalResponse,
} from "@/types/rag";
import { MultiQueryRetrievalResponseSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch } from "./retrieval-service";

// ---------------------------------------------------------------------------
// Query Expander Abstraction
// ---------------------------------------------------------------------------

/**
 * Interface contract for query expansion providers.
 * Implementations can use LLM-based expansion, synonym dictionaries,
 * or deterministic heuristics.
 */
export interface IQueryExpander {
  name: string;

  /**
   * Expands a single query into multiple diverse queries.
   * Must always include the original query as the first element.
   */
  expand(query: string, maxQueries: number): Promise<string[]>;
}

// ---------------------------------------------------------------------------
// Deterministic Query Expander (Heuristic Baseline)
// ---------------------------------------------------------------------------

/**
 * Domain-specific synonym map for RAG / AI / interview vocabulary.
 */
const SYNONYM_MAP: Record<string, string[]> = {
  "vector": ["embedding", "dense representation"],
  "embedding": ["vector", "dense representation"],
  "database": ["store", "storage", "index"],
  "search": ["retrieval", "query", "lookup"],
  "retrieval": ["search", "fetching", "lookup"],
  "similarity": ["closeness", "relevance", "distance"],
  "cosine": ["angular", "dot product"],
  "chunk": ["segment", "passage", "fragment"],
  "semantic": ["meaning-based", "contextual"],
  "llm": ["large language model", "language model"],
  "rag": ["retrieval augmented generation"],
  "rerank": ["re-score", "re-order"],
  "index": ["store", "database", "catalog"],
  "agent": ["autonomous system", "AI agent"],
  "prompt": ["instruction", "input template"],
  "model": ["neural network", "transformer"],
  "token": ["word piece", "subword"],
  "fine-tune": ["adapt", "specialize", "train"],
  "inference": ["prediction", "generation"],
  "context": ["surrounding information", "reference material"],
};

/**
 * Deterministic Query Expander.
 *
 * Generates diverse queries through four strategies:
 *   1. Synonym substitution
 *   2. Perspective rephrasing
 *   3. Specificity broadening
 *   4. Keyword decomposition
 */
export class DeterministicQueryExpander implements IQueryExpander {
  name = "deterministic-query-expander-v1";

  async expand(query: string, maxQueries: number): Promise<string[]> {
    const queries: string[] = [query]; // original always first
    const seen = new Set<string>([this.normalize(query)]);

    // Strategy 1: Synonym substitution
    const synonymVariants = this.generateSynonymVariants(query);
    for (const variant of synonymVariants) {
      if (queries.length >= maxQueries) break;
      const norm = this.normalize(variant);
      if (!seen.has(norm)) {
        queries.push(variant);
        seen.add(norm);
      }
    }

    // Strategy 2: Perspective rephrasing
    const rephrased = this.generateRephrases(query);
    for (const variant of rephrased) {
      if (queries.length >= maxQueries) break;
      const norm = this.normalize(variant);
      if (!seen.has(norm)) {
        queries.push(variant);
        seen.add(norm);
      }
    }

    // Strategy 3: Specificity broadening
    const broadened = this.generateBroadenedQuery(query);
    if (broadened && queries.length < maxQueries) {
      const norm = this.normalize(broadened);
      if (!seen.has(norm)) {
        queries.push(broadened);
        seen.add(norm);
      }
    }

    // Strategy 4: Keyword decomposition (for compound queries)
    const decomposed = this.decomposeQuery(query);
    for (const subQuery of decomposed) {
      if (queries.length >= maxQueries) break;
      const norm = this.normalize(subQuery);
      if (!seen.has(norm)) {
        queries.push(subQuery);
        seen.add(norm);
      }
    }

    return queries.slice(0, maxQueries);
  }

  /**
   * Generates synonym-substituted variants.
   */
  private generateSynonymVariants(query: string): string[] {
    const variants: string[] = [];
    const tokens = query.toLowerCase().split(/\s+/);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const synonyms = SYNONYM_MAP[token];
      if (synonyms && synonyms.length > 0) {
        // Generate one variant per synonym (up to 2 per token)
        for (let s = 0; s < Math.min(2, synonyms.length); s++) {
          const newTokens = [...tokens];
          newTokens[i] = synonyms[s];
          variants.push(this.capitalizeFirst(newTokens.join(" ")));
        }
      }
    }

    return variants;
  }

  /**
   * Generates perspective-rephrased queries.
   */
  private generateRephrases(query: string): string[] {
    const rephrases: string[] = [];
    const cleaned = query.replace(/[?.!]+$/, "").trim();

    // "What is X" → "Explain X", "How does X work"
    if (/^what\s+(is|are)\s+/i.test(cleaned)) {
      const subject = cleaned.replace(/^what\s+(is|are)\s+/i, "");
      rephrases.push(`Explain ${subject}`);
      rephrases.push(`How does ${subject} work`);
    }

    // "How does X work" → "Explain X", "What is X"
    if (/^how\s+(does|do|can)\s+/i.test(cleaned)) {
      const subject = cleaned.replace(/^how\s+(does|do|can)\s+(.+?)\s*(work|function|operate)?$/i, "$2");
      rephrases.push(`Explain ${subject}`);
      rephrases.push(`What is ${subject}`);
    }

    // "Explain X" → "What is X", "How does X work"
    if (/^explain\s+/i.test(cleaned)) {
      const subject = cleaned.replace(/^explain\s+/i, "");
      rephrases.push(`What is ${subject}`);
      rephrases.push(`How does ${subject} work`);
    }

    // Generic: prepend "Describe" or "Define"
    if (rephrases.length === 0) {
      rephrases.push(`Describe ${cleaned}`);
      rephrases.push(`Define ${cleaned}`);
    }

    return rephrases;
  }

  /**
   * Broadens a query by removing narrow qualifiers.
   */
  private generateBroadenedQuery(query: string): string | null {
    const narrowQualifiers = [
      /\s+in detail/gi,
      /\s+specifically/gi,
      /\s+exactly/gi,
      /\s+precisely/gi,
      /\s+step by step/gi,
      /\s+with examples?/gi,
    ];

    let broadened = query;
    for (const pattern of narrowQualifiers) {
      broadened = broadened.replace(pattern, "");
    }

    broadened = broadened.trim();
    return broadened !== query ? broadened : null;
  }

  /**
   * Decomposes compound queries into sub-queries.
   * Splits on "and", commas, or semicolons when the query has multiple topics.
   */
  private decomposeQuery(query: string): string[] {
    const subQueries: string[] = [];

    // Split on " and " or "," for compound queries
    const parts = query
      .split(/\s+and\s+|,\s*/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 3);

    if (parts.length > 1) {
      for (const part of parts) {
        subQueries.push(this.capitalizeFirst(part));
      }
    }

    return subQueries;
  }

  /**
   * Normalizes a query for deduplication comparison.
   */
  private normalize(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Capitalizes the first letter of a string.
   */
  private capitalizeFirst(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

// ---------------------------------------------------------------------------
// Multi Query Retrieval Engine
// ---------------------------------------------------------------------------

/**
 * Default multi-query configuration.
 */
export const DEFAULT_MULTI_QUERY_CONFIG: MultiQueryConfig = {
  maxExpandedQueries: 4,
  perQueryTopK: 10,
  finalTopK: 5,
};

/**
 * Multi Query Retrieval Engine.
 *
 * Expands a single user query into multiple diverse queries, executes them
 * in parallel against the hybrid retrieval service, and merges the results
 * into a single deduplicated, ranked set.
 */
export class MultiQueryRetriever {
  private expander: IQueryExpander;
  private config: MultiQueryConfig;

  constructor(
    expander?: IQueryExpander,
    config?: Partial<MultiQueryConfig>
  ) {
    this.expander = expander || new DeterministicQueryExpander();
    this.config = { ...DEFAULT_MULTI_QUERY_CONFIG, ...config };
  }

  /**
   * Returns current expander name and active configuration.
   */
  getInfo(): { expanderName: string; config: MultiQueryConfig } {
    return {
      expanderName: this.expander.name,
      config: { ...this.config },
    };
  }

  /**
   * Swaps the query expansion provider.
   */
  setExpander(expander: IQueryExpander): void {
    this.expander = expander;
  }

  /**
   * Updates configuration.
   */
  setConfig(config: Partial<MultiQueryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Executes multi-query retrieval.
   *
   * @param query - Original user query
   * @param options - Optional retrieval options passed through to hybrid search
   * @param configOverride - Optional per-call config override
   * @returns MultiQueryRetrievalResponse with expanded queries and merged results
   */
  async retrieve(
    query: string,
    options?: RetrievalOptions,
    configOverride?: Partial<MultiQueryConfig>
  ): Promise<MultiQueryRetrievalResponse> {
    const startTime = Date.now();
    const activeConfig = { ...this.config, ...configOverride };

    // 1. Expand the query into multiple diverse queries
    const generatedQueries = await this.expander.expand(
      query,
      activeConfig.maxExpandedQueries
    );

    // 2. Execute parallel retrieval for each expanded query
    const searchPromises = generatedQueries.map((q) =>
      performHybridSearch(q, {
        topK: activeConfig.perQueryTopK,
        filter: options?.filter,
        hybridConfig: options?.hybridConfig,
        minScore: options?.minScore,
      })
    );

    const allResults = await Promise.all(searchPromises);

    // 3. Merge and deduplicate
    const totalCandidatesBeforeMerge = allResults.reduce(
      (sum, r) => sum + r.length,
      0
    );

    const mergedMap = new Map<string, RetrievedChunk>();

    for (const resultSet of allResults) {
      for (const chunk of resultSet) {
        const existing = mergedMap.get(chunk.chunkId);
        if (!existing || chunk.score > existing.score) {
          // Keep the highest-scoring version of each chunk
          mergedMap.set(chunk.chunkId, { ...chunk });
        }
      }
    }

    // 4. Rank by score descending and trim to finalTopK
    const dedupedResults = Array.from(mergedMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, activeConfig.finalTopK);

    const durationMs = Date.now() - startTime;

    const rawResponse: MultiQueryRetrievalResponse = {
      originalQuery: query,
      generatedQueries,
      results: dedupedResults,
      totalCandidatesBeforeMerge,
      totalAfterDedup: mergedMap.size,
      durationMs,
      config: activeConfig,
    };

    return strictValidate(
      MultiQueryRetrievalResponseSchema,
      rawResponse,
      "Multi Query Retrieval Response"
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton Instance
// ---------------------------------------------------------------------------

/**
 * Singleton default MultiQueryRetriever instance.
 */
export const defaultMultiQueryRetriever = new MultiQueryRetriever();
