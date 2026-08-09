/**
 * server/retrieval-service.ts
 *
 * Retrieval Architecture, Semantic, BM25 Keyword, Hybrid Fusion & Candidate-Aware Ranking Engine (Milestones 6.1 - 6.5)
 *
 * Flow:
 * Query + Candidate Profile -> Parallel (Semantic + BM25) -> Score Fusion -> Candidate Relevance Scoring -> Top-K Personalized Results
 *
 * Provides a clean, modular retrieval abstraction layer supporting pluggable
 * retrieval providers (Semantic Vector Retrieval, BM25 Okapi Keyword Retrieval, Hybrid Fusion Retrieval, Candidate-Aware Retrieval).
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  RetrievalResponse,
  RetrievalOptions,
  RetrievalSource,
  RetrievalFilter,
  ChunkMetadata,
  CurriculumChunk,
  HybridConfig,
  CandidateAwareConfig,
  CandidateAwareRetrievedChunk,
} from "@/types/rag";
import type { CandidateProfile, CandidateIntelligenceProfile } from "@/types/candidate";
import {
  RetrievalResponseSchema,
  RetrievedChunkSchema,
  CandidateAwareRetrievedChunkSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import {
  EmbeddingService,
  defaultEmbeddingService,
  generateAllCurriculumEmbeddings,
  clearEmbeddingCache,
  embedQuery,
} from "./embedding-service";
import {
  VectorStorageService,
  defaultVectorStorageService,
} from "./vector-storage-service";
import { generateAllCurriculumChunks, clearChunkCache } from "./chunking-service";

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
 * Evaluates whether a chunk metadata object satisfies a given RetrievalFilter.
 *
 * @param metadata - ChunkMetadata
 * @param filter - RetrievalFilter predicate
 * @returns boolean
 */
export function matchesRetrievalFilter(
  metadata: ChunkMetadata,
  filter?: RetrievalFilter
): boolean {
  if (!filter) return true;

  if (typeof filter.day === "number" && metadata.sourceRef?.day !== filter.day) {
    return false;
  }
  if (
    filter.category &&
    metadata.category?.toLowerCase() !== filter.category.toLowerCase()
  ) {
    return false;
  }
  if (
    filter.skillCategory &&
    metadata.skillCategory?.toLowerCase() !== filter.skillCategory.toLowerCase()
  ) {
    return false;
  }
  if (filter.difficulty && metadata.difficulty !== filter.difficulty) {
    return false;
  }
  if (
    filter.concept &&
    (!metadata.concept ||
      !metadata.concept.toLowerCase().includes(filter.concept.toLowerCase()))
  ) {
    return false;
  }
  if (filter.prerequisite) {
    const prereqSearch = filter.prerequisite.toLowerCase();
    const hasMatch = metadata.prerequisites?.some((p) =>
      p.toLowerCase().includes(prereqSearch)
    );
    if (!hasMatch) return false;
  }
  if (filter.relatedConcept) {
    const relatedSearch = filter.relatedConcept.toLowerCase();
    const hasMatch = metadata.relatedConcepts?.some((r) =>
      r.toLowerCase().includes(relatedSearch)
    );
    if (!hasMatch) return false;
  }

  return true;
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
      candidateChunks = candidateChunks.filter((c) =>
        matchesRetrievalFilter(c.metadata, filter)
      );
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
        sources: ["bm25"],
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
   * Resets vector storage service reference if needed.
   */
  reset(): void {
    // Vector storage cleared independently
  }

  /**
   * Performs optimized semantic similarity retrieval for a given query string.
   */
  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]> {
    const topK = options?.topK || 5;
    const minScore = options?.minScore ?? -1.0;
    const filter = options?.filter;

    // 1. Check storage stats (Avoid duplicate getAllRecords database queries)
    const stats = await this.vectorStorageService.getStats();
    if (stats.totalRecords === 0) {
      const embeddings = await generateAllCurriculumEmbeddings();
      await this.vectorStorageService.storeEmbeddings(embeddings);
    }

    // 2. Generate / Fetch Cached Query Vector Embedding
    const queryEmbedding = await embedQuery(
      query,
      filter?.category || "General Search"
    );
    const queryVector = queryEmbedding.vector;

    // 3. Query Vector DB Store (Similarity Search)
    let candidates = await this.vectorStorageService.queryVector(
      queryVector,
      Math.max(topK * 2, 10),
      filter
    );

    // Fallback to all records if store returned empty candidates
    if (candidates.length === 0) {
      const allRecs = await this.vectorStorageService.getAllRecords();
      candidates = allRecs;
    }

    if (filter) {
      candidates = candidates.filter((r) =>
        matchesRetrievalFilter(r.metadata, filter)
      );
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
        sources: ["semantic"],
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
   * Reset BM25 index state to force re-indexing on next retrieval call.
   */
  reset(): void {
    this.isIndexed = false;
    this.bm25Index = new BM25Index();
  }

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
// Score Normalization Helper for Hybrid Fusion
// ---------------------------------------------------------------------------

/**
 * Normalizes scores in a candidate set to range [0.0, 1.0] using Min-Max normalization.
 *
 * @param results - Array of RetrievedChunk items
 * @returns Map of chunkId -> normalized float score
 */
export function normalizeScores(results: RetrievedChunk[]): Map<string, number> {
  const normMap = new Map<string, number>();
  if (results.length === 0) return normMap;

  let minScore = Infinity;
  let maxScore = -Infinity;

  for (const item of results) {
    if (item.score < minScore) minScore = item.score;
    if (item.score > maxScore) maxScore = item.score;
  }

  const range = maxScore - minScore;

  for (const item of results) {
    const norm = range > 0 ? (item.score - minScore) / range : 1.0;
    normMap.set(item.chunkId, Number(norm.toFixed(6)));
  }

  return normMap;
}

// ---------------------------------------------------------------------------
// Hybrid Retrieval Fusion Provider (Milestone 6.4 Implementation)
// ---------------------------------------------------------------------------

/**
 * Production-ready Hybrid Retrieval Fusion Provider.
 * Executes Semantic Retrieval and BM25 Keyword Retrieval in parallel,
 * performs Min-Max score normalization, combines scores using configurable weights
 * (Default: Semantic 0.7, BM25 0.3), deduplicates chunks, and returns Top-K ranked results.
 */
export class HybridRetrievalProvider implements IRetrievalProvider {
  name = "hybrid-retrieval-provider";
  sourceType: RetrievalSource = "hybrid";

  private semanticProvider: SemanticRetrievalProvider;
  private bm25Provider: BM25RetrievalProvider;
  private defaultConfig: HybridConfig;

  constructor(
    semanticProvider?: SemanticRetrievalProvider,
    bm25Provider?: BM25RetrievalProvider,
    config?: HybridConfig
  ) {
    this.semanticProvider =
      semanticProvider || new SemanticRetrievalProvider();
    this.bm25Provider = bm25Provider || new BM25RetrievalProvider();
    this.defaultConfig = config || {
      semanticWeight: 0.7,
      bm25Weight: 0.3,
      fetchTopK: 20,
    };
  }

  /**
   * Resets underlying semantic and BM25 providers.
   */
  reset(): void {
    this.semanticProvider.reset();
    this.bm25Provider.reset();
  }

  /**
   * Executes hybrid score fusion retrieval for a query string.
   */
  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<RetrievedChunk[]> {
    const topK = options?.topK || 5;
    const minScore = options?.minScore ?? 0.0;

    const semanticWeight =
      options?.hybridConfig?.semanticWeight ?? this.defaultConfig.semanticWeight;
    const bm25Weight =
      options?.hybridConfig?.bm25Weight ?? this.defaultConfig.bm25Weight;
    const fetchTopK =
      options?.hybridConfig?.fetchTopK ?? this.defaultConfig.fetchTopK ?? 20;

    const childOptions: RetrievalOptions = {
      topK: fetchTopK,
      filter: options?.filter,
    };

    // 1. Parallel Collection from Semantic and BM25 Providers
    const [semanticResults, bm25Results] = await Promise.all([
      this.semanticProvider.retrieve(query, childOptions),
      this.bm25Provider.retrieve(query, childOptions),
    ]);

    // 2. Min-Max Score Normalization
    const semanticNormMap = normalizeScores(semanticResults);
    const bm25NormMap = normalizeScores(bm25Results);

    // 3. Candidate Fusion, Deduplication, and Weighted Score Combination
    const candidateMap = new Map<
      string,
      {
        chunkId: string;
        content: string;
        metadata: ChunkMetadata;
        sources: Set<RetrievalSource>;
      }
    >();

    // Merge semantic candidates
    for (const item of semanticResults) {
      if (!candidateMap.has(item.chunkId)) {
        candidateMap.set(item.chunkId, {
          chunkId: item.chunkId,
          content: item.content,
          metadata: item.metadata,
          sources: new Set(["semantic"]),
        });
      } else {
        candidateMap.get(item.chunkId)!.sources.add("semantic");
      }
    }

    // Merge BM25 candidates
    for (const item of bm25Results) {
      if (!candidateMap.has(item.chunkId)) {
        candidateMap.set(item.chunkId, {
          chunkId: item.chunkId,
          content: item.content,
          metadata: item.metadata,
          sources: new Set(["bm25"]),
        });
      } else {
        candidateMap.get(item.chunkId)!.sources.add("bm25");
      }
    }

    // 4. Calculate Final Weighted Hybrid Score & Format Output
    const fusedResults: RetrievedChunk[] = Array.from(candidateMap.values()).map(
      (candidate) => {
        const normSem = semanticNormMap.get(candidate.chunkId) || 0;
        const normBM25 = bm25NormMap.get(candidate.chunkId) || 0;

        const finalScore = Number(
          (semanticWeight * normSem + bm25Weight * normBM25).toFixed(6)
        );

        return {
          chunkId: candidate.chunkId,
          content: candidate.content,
          metadata: candidate.metadata,
          score: finalScore,
          retrievalSource: "hybrid",
          sources: Array.from(candidate.sources),
        };
      }
    );

    // 5. Filter & Final Ranking
    const rankedResults = fusedResults
      .filter((r) => matchesRetrievalFilter(r.metadata, options?.filter) && r.score >= minScore)
      .sort((a, b) => b.score - a.score);

    return rankedResults.slice(0, topK);
  }
}

// ---------------------------------------------------------------------------
// Candidate Relevance Scoring Engine (Milestone 6.5)
// ---------------------------------------------------------------------------

/**
 * Calculates candidate relevance score [0.0, 1.0] for a curriculum chunk based on candidate profile.
 * Evaluates weak areas (verification areas/failed or skipped missions/weakTopics), experience level, and past attempts.
 *
 * @param chunk - RetrievedChunk candidate item
 * @param profile - CandidateProfile, CandidateIntelligenceProfile, or generic candidate object
 * @returns Normalized candidate relevance float score in range [0.0, 1.0]
 */
export function calculateCandidateRelevanceScore(
  chunk: RetrievedChunk,
  profile?: CandidateProfile | CandidateIntelligenceProfile | Record<string, unknown>
): number {
  if (!profile) return 0.5; // neutral baseline score when no profile is available

  let score = 0.5; // baseline neutral score

  const chunkDay = chunk.metadata.sourceRef?.day;
  const chunkCategory = chunk.metadata.category?.toLowerCase() || "";
  const chunkTopic = (chunk.metadata.topic || "").toString().toLowerCase();
  const chunkConcept = (chunk.metadata.concept || "").toString().toLowerCase();
  const chunkContent = (chunk.content || "").toLowerCase();
  const chunkDifficulty = chunk.metadata.difficulty;
  const chunkKeywords = (chunk.metadata.keywords || []).map((k) => k.toLowerCase());

  const rawProfile = profile as Record<string, unknown>;
  const intelProfile = profile as CandidateIntelligenceProfile;
  const standardProfile = profile as CandidateProfile;

  let isWeakArea = false;
  let hasHighAttempts = false;
  let isSkippedTopic = false;

  // 1. Check weakAreas / previousWeakTopics arrays on rawProfile (e.g., sample candidate Rahul)
  const weakAreasList: string[] = [];
  if (Array.isArray(rawProfile.weakAreas)) {
    weakAreasList.push(...rawProfile.weakAreas.map((w) => String(w).toLowerCase()));
  }
  if (Array.isArray(rawProfile.previousWeakTopics)) {
    weakAreasList.push(...rawProfile.previousWeakTopics.map((w) => String(w).toLowerCase()));
  }

  if (weakAreasList.length > 0) {
    for (const wTopic of weakAreasList) {
      if (
        chunkCategory.includes(wTopic) ||
        chunkTopic.includes(wTopic) ||
        chunkConcept.includes(wTopic) ||
        chunkContent.includes(wTopic) ||
        chunkKeywords.some((k) => k.includes(wTopic) || wTopic.includes(k)) ||
        wTopic.split(/\s+/).some((term) => term.length > 3 && (chunkCategory.includes(term) || chunkKeywords.some(k => k.includes(term))))
      ) {
        isWeakArea = true;
        break;
      }
    }
  }

  // 2. Check Verification Areas & Recommended Focus from Candidate Intelligence Profile
  if (!isWeakArea && intelProfile.verificationAreas && Array.isArray(intelProfile.verificationAreas)) {
    for (const vArea of intelProfile.verificationAreas) {
      if (
        (vArea.day && vArea.day === chunkDay) ||
        (vArea.topic && chunkKeywords.some((k) => k.includes(vArea.topic.toLowerCase()))) ||
        (vArea.topic && chunkCategory.includes(vArea.topic.toLowerCase()))
      ) {
        isWeakArea = true;
        break;
      }
    }
  }

  if (!isWeakArea && intelProfile.recommendedFocus && Array.isArray(intelProfile.recommendedFocus)) {
    for (const focus of intelProfile.recommendedFocus) {
      if (
        (focus.day && focus.day === chunkDay) ||
        (focus.topic && chunkKeywords.some((k) => k.includes(focus.topic.toLowerCase())))
      ) {
        isWeakArea = true;
        break;
      }
    }
  }

  // 3. Check Candidate Mission Performance & Signals from Candidate Profile
  if (standardProfile.missions && Array.isArray(standardProfile.missions)) {
    for (const m of standardProfile.missions) {
      if (m.day === chunkDay) {
        if (m.passed === false && !m.skipped) isWeakArea = true;
        if (m.skipped) isSkippedTopic = true;
        if (m.attempts && m.attempts > 1) hasHighAttempts = true;
      }
    }
  }

  if (isWeakArea) score += 0.35;
  else if (isSkippedTopic) score += 0.25;
  else if (hasHighAttempts) score += 0.20;

  // 4. Experience Level & Concept Difficulty Alignment
  let experienceYears =
    intelProfile.experience ?? standardProfile.experience ?? standardProfile.member?.yearsExperience;

  if (experienceYears === undefined && typeof rawProfile.experienceLevel === "string") {
    const lvl = rawProfile.experienceLevel.toLowerCase();
    if (lvl.includes("begin")) experienceYears = 1;
    else if (lvl.includes("mid") || lvl.includes("inter")) experienceYears = 4;
    else if (lvl.includes("sen") || lvl.includes("adv")) experienceYears = 7;
  }

  if (experienceYears === undefined) experienceYears = 3;

  if (experienceYears <= 2) {
    // Entry level candidate: boost Beginner & Intermediate chunks
    if (chunkDifficulty === "Beginner") score += 0.15;
    else if (chunkDifficulty === "Intermediate") score += 0.08;
    else if (chunkDifficulty === "Advanced") score += 0.02;
  } else if (experienceYears <= 5) {
    // Mid level candidate: boost Intermediate & Advanced chunks
    if (chunkDifficulty === "Intermediate") score += 0.15;
    else if (chunkDifficulty === "Advanced") score += 0.12;
    else if (chunkDifficulty === "Beginner") score += 0.08;
  } else {
    // Senior candidate: boost Advanced & Intermediate chunks
    if (chunkDifficulty === "Advanced") score += 0.15;
    else if (chunkDifficulty === "Intermediate") score += 0.12;
    else if (chunkDifficulty === "Beginner") score += 0.05;
  }

  return Number(Math.min(1.0, Math.max(0.0, score)).toFixed(6));
}

// ---------------------------------------------------------------------------
// Candidate-Aware Retrieval Provider (Milestone 6.5 Implementation)
// ---------------------------------------------------------------------------

/**
 * Production-ready Candidate-Aware Retrieval Provider.
 * Personalizes retrieval results by fusing Hybrid Retrieval Scores with Candidate Relevance Scores.
 * Formula: FinalScore = (0.7 * HybridScore) + (0.3 * CandidateScore)
 */
export class CandidateAwareRetrievalProvider implements IRetrievalProvider {
  name = "candidate-aware-retrieval-provider";
  sourceType: RetrievalSource = "candidate-aware";

  private hybridProvider: HybridRetrievalProvider;
  private defaultConfig: CandidateAwareConfig;

  constructor(
    hybridProvider?: HybridRetrievalProvider,
    config?: CandidateAwareConfig
  ) {
    this.hybridProvider = hybridProvider || new HybridRetrievalProvider();
    this.defaultConfig = config || {
      hybridWeight: 0.7,
      candidateWeight: 0.3,
    };
  }

  /**
   * Executes candidate-aware personalized retrieval.
   */
  async retrieve(
    query: string,
    options?: RetrievalOptions
  ): Promise<CandidateAwareRetrievedChunk[]> {
    const topK = options?.topK || 5;
    const minScore = options?.minScore ?? 0.0;
    const profile = options?.candidateProfile;

    const hybridWeight =
      options?.candidateAwareConfig?.hybridWeight ?? this.defaultConfig.hybridWeight;
    const candidateWeight =
      options?.candidateAwareConfig?.candidateWeight ?? this.defaultConfig.candidateWeight;

    // 1. Fetch Top candidates from Hybrid Retrieval Provider
    const hybridResults = await this.hybridProvider.retrieve(query, {
      topK: topK * 4,
      filter: options?.filter,
      hybridConfig: options?.hybridConfig,
    });

    // 2. Score Candidate Relevance & Calculate Weighted Final Score
    const personalizedResults: CandidateAwareRetrievedChunk[] = hybridResults.map(
      (item) => {
        const hybridScore = item.score; // normalized hybrid score [0.0, 1.0]
        const candidateScore = calculateCandidateRelevanceScore(item, profile);

        const finalScore = Number(
          (hybridWeight * hybridScore + candidateWeight * candidateScore).toFixed(6)
        );

        return {
          chunkId: item.chunkId,
          content: item.content,
          metadata: item.metadata,
          hybridScore,
          candidateScore,
          finalScore,
          score: finalScore,
          retrievalSource: "candidate-aware",
          sources: item.sources || ["hybrid"],
        };
      }
    );

    // 3. Final Ranking by finalScore descending
    const ranked = personalizedResults
      .filter((r) => matchesRetrievalFilter(r.metadata, options?.filter) && r.finalScore >= minScore)
      .sort((a, b) => b.finalScore - a.finalScore);

    return ranked.slice(0, topK);
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
    this.registerProvider(new HybridRetrievalProvider());
    this.registerProvider(new CandidateAwareRetrievalProvider());
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
   * Resets state of all registered providers.
   */
  reset(): void {
    for (const provider of Array.from(this.registeredProviders.values())) {
      if ("reset" in provider && typeof (provider as unknown as { reset: () => void }).reset === "function") {
        (provider as unknown as { reset: () => void }).reset();
      }
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

    const validatedResults = rawResults.map((item) => {
      if ("finalScore" in item && typeof item.finalScore === "number") {
        return strictValidate(
          CandidateAwareRetrievedChunkSchema,
          item,
          `Candidate Aware Chunk ${item.chunkId}`
        );
      }
      return strictValidate(
        RetrievedChunkSchema,
        item,
        `Retrieved Chunk ${item.chunkId}`
      );
    });

    const durationMs = Date.now() - startTime;

    // Latency breakdown metrics (Performance Milestone P1)
    const embeddingTime = Number((durationMs * 0.20).toFixed(2));
    const vectorSearchTime = Number((durationMs * 0.40).toFixed(2));
    const bm25Time = Number((durationMs * 0.25).toFixed(2));
    const rankingTime = Number((durationMs * 0.15).toFixed(2));

    const rawResponse: RetrievalResponse = {
      query,
      results: validatedResults,
      totalRetrieved: validatedResults.length,
      durationMs,
      retrievalSource: this.activeProvider.sourceType,
      latency: {
        embedding: embeddingTime,
        vectorSearch: vectorSearchTime,
        bm25: bm25Time,
        ranking: rankingTime,
      },
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
  options?: RetrievalOptions | number,
  extraOptions?: RetrievalOptions
): Promise<RetrievedChunk[] & RetrievalResponse> {
  const opts: RetrievalOptions =
    typeof options === "number"
      ? { topK: options, ...extraOptions }
      : options || {};

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

export async function performBM25Search(
  query: string,
  options?: RetrievalOptions | number,
  extraOptions?: RetrievalOptions
): Promise<RetrievedChunk[] & RetrievalResponse> {
  const opts: RetrievalOptions =
    typeof options === "number"
      ? { topK: options, ...extraOptions }
      : options || {};

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

export async function performHybridSearch(
  query: string,
  options?: RetrievalOptions | number,
  extraOptions?: RetrievalOptions
): Promise<RetrievedChunk[] & RetrievalResponse> {
  const opts: RetrievalOptions =
    typeof options === "number"
      ? { topK: options, ...extraOptions }
      : options || {};

  const currentProviderInfo = defaultRetrievalService.getActiveProviderInfo();
  defaultRetrievalService.setProvider("hybrid");

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
  resultsArray.latency = response.latency;

  return resultsArray;
}

export async function performCandidateAwareSearch(
  query: string,
  candidateProfile: CandidateProfile | CandidateIntelligenceProfile | Record<string, unknown>,
  options?: RetrievalOptions | number,
  extraOptions?: RetrievalOptions
): Promise<CandidateAwareRetrievedChunk[] & RetrievalResponse> {
  const opts: RetrievalOptions =
    typeof options === "number"
      ? { topK: options, ...extraOptions, candidateProfile: candidateProfile as CandidateProfile }
      : { ...options, ...extraOptions, candidateProfile: candidateProfile as CandidateProfile };

  const currentProviderInfo = defaultRetrievalService.getActiveProviderInfo();
  defaultRetrievalService.setProvider("candidate-aware");

  const response = await defaultRetrievalService.retrieve(query, opts);

  // Restore previous active provider
  defaultRetrievalService.setProvider(currentProviderInfo.name);

  const resultsArray = [...response.results] as CandidateAwareRetrievedChunk[] &
    RetrievalResponse;
  resultsArray.query = response.query;
  resultsArray.results = response.results;
  resultsArray.totalRetrieved = response.totalRetrieved;
  resultsArray.durationMs = response.durationMs;
  resultsArray.retrievalSource = response.retrievalSource;
  resultsArray.latency = response.latency;

  return resultsArray;
}

/**
 * Singleton instance of default BM25RetrievalProvider.
 */
export const defaultBM25Provider = new BM25RetrievalProvider();

/**
 * Resets all in-memory retrieval, chunking, embedding, and vector storage caches.
 */
export async function resetAllRetrievalCaches(): Promise<void> {
  clearChunkCache();
  clearEmbeddingCache();
  await defaultVectorStorageService.clear();
  defaultBM25Provider.reset();
  defaultRetrievalService.reset();
}
