/**
 * lib/scoring.ts
 *
 * Deterministic weighted scoring utility for INTERVUE.
 *
 * This module performs ONLY the final score calculation using pre-defined
 * weights. It does NOT call any LLM or external service. The individual
 * dimension scores (0–10) are supplied by the AI Evaluator module; this
 * utility applies the weights and returns the final composite score (0–100).
 *
 * Scoring Formula:
 *   Technical Correctness : 35%
 *   Reasoning             : 25%
 *   Depth                 : 20%
 *   Communication         : 10%
 *   Practical Engineering : 10%
 *
 * Owner: Shared utility — Backend member implements, AI member consumes
 */

import type { AnswerEvaluation } from "@/types/interview";

// ---------------------------------------------------------------------------
// Weights (must sum to 1.0)
// ---------------------------------------------------------------------------

const WEIGHTS = {
  correctness: 0.35,
  reasoning: 0.25,
  depth: 0.20,
  communication: 0.10,
  engineering: 0.10,
} as const;

// Compile-time guard: verify weights sum to 1.0
const WEIGHT_SUM = Object.values(WEIGHTS).reduce((acc, w) => acc + w, 0);
if (Math.abs(WEIGHT_SUM - 1.0) > 0.0001) {
  throw new Error(`Scoring weights must sum to 1.0, got ${WEIGHT_SUM}`);
}

// ---------------------------------------------------------------------------
// Score Dimensions
// ---------------------------------------------------------------------------

export interface ScoreDimensions {
  correctness: number;
  reasoning: number;
  depth: number;
  communication: number;
  engineering: number;
}

export interface ScoringResult {
  /** Weighted composite score on a 0–100 scale */
  overallScore: number;
  /** Breakdown of each dimension (0–10) */
  dimensions: ScoreDimensions;
  /** Breakdown of each weighted contribution (0–10 × weight = 0–3.5 max) */
  weightedContributions: ScoreDimensions;
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the final INTERVUE composite score from an AnswerEvaluation.
 *
 * @param evaluation - The structured evaluation produced by the AI Evaluator
 * @returns ScoringResult containing the overall score (0–100) and breakdown
 */
export function calculateScore(evaluation: AnswerEvaluation): ScoringResult {
  const dimensions: ScoreDimensions = {
    correctness: clamp(evaluation.correctness, 0, 10),
    reasoning: clamp(evaluation.reasoning, 0, 10),
    depth: clamp(evaluation.depth, 0, 10),
    communication: clamp(evaluation.communication, 0, 10),
    engineering: clamp(evaluation.engineering, 0, 10),
  };

  const weightedContributions: ScoreDimensions = {
    correctness: dimensions.correctness * WEIGHTS.correctness,
    reasoning: dimensions.reasoning * WEIGHTS.reasoning,
    depth: dimensions.depth * WEIGHTS.depth,
    communication: dimensions.communication * WEIGHTS.communication,
    engineering: dimensions.engineering * WEIGHTS.engineering,
  };

  // Sum weighted scores (0–10 scale) then convert to 0–100
  const weightedSum = Object.values(weightedContributions).reduce(
    (acc, v) => acc + v,
    0
  );
  const overallScore = Math.round(weightedSum * 10);

  return { overallScore, dimensions, weightedContributions };
}

/**
 * Calculates an aggregate session score by averaging individual turn scores.
 *
 * @param evaluations - Array of AnswerEvaluation objects from the session
 * @returns Average composite score (0–100)
 */
export function calculateSessionScore(evaluations: AnswerEvaluation[]): number {
  if (evaluations.length === 0) return 0;
  const total = evaluations.reduce(
    (acc, ev) => acc + calculateScore(ev).overallScore,
    0
  );
  return Math.round(total / evaluations.length);
}

/**
 * Returns the scoring weight configuration for display in the report UI.
 */
export function getScoringWeights(): typeof WEIGHTS {
  return WEIGHTS;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
