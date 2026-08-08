/**
 * server/retrieval-service.ts
 *
 * Retrieval Architecture & Semantic Retrieval Engine (Milestone 6.1 & 6.2)
 *
 * Flow:
 * Query -> Query Embedding -> Vector Similarity Search -> Top-K Relevant Chunks
 *
 * Provides a clean, modular retrieval abstraction layer supporting pluggable
 * retrieval providers (Semantic Vector Retrieval, BM25 Keyword Retrieval, Hybrid Fusion Retrieval).
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  RetrievalResponse,
  RetrievalOptions,
  RetrievalSource,
  ChunkMetadata,
  CurriculumChunk,
} from "@/types/rag";
import {
  RetrievalResponseSchema,
  RetrievedChunkSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import {
  EmbeddingService,
  defaultEmbeddingService,
  generateAllCurriculumEmbeddings,
} from "./embedding-service";
import {
  VectorStorageService,
  defaultVectorStorageService,
} from "./vector-storage-service";

// ---------------------------------------------------------------------------
// Math Utility: Cosine Similarity
// ---------------------------------------------------------------------------

/**
 * Calculates cosine similarity between two vector float arrays.
 * Bounded strictly in range [-1.0, 1.0].
 *
 * @param vecA - Candidate vector A
 * @param vecB - Candidate vector B
 * @returns Cosine similarity float score
 */
export function calculateCosineSimilarity(
  vecA: number[],
  vecB: number[]
): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Number(similarity.toFixed(6));
}

// ---------------------------------------------------------------------------
// Retrieval Provider Contract
// ---------------------------------------------------------------------------

/**
 * Interface contract for all replaceable retrieval providers.
 */
export interface IRetrievalProvider {
  name: string;
  sourceType: RetrievalSource;
  retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]>;
}

// ---------------------------------------------------------------------------
// Semantic Retrieval Provider (Milestone 6.2 Implementation)
// ---------------------------------------------------------------------------

/**
 * Real Semantic Retrieval Provider.
 * Converts user queries into vector embeddings, performs Cosine Similarity vector search
 * against vector storage, and returns Top-K ranked RetrievedChunks.
 */
export class SemanticRetrievalProvider implements IRetrievalProvider {
  name = "semantic-retrieval-provider";
  sourceType: RetrievalSource = "semantic";

  private embeddingService: EmbeddingService;
  private vectorStorageService: VectorStorageService;

  constructor(
    embeddingService?: EmbeddingService,
    vectorStorageService?: VectorStorageService
  ) {
    this.embeddingService = embeddingService || defaultEmbeddingService;
    this.vectorStorageService =
      vectorStorageService || defaultVectorStorageService;
  }

  /**
   * Performs semantic similarity retrieval for a given query string.
   */
  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]> {
    const topK = options?.topK || 5;
    const minScore = options?.minScore ?? -1.0;
    const filter = options?.filter;

    // 1. Ensure storage is populated with curriculum vector records
    let storedRecords = await this.vectorStorageService.getAllRecords();
    if (storedRecords.length === 0) {
      const embeddings = await generateAllCurriculumEmbeddings();
      storedRecords = await this.vectorStorageService.storeEmbeddings(embeddings);
    }

    // 2. Generate Query Vector Embedding
    const queryChunk: CurriculumChunk = {
      chunkId: "query-temp-id",
      day: filter?.day || 1,
      topic: "Query Search",
      concept: query,
      content: query,
      keywords: [query.toLowerCase()],
      metadata: {
        keywords: [query.toLowerCase()],
        category: filter?.category || "General Search",
        difficulty: filter?.difficulty || "Beginner",
        sourceRef: { file: "query.json", day: 1, uri: "query#search" },
      },
    };

    const queryEmbedding = await this.embeddingService.embed(queryChunk);
    const queryVector = queryEmbedding.vector;

    // 3. Filter candidates if metadata filter options are specified
    let candidates = storedRecords;
    if (filter) {
      if (typeof filter.day === "number") {
        candidates = candidates.filter(
          (r) => r.metadata.sourceRef.day === filter.day
        );
      }
      if (filter.category) {
        candidates = candidates.filter(
          (r) =>
            r.metadata.category.toLowerCase() ===
            filter.category!.toLowerCase()
        );
      }
      if (filter.difficulty) {
        candidates = candidates.filter(
          (r) => r.metadata.difficulty === filter.difficulty
        );
      }
    }

    // 4. Calculate similarity scores and rank candidates
    const scoredResults: RetrievedChunk[] = candidates.map((record) => {
      const score = calculateCosineSimilarity(queryVector, record.vector);
      return {
        chunkId: record.chunkId,
        content: record.content,
        metadata: record.metadata,
        score,
        retrievalSource: "semantic",
      };
    });

    const filteredResults = scoredResults
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score);

    return filteredResults.slice(0, topK);
  }
}

// ---------------------------------------------------------------------------
// BM25 & Hybrid Architecture Stubs
// ---------------------------------------------------------------------------

/**
 * Mock BM25 Retrieval Provider.
 * Architecture stub ready for future BM25 keyword matching implementation.
 */
export class MockBM25RetrievalProvider implements IRetrievalProvider {
  name = "mock-bm25-retrieval-provider";
  sourceType: RetrievalSource = "bm25";

  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]> {
    const topK = options?.topK || 3;
    const sampleMetadata: ChunkMetadata = {
      keywords: ["bm25", "keywords", "lexical search"],
      category: "RAG Foundations",
      difficulty: "Intermediate",
      sourceRef: {
        file: "curriculum.json",
        day: 2,
        uri: "data/curriculum.json#day=2",
      },
    };

    const mockResults: RetrievedChunk[] = [
      {
        chunkId: "chunk-day-02-concept-day-2-fixed-size-chunking",
        content: `BM25 lexical match for query: "${query}". Keyword frequency and inverse document frequency scoring.`,
        metadata: sampleMetadata,
        score: 14.52,
        retrievalSource: "bm25",
      },
    ];

    return mockResults.slice(0, topK);
  }
}

/**
 * Mock Hybrid Retrieval Provider.
 * Architecture stub ready for future reciprocal rank fusion (RRF) hybrid implementation.
 */
export class MockHybridRetrievalProvider implements IRetrievalProvider {
  name = "mock-hybrid-retrieval-provider";
  sourceType: RetrievalSource = "hybrid";

  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]> {
    const topK = options?.topK || 3;
    const sampleMetadata: ChunkMetadata = {
      keywords: ["hybrid search", "rrf", "fused retrieval"],
      category: "RAG Foundations",
      difficulty: "Advanced",
      sourceRef: {
        file: "curriculum.json",
        day: 3,
        uri: "data/curriculum.json#day=3",
      },
    };

    const mockResults: RetrievedChunk[] = [
      {
        chunkId: "chunk-day-03-concept-day-3-hybrid-search",
        content: `Hybrid fused match for query: "${query}". Fusing vector similarity with BM25 keyword ranks.`,
        metadata: sampleMetadata,
        score: 0.98,
        retrievalSource: "hybrid",
      },
    ];

    return mockResults.slice(0, topK);
  }
}

// ---------------------------------------------------------------------------
// Retrieval Service Manager
// ---------------------------------------------------------------------------

/**
 * Core Retrieval Service Orchestrator.
 * Manages registered retrieval providers and executes validated search queries.
 */
export class RetrievalService {
  private activeProvider: IRetrievalProvider;
  private registeredProviders = new Map<string, IRetrievalProvider>();

  constructor(provider?: IRetrievalProvider) {
    const defaultProvider = provider || new SemanticRetrievalProvider();
    this.activeProvider = defaultProvider;
    this.registerProvider(defaultProvider);
  }

  /**
   * Registers a retrieval provider instance.
   */
  registerProvider(provider: IRetrievalProvider): void {
    this.registeredProviders.set(provider.name, provider);
    this.registeredProviders.set(provider.sourceType, provider);
  }

  /**
   * Swaps the active retrieval provider dynamically.
   */
  setProvider(providerNameOrInstance: string | IRetrievalProvider): void {
    if (typeof providerNameOrInstance === "string") {
      const found = this.registeredProviders.get(providerNameOrInstance);
      if (!found) {
        throw new Error(
          `Retrieval provider '${providerNameOrInstance}' not registered.`
        );
      }
      this.activeProvider = found;
    } else {
      this.activeProvider = providerNameOrInstance;
      this.registerProvider(providerNameOrInstance);
    }
  }

  /**
   * Returns current active provider info.
   */
  getActiveProviderInfo(): { name: string; sourceType: RetrievalSource } {
    return {
      name: this.activeProvider.name,
      sourceType: this.activeProvider.sourceType,
    };
  }

  /**
   * Executes a retrieval query against the active provider and validates response contracts.
   *
   * @param query - User query string
   * @param options - Optional RetrievalOptions (topK, minScore, filter)
   * @returns RetrievalResponse
   */
  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievalResponse> {
    const startTime = Date.now();
    const rawResults = await this.activeProvider.retrieve(query, options);

    const validatedResults = rawResults.map((item) =>
      strictValidate(
        RetrievedChunkSchema,
        item,
        `Retrieved Chunk ${item.chunkId}`
      )
    );

    const durationMs = Date.now() - startTime;

    const rawResponse: RetrievalResponse = {
      query,
      results: validatedResults,
      totalRetrieved: validatedResults.length,
      durationMs,
      retrievalSource: this.activeProvider.sourceType,
    };

    return strictValidate(
      RetrievalResponseSchema,
      rawResponse,
      "Retrieval Response"
    );
  }
}

/**
 * Singleton instance of RetrievalService initialized with default semantic provider.
 */
export const defaultRetrievalService = new RetrievalService();

/**
 * Convenience helper executing semantic vector retrieval using defaultRetrievalService.
 * Supports both RetrievalOptions object or direct topK number.
 * Returns retrieved chunks array decorated with full RetrievalResponse metadata.
 *
 * @param query - User query string
 * @param options - Optional RetrievalOptions object or numeric topK
 * @returns Array of RetrievedChunk objects extended with RetrievalResponse metadata
 */
export async function performSemanticSearch(
  query: string,
  options?: RetrievalOptions | number
): Promise<RetrievedChunk[] & RetrievalResponse> {
  const opts: RetrievalOptions =
    typeof options === "number" ? { topK: options } : options || {};
  const response = await defaultRetrievalService.retrieve(query, opts);

  const resultsArray = [...response.results] as RetrievedChunk[] &
    RetrievalResponse;
  resultsArray.query = response.query;
  resultsArray.results = response.results;
  resultsArray.totalRetrieved = response.totalRetrieved;
  resultsArray.durationMs = response.durationMs;
  resultsArray.retrievalSource = response.retrievalSource;

  return resultsArray;
}
