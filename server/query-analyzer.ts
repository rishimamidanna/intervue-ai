/**
 * server/query-analyzer.ts
 *
 * Query Understanding Layer (Milestone 7.11)
 *
 * Analyzes queries before retrieval to extract structured intent:
 * topic, intent type, difficulty level, required depth, and keywords.
 * Uses extracted metadata to dynamically optimize retrieval parameters and filters.
 *
 * Flow:
 *   Query → Query Analyzer → Structured Query Intent → Optimized Retrieval
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  StructuredQueryIntent,
  QueryIntentType,
  QueryRequiredDepth,
  RetrievalOptions,
  RetrievedChunk,
} from "@/types/rag";
import { StructuredQueryIntentSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { performHybridSearch } from "./retrieval-service";

// ---------------------------------------------------------------------------
// Interfaces & Contracts
// ---------------------------------------------------------------------------

export interface IQueryAnalyzerProvider {
  name: string;
  analyze(query: string): Promise<StructuredQueryIntent>;
}

// ---------------------------------------------------------------------------
// Domain Taxonomy & Topic Rules
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "cannot", "could", "did", "do",
  "does", "doing", "don't", "down", "during", "each", "few", "for", "from", "further",
  "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
  "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself",
  "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off",
  "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over",
  "own", "same", "she", "should", "so", "some", "such", "than", "that", "the",
  "their", "theirs", "them", "themselves", "then", "there", "these", "they",
  "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
  "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why",
  "with", "would", "you", "your", "yours", "yourself", "yourselves"
]);

interface TopicRule {
  name: string;
  keywords: string[];
  category: string;
  defaultDifficulty: "Beginner" | "Intermediate" | "Advanced";
}

const TOPIC_RULES: TopicRule[] = [
  {
    name: "Vector Embeddings",
    keywords: ["embedding", "embeddings", "dense vector", "vector space", "dimension", "representation"],
    category: "RAG Foundations",
    defaultDifficulty: "Beginner",
  },
  {
    name: "Vector Database",
    keywords: ["vector database", "chromadb", "pinecone", "milvus", "qdrant", "weaviate", "vector store"],
    category: "RAG Foundations",
    defaultDifficulty: "Beginner",
  },
  {
    name: "Cosine Similarity",
    keywords: ["cosine similarity", "dot product", "distance metric", "similarity score", "angular distance"],
    category: "RAG Foundations",
    defaultDifficulty: "Beginner",
  },
  {
    name: "Sparse Search (BM25)",
    keywords: ["bm25", "tf-idf", "sparse search", "keyword search", "lexical search", "inverted index"],
    category: "RAG Foundations",
    defaultDifficulty: "Intermediate",
  },
  {
    name: "Hybrid Retrieval",
    keywords: ["hybrid search", "hybrid retrieval", "reciprocal rank fusion", "rrf", "score fusion"],
    category: "RAG Foundations",
    defaultDifficulty: "Intermediate",
  },
  {
    name: "Candidate-Aware Ranking",
    keywords: ["candidate aware", "candidate relevance", "weakness targeting", "candidate profile"],
    category: "Candidate Intelligence",
    defaultDifficulty: "Intermediate",
  },
  {
    name: "RAG Evaluation Framework",
    keywords: ["ragas", "evaluation", "faithfulness", "answer relevance", "context precision", "context recall"],
    category: "Evaluation & Testing",
    defaultDifficulty: "Advanced",
  },
  {
    name: "Cross Encoder Reranking",
    keywords: ["cross encoder", "reranker", "reranking", "two-stage retrieval", "ms-marco"],
    category: "Advanced RAG",
    defaultDifficulty: "Advanced",
  },
  {
    name: "Multi Query Retrieval",
    keywords: ["multi query", "query expansion", "sub-query", "parallel retrieval"],
    category: "Advanced RAG",
    defaultDifficulty: "Advanced",
  },
  {
    name: "Context Quality Optimization",
    keywords: ["context optimization", "chunk deduplication", "context window", "noise reduction"],
    category: "Advanced RAG",
    defaultDifficulty: "Advanced",
  },
];

// ---------------------------------------------------------------------------
// Deterministic Query Analyzer Provider
// ---------------------------------------------------------------------------

export class DeterministicQueryAnalyzerProvider implements IQueryAnalyzerProvider {
  name = "deterministic-query-analyzer-v1";

  async analyze(query: string): Promise<StructuredQueryIntent> {
    const normalized = query.trim().toLowerCase();

    // 1. Extract Keywords
    const keywords = this.extractKeywords(query);

    // 2. Classify Intent
    const intent = this.classifyIntent(normalized);

    // 3. Extract Topic & Category
    const { topic, matchedDifficulty } = this.extractTopicAndDifficulty(normalized, keywords);

    // 4. Classify Difficulty
    const difficulty = matchedDifficulty || this.classifyDifficulty(normalized);

    // 5. Classify Required Depth
    const requiredDepth = this.classifyRequiredDepth(normalized);

    const intentData: StructuredQueryIntent = {
      query,
      intent,
      topic,
      difficulty,
      requiredDepth,
      keywords,
    };

    return strictValidate(
      StructuredQueryIntentSchema,
      intentData,
      "Structured Query Intent"
    );
  }

  private extractKeywords(query: string): string[] {
    const tokens = query
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

    // Deduplicate while maintaining order
    return Array.from(new Set(tokens));
  }

  private classifyIntent(query: string): QueryIntentType {
    if (/\b(compare|vs|versus|difference|differ|contrast|pros and cons)\b/i.test(query)) {
      return "comparison";
    }
    if (/\b(how to|how do|implement|code|build|step|steps|guide|configure|setup)\b/i.test(query)) {
      return "procedural";
    }
    if (/\b(evaluate|assess|benchmark|measure|metric|score|quality|accuracy)\b/i.test(query)) {
      return "evaluative";
    }
    if (/\b(what is|what are|explain|define|concept|meaning|overview)\b/i.test(query)) {
      return "conceptual";
    }
    if (/\b(who|when|where|which file|which version|exact|list)\b/i.test(query)) {
      return "factual";
    }
    return "exploratory";
  }

  private extractTopicAndDifficulty(
    query: string,
    keywords: string[]
  ): { topic: string; matchedDifficulty?: "Beginner" | "Intermediate" | "Advanced" } {
    for (const rule of TOPIC_RULES) {
      for (const kw of rule.keywords) {
        if (query.includes(kw)) {
          return {
            topic: rule.name,
            matchedDifficulty: rule.defaultDifficulty,
          };
        }
      }
    }

    // Fallback topic from top keyword or general domain
    if (keywords.length > 0) {
      const topKw = keywords[0];
      const capitalized = topKw.charAt(0).toUpperCase() + topKw.slice(1);
      return { topic: capitalized };
    }

    return { topic: "General Enterprise AI" };
  }

  private classifyDifficulty(query: string): "Beginner" | "Intermediate" | "Advanced" {
    if (/\b(basic|introduction|intro|what is|beginner|simple|overview|start)\b/i.test(query)) {
      return "Beginner";
    }
    if (/\b(advanced|optimization|reranking|cross-encoder|ragas|fine-tuning|architecture|deep dive)\b/i.test(query)) {
      return "Advanced";
    }
    return "Intermediate";
  }

  private classifyRequiredDepth(query: string): QueryRequiredDepth {
    if (/\b(in detail|deep dive|comprehensive|thorough|step by step|full|complete|architecture)\b/i.test(query)) {
      return "deep-dive";
    }
    if (/\b(brief|overview|summary|quick|in short|headline|simple)\b/i.test(query)) {
      return "overview";
    }
    return "standard";
  }
}

// ---------------------------------------------------------------------------
// Query Analyzer Service Engine
// ---------------------------------------------------------------------------

export class QueryAnalyzer {
  private provider: IQueryAnalyzerProvider;

  constructor(provider?: IQueryAnalyzerProvider) {
    this.provider = provider || new DeterministicQueryAnalyzerProvider();
  }

  /**
   * Sets active analyzer provider (modular strategy pattern).
   */
  setProvider(provider: IQueryAnalyzerProvider): void {
    this.provider = provider;
  }

  /**
   * Returns current provider info.
   */
  getInfo(): { name: string } {
    return { name: this.provider.name };
  }

  /**
   * Analyzes a query to produce structured intent metadata.
   */
  async analyze(query: string): Promise<StructuredQueryIntent> {
    return this.provider.analyze(query);
  }

  /**
   * Enhances retrieval options using extracted query intent metadata.
   *
   * @param intent - Extracted StructuredQueryIntent
   * @param baseOptions - Existing optional RetrievalOptions
   * @returns Enhanced RetrievalOptions
   */
  enhanceRetrievalOptions(
    intent: StructuredQueryIntent,
    baseOptions?: RetrievalOptions
  ): RetrievalOptions {
    const enhanced: RetrievalOptions = { ...baseOptions };

    // 1. Dynamic TopK selection based on required depth (if not manually overridden)
    if (!baseOptions?.topK) {
      switch (intent.requiredDepth) {
        case "overview":
          enhanced.topK = 3;
          break;
        case "deep-dive":
          enhanced.topK = 10;
          break;
        case "standard":
        default:
          enhanced.topK = 5;
          break;
      }
    }

    // 2. Filter Preservation & Optional Soft Filter Suggestion
    if (baseOptions?.filter) {
      enhanced.filter = { ...baseOptions.filter };
    }

    return enhanced;
  }

  /**
   * Analyzes query, applies intent-guided retrieval enhancements, and executes search.
   *
   * @param query - Input search query
   * @param baseOptions - Optional retrieval options
   * @returns Retrieval results and intent analysis metadata
   */
  async executeIntentGuidedSearch(
    query: string,
    baseOptions?: RetrievalOptions
  ): Promise<{ intent: StructuredQueryIntent; results: RetrievedChunk[] }> {
    const intent = await this.analyze(query);
    const enhancedOptions = this.enhanceRetrievalOptions(intent, baseOptions);
    const results = await performHybridSearch(query, enhancedOptions);

    return {
      intent,
      results,
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultQueryAnalyzer = new QueryAnalyzer();
