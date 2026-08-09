/**
 * server/retrieval-confidence.ts
 *
 * Retrieval Confidence Scoring (Milestone 7.4)
 *
 * Evaluates the quality and reliability of retrieved context chunks, calculating
 * average retrieval score, top score strength, source depth count, score distribution,
 * numeric confidence score, confidence level ("high" | "medium" | "low"), and natural language rationale.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  RetrievedChunk,
  CandidateAwareRetrievedChunk,
  ExplainedRetrievedChunk,
  RetrievalResponse,
  RetrievalConfidenceAnalysis,
  RetrievalConfidenceLevel,
  RetrievalConfidenceMetrics,
} from "@/types/rag";
import { RetrievalConfidenceAnalysisSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";

/**
 * Analyzes retrieved chunks or a RetrievalResponse object and evaluates context quality confidence.
 *
 * Output format:
 * {
 *   confidence: "high" | "medium" | "low",
 *   confidenceScore: 0.89,
 *   metrics: { averageScore, topScore, sourceCount, scoreVariance },
 *   reasons: [ "High similarity", "Multiple supporting chunks" ]
 * }
 *
 * @param input - Array of RetrievedChunk objects or a RetrievalResponse payload
 * @returns RetrievalConfidenceAnalysis
 */
export function analyzeRetrievalConfidence(
  input:
    | (RetrievedChunk | CandidateAwareRetrievedChunk | ExplainedRetrievedChunk)[]
    | RetrievalResponse
): RetrievalConfidenceAnalysis {
  let chunks: (RetrievedChunk | CandidateAwareRetrievedChunk | ExplainedRetrievedChunk)[] = [];

  if (Array.isArray(input)) {
    chunks = input;
  } else if (input && Array.isArray(input.results)) {
    chunks = input.results;
  }

  // Handle empty retrieval results
  if (!chunks || chunks.length === 0) {
    const emptyMetrics: RetrievalConfidenceMetrics = {
      averageScore: 0,
      topScore: 0,
      sourceCount: 0,
      scoreVariance: 0,
    };

    const emptyAnalysis: RetrievalConfidenceAnalysis = {
      confidence: "low",
      confidenceScore: 0,
      metrics: emptyMetrics,
      reasons: ["No retrieved context sources available"],
    };

    return strictValidate(
      RetrievalConfidenceAnalysisSchema,
      emptyAnalysis,
      "Retrieval Confidence Analysis"
    );
  }

  // 1. Calculate Score & Distribution Metrics
  const itemScores = chunks.map((c) => {
    if ("scores" in c && c.scores && typeof c.scores.final === "number") {
      return c.scores.final;
    }
    const retrieved = c as RetrievedChunk;
    return retrieved.finalScore ?? retrieved.score ?? 0;
  });

  const topScore = Number(Math.max(...itemScores).toFixed(6));
  const totalScore = itemScores.reduce((sum, s) => sum + s, 0);
  const averageScore = Number((totalScore / itemScores.length).toFixed(6));
  const uniqueChunkIds = new Set(chunks.map((c) => c.chunkId));
  const sourceCount = uniqueChunkIds.size;

  const varianceSum = itemScores.reduce(
    (acc, val) => acc + Math.pow(val - averageScore, 2),
    0
  );
  const scoreVariance = Number(Math.sqrt(varianceSum / itemScores.length).toFixed(6));

  const metrics: RetrievalConfidenceMetrics = {
    averageScore,
    topScore,
    sourceCount,
    scoreVariance,
  };

  // 2. Compute Weighted Confidence Score (0.0 to 1.0)
  const sourceFactor = Math.min(1.0, sourceCount / 3.0);
  const rawConfidence = 0.5 * topScore + 0.3 * averageScore + 0.2 * sourceFactor;
  const confidenceScore = Number(Math.min(1.0, Math.max(0.0, rawConfidence)).toFixed(2));

  // 3. Determine Confidence Level ("high" | "medium" | "low")
  let confidence: RetrievalConfidenceLevel = "low";
  if (confidenceScore >= 0.75) {
    confidence = "high";
  } else if (confidenceScore >= 0.50) {
    confidence = "medium";
  }

  // 4. Generate Natural Language Rationale Reasons
  const reasons: string[] = [];

  if (topScore >= 0.8) {
    reasons.push(`High top similarity match (${(topScore * 100).toFixed(1)}% score)`);
  } else if (topScore >= 0.6) {
    reasons.push(`Moderate top similarity match (${(topScore * 100).toFixed(1)}% score)`);
  } else {
    reasons.push(`Low top similarity match (${(topScore * 100).toFixed(1)}% score)`);
  }

  if (sourceCount >= 3) {
    reasons.push(`Multiple supporting chunks (${sourceCount} sources)`);
  } else if (sourceCount === 2) {
    reasons.push(`Dual supporting chunks (2 sources)`);
  } else {
    reasons.push(`Single supporting chunk (1 source)`);
  }

  if (scoreVariance <= 0.1) {
    reasons.push("Consistent score distribution across retrieved chunks");
  } else {
    reasons.push("Varied score distribution across retrieved chunks");
  }

  const analysis: RetrievalConfidenceAnalysis = {
    confidence,
    confidenceScore,
    metrics,
    reasons,
  };

  return strictValidate(
    RetrievalConfidenceAnalysisSchema,
    analysis,
    "Retrieval Confidence Analysis"
  );
}
