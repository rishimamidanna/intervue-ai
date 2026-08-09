/**
 * server/retrieval-explainability.ts
 *
 * Retrieval Explainability Layer (Milestone 7.3)
 *
 * Adds transparent score decomposition (semantic, BM25, candidate, final)
 * and natural language ranking explanations (keyword match, vector similarity, candidate relevance)
 * to RAG retrieval results.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  CandidateAwareRetrievedChunk,
  ExplainedRetrievedChunk,
  ExplainedRetrievalResponse,
  RetrievalResponse,
  DetailedRetrievalScores,
} from "@/types/rag";
import {
  ExplainedRetrievedChunkSchema,
  ExplainedRetrievalResponseSchema,
} from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { tokenize } from "./retrieval-service";

/**
 * Explains ranking rationale and decomposes scores for a single retrieved chunk.
 *
 * Output format:
 * {
 *   chunkId: "...",
 *   content: "...",
 *   scores: { semantic, bm25, candidate, final },
 *   reasons: ["...", "..."],
 *   metadata: { ... }
 * }
 *
 * @param chunk - RetrievedChunk or CandidateAwareRetrievedChunk object
 * @param query - Optional query string for token match analysis
 * @returns ExplainedRetrievedChunk
 */
export function explainRetrievedChunk(
  chunk: RetrievedChunk | CandidateAwareRetrievedChunk,
  query?: string
): ExplainedRetrievedChunk {
  const finalScore = Number((chunk.finalScore ?? chunk.score).toFixed(6));
  const hybridScore = chunk.hybridScore ?? chunk.score;
  const candidateScore = Number((chunk.candidateScore ?? 0.5).toFixed(6));

  const sourcesList = chunk.sources || [chunk.retrievalSource];
  const matchedSemantic = sourcesList.includes("semantic") || chunk.retrievalSource === "semantic";
  const matchedBM25 = sourcesList.includes("bm25") || chunk.retrievalSource === "bm25";

  // Score Decomposition
  const semanticScore = matchedSemantic ? Number((chunk.hybridScore ?? chunk.score).toFixed(6)) : 0;
  const bm25Score = matchedBM25 ? Number((chunk.hybridScore ?? chunk.score).toFixed(6)) : 0;

  const scores: DetailedRetrievalScores = {
    semantic: semanticScore,
    bm25: bm25Score,
    candidate: candidateScore,
    final: finalScore,
  };

  const reasons: string[] = [];

  // 1. Keyword Match Rationale
  if (query && query.trim().length > 0) {
    const queryTokens = tokenize(query);
    const chunkKeywords = (chunk.metadata.keywords || []).map((k) => k.toLowerCase());
    const contentLower = chunk.content.toLowerCase();

    const matchingKeywords = queryTokens.filter(
      (token) =>
        chunkKeywords.some((k) => k.includes(token) || token.includes(k)) ||
        contentLower.includes(token)
    );

    if (matchingKeywords.length > 0) {
      const uniqueMatches = Array.from(new Set(matchingKeywords)).slice(0, 4);
      reasons.push(
        `Keyword match: Matched search terms [${uniqueMatches.join(", ")}] in topic keywords and content text.`
      );
    } else {
      reasons.push("Keyword match: Broad conceptual lexical alignment.");
    }
  } else {
    reasons.push("Keyword match: Lexical term frequency alignment in index.");
  }

  // 2. Semantic Similarity Rationale
  if (matchedSemantic) {
    if (hybridScore >= 0.8) {
      reasons.push(
        `Semantic similarity: High vector space similarity (${(hybridScore * 100).toFixed(1)}% embedding alignment).`
      );
    } else if (hybridScore >= 0.5) {
      reasons.push(
        `Semantic similarity: Moderate vector space embedding alignment (${(hybridScore * 100).toFixed(1)}%).`
      );
    } else {
      reasons.push("Semantic similarity: Related conceptual embedding match.");
    }
  } else {
    reasons.push("Semantic similarity: Secondary conceptual context overlap.");
  }

  // 3. Candidate Relevance Rationale
  if (chunk.candidateScore !== undefined) {
    if (candidateScore >= 0.85) {
      reasons.push(
        `Candidate relevance: Strong priority boost (+${(candidateScore - 0.5).toFixed(2)}) matching candidate weak area & verification target.`
      );
    } else if (candidateScore >= 0.65) {
      reasons.push(
        `Candidate relevance: Moderate priority boost matching candidate experience level (${chunk.metadata.difficulty} difficulty alignment).`
      );
    } else {
      reasons.push("Candidate relevance: Standard candidate profile difficulty alignment.");
    }
  } else {
    reasons.push("Candidate relevance: Baseline profile relevance score (0.50).");
  }

  const explainedChunk: ExplainedRetrievedChunk = {
    chunkId: chunk.chunkId,
    content: chunk.content,
    metadata: chunk.metadata,
    scores,
    reasons,
    retrievalSource: chunk.retrievalSource,
    sources: chunk.sources,
  };

  return strictValidate(
    ExplainedRetrievedChunkSchema,
    explainedChunk,
    "Explained Retrieved Chunk"
  );
}

/**
 * Enriches a complete RetrievalResponse payload with detailed sub-scores and ranking explanations.
 *
 * @param response - RetrievalResponse payload
 * @returns ExplainedRetrievalResponse
 */
export function enrichRetrievalResponseWithExplanations(
  response: RetrievalResponse
): ExplainedRetrievalResponse {
  const explainedResults = response.results.map((item) =>
    explainRetrievedChunk(item, response.query)
  );

  const explainedResponse: ExplainedRetrievalResponse = {
    query: response.query,
    results: explainedResults,
    totalRetrieved: explainedResults.length,
    durationMs: response.durationMs,
    retrievalSource: response.retrievalSource,
  };

  return strictValidate(
    ExplainedRetrievalResponseSchema,
    explainedResponse,
    "Explained Retrieval Response"
  );
}

/**
 * Convenience helper explaining an array of retrieved chunks.
 *
 * @param chunks - Array of RetrievedChunk objects
 * @param query - Optional query string
 * @returns Array of ExplainedRetrievedChunk objects
 */
export function explainRetrieval(
  chunks: (RetrievedChunk | CandidateAwareRetrievedChunk)[],
  query?: string
): ExplainedRetrievedChunk[] {
  return chunks.map((item) => explainRetrievedChunk(item, query));
}
