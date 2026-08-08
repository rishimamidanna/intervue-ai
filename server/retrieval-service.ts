/**
 * server/retrieval-service.ts
 *
 * Retrieval Architecture, Semantic Retrieval & BM25 Keyword Engine (Milestone 6.1, 6.2 & 6.3)
 *
 * Flow:
 * Documents/Chunks -> Keyword Index -> BM25 Scoring -> Top-K Results
 *
 * Provides a clean, modular retrieval abstraction layer supporting pluggable
 * retrieval providers (Semantic Vector Retrieval, BM25 Okapi Keyword Retrieval, Hybrid Fusion Retrieval).
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
import { generateAllCurriculumChunks } from "./chunking-service";

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
// Tokenizer & BM25 Keyword Engine (Milestone 6.3)
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
]);

/**
 * Tokenizes, lowercases, and filters stop words from text content for lexical search.
 *
 * @param text - Raw text content
 * @returns Filtered array of word tokens
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

/**
 * Production-ready BM25 Okapi Keyword Index & Relevance Scoring Engine.
 */
export class BM25Index {
  private chunks: CurriculumChunk[] = [];
  private docTermFreqs = new Map<string, Map<string, number>>();
  private docLengths = new Map<string, number>();
  private docCount = 0;
  private avgDocLength = 0;
  private docFreqs = new Map<string, number>();
  private idfMap = new Map<string, number>();

  private k1: number;
  private b: number;

  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  /**
   * Constructs inverted keyword index and precomputes IDF weights for chunk collection.
   *
   * @param chunks - Array of CurriculumChunk objects
   */
  buildIndex(chunks: CurriculumChunk[]): void {
    this.chunks = chunks;
    this.docCount = chunks.length;
    this.docTermFreqs.clear();
    this.docLengths.clear();
    this.docFreqs.clear();
    this.idfMap.clear();

    let totalLength = 0;

    for (const chunk of chunks) {
      const contentTokens = tokenize(chunk.content);
      const keywordTokens = chunk.keywords.flatMap((kw) => tokenize(kw));
      // Keyword boost: duplicate topic keywords to elevate lexical match weight
      const allTokens = [...contentTokens, ...keywordTokens, ...keywordTokens];

      const len = allTokens.length;
      this.docLengths.set(chunk.chunkId, len);
      totalLength += len;

      const tfMap = new Map<string, number>();
      const uniqueTerms = new Set<string>();

      for (const token of allTokens) {
        tfMap.set(token, (tfMap.get(token) || 0) + 1);
        uniqueTerms.add(token);
      }

      this.docTermFreqs.set(chunk.chunkId, tfMap);

      for (const term of uniqueTerms) {
        this.docFreqs.set(term, (this.docFreqs.get(term) || 0) + 1);
      }
    }

    this.avgDocLength = this.docCount > 0 ? totalLength / this.docCount : 1;

    // Compute Robertson-Spärck Jones IDF for each token
    for (const [term, df] of this.docFreqs.entries()) {
      const idf = Math.log(
        (this.docCount - df + 0.5) / (df + 0.5) + 1.0
      );
      this.idfMap.set(term, Math.max(0, idf));
    }
  }

  /**
   * Searches the BM25 index using the Okapi BM25 relevance scoring formula.
   *
   * @param query - User search query
   * @param options - Optional RetrievalOptions
   * @returns Array of ranked RetrievedChunk objects
   */
  search(query: string, options?: RetrievalOptions): RetrievedChunk[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || this.chunks.length === 0) return [];

    const topK = options?.topK || 5;
    const minScore = options?.minScore ?? 0.0001;
    const filter = options?.filter;

    let candidateChunks = this.chunks;
    if (filter) {
      if (typeof filter.day === "number") {
        candidateChunks = candidateChunks.filter(
          (c) => c.metadata.sourceRef.day === filter.day
        );
      }
      if (filter.category) {
        candidateChunks = candidateChunks.filter(
          (c) =>
            c.metadata.category.toLowerCase() ===
            filter.category!.toLowerCase()
        );
      }
      if (filter.difficulty) {
        candidateChunks = candidateChunks.filter(
          (c) => c.metadata.difficulty === filter.difficulty
        );
      }
    }

    const scoredResults: RetrievedChunk[] = candidateChunks.map((chunk) => {
      let score = 0;
      const tfMap = this.docTermFreqs.get(chunk.chunkId);
      const docLen = this.docLengths.get(chunk.chunkId) || this.avgDocLength;

      for (const qToken of queryTokens) {
        const tf = tfMap?.get(qToken) || 0;
        if (tf === 0) continue;

        const idf = this.idfMap.get(qToken) || 0;
        const num = tf * (this.k1 + 1);
        const denom =
          tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
        score += idf * (num / denom);
      }

      return {
        chunkId: chunk.chunkId,
        content: chunk.content,
        metadata: chunk.metadata,
        score: Number(score.toFixed(6)),
        retrievalSource: "bm25",
      };
    });

    const filtered = scoredResults
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score);

    return filtered.slice(0, topK);
  }
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
// BM25 Keyword Retrieval Provider (Milestone 6.3 Implementation)
// ---------------------------------------------------------------------------

/**
 * Real BM25 Keyword Retrieval Provider.
 * Tokenizes chunk content, builds an inverted index, and calculates Okapi BM25 relevance scores.
 */
export class BM25RetrievalProvider implements IRetrievalProvider {
  name = "bm25-retrieval-provider";
  sourceType: RetrievalSource = "bm25";

  private bm25Index = new BM25Index();
  private isIndexed = false;

  /**
   * Ensures the curriculum chunks are tokenized and indexed into the BM25 engine.
   */
  private async ensureIndexed(): Promise<void> {
    if (!this.isIndexed) {
      const chunks = await generateAllCurriculumChunks();
      this.bm25Index.buildIndex(chunks);
      this.isIndexed = true;
    }
  }

  /**
   * Performs BM25 keyword retrieval for a given query string.
   */
  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]> {
    await this.ensureIndexed();
    return this.bm25Index.search(query, options);
  }
}

// ---------------------------------------------------------------------------
// Hybrid Architecture Stub
// ---------------------------------------------------------------------------

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
    this.registerProvider(new BM25RetrievalProvider());
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

  // Temporarily switch active provider if needed or use default (semantic)
  const currentProviderInfo = defaultRetrievalService.getActiveProviderInfo();
  if (currentProviderInfo.sourceType !== "semantic") {
    defaultRetrievalService.setProvider("semantic");
  }

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

/**
 * Convenience helper executing BM25 Okapi keyword retrieval using defaultRetrievalService.
 * Supports both RetrievalOptions object or direct topK number.
 * Returns retrieved chunks array decorated with full RetrievalResponse metadata.
 *
 * @param query - User query string
 * @param options - Optional RetrievalOptions object or numeric topK
 * @returns Array of RetrievedChunk objects extended with RetrievalResponse metadata
 */
export async function performBM25Search(
  query: string,
  options?: RetrievalOptions | number
): Promise<RetrievedChunk[] & RetrievalResponse> {
  const opts: RetrievalOptions =
    typeof options === "number" ? { topK: options } : options || {};

  const currentProviderInfo = defaultRetrievalService.getActiveProviderInfo();
  defaultRetrievalService.setProvider("bm25");

  const response = await defaultRetrievalService.retrieve(query, opts);

  // Restore previous active provider
  defaultRetrievalService.setProvider(currentProviderInfo.name);

  const resultsArray = [...response.results] as RetrievedChunk[] &
    RetrievalResponse;
  resultsArray.query = response.query;
  resultsArray.results = response.results;
  resultsArray.totalRetrieved = response.totalRetrieved;
  resultsArray.durationMs = response.durationMs;
  resultsArray.retrievalSource = response.retrievalSource;

  return resultsArray;
}
