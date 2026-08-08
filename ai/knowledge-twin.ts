/**
 * ai/knowledge-twin.ts
 *
 * Candidate Knowledge Twin — Creation and Update
 *
 * The Knowledge Twin is a live, structured model of what the AI believes
 * the candidate knows at any given moment. It is initialised from the
 * Candidate Intelligence Profile and updated after every answer evaluation.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import type { TopicKnowledge, AnswerEvaluation, InterviewQuestion, ConfidenceLevel } from "@/types/interview";
import type { CandidateIntelligenceProfile } from "./candidate-profiler";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toConfidenceLevel(evidenceCount: number): ConfidenceLevel {
  if (evidenceCount >= 5) return "high";
  if (evidenceCount >= 3) return "medium";
  return "low";
}

/**
 * Compute a weighted rolling average score.
 * Recent evidence (higher weight) is more important than older evidence.
 */
function rollingAverage(currentScore: number, newScore: number, evidenceCount: number): number {
  // Weight the new score more heavily for low-evidence topics
  const weight = evidenceCount <= 1 ? 0.5 : 0.3;
  return currentScore * (1 - weight) + newScore * weight;
}

/**
 * Calculate a composite score from an AnswerEvaluation using official weights.
 */
function compositeScore(evaluation: AnswerEvaluation): number {
  return (
    evaluation.correctness * 0.35 +
    evaluation.reasoning * 0.25 +
    evaluation.depth * 0.20 +
    evaluation.communication * 0.10 +
    evaluation.engineering * 0.10
  );
}

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Creates the initial Candidate Knowledge Twin from the intelligence profile.
 *
 * Maps profile.initialKnowledgeEstimates to a structured twin.
 * Any topic in the curriculum not yet represented gets confidence="low".
 *
 * @param profile - Output of analyzeCandidate()
 * @returns Initial TopicKnowledge[] representing the estimated starting state
 */
export function createKnowledgeTwin(
  profile: CandidateIntelligenceProfile
): TopicKnowledge[] {
  if (profile.initialKnowledgeEstimates.length > 0) {
    return profile.initialKnowledgeEstimates.map((estimate) => ({
      topic: estimate.topic,
      estimatedScore: estimate.estimatedScore,
      confidence: estimate.confidence,
      evidenceCount: estimate.evidenceCount,
    }));
  }

  // Fallback: create initial entries from priority and weakness signals
  const allTopics = new Set([
    ...profile.priorityTopics,
    ...profile.weaknessSignals,
    ...profile.strengthSignals,
  ]);

  return Array.from(allTopics).map((topic) => ({
    topic,
    estimatedScore: profile.strengthSignals.includes(topic)
      ? 7
      : profile.weaknessSignals.includes(topic)
      ? 3
      : 5,
    confidence: "low" as ConfidenceLevel,
    evidenceCount: 0,
  }));
}

/**
 * Updates the Candidate Knowledge Twin after a new answer has been evaluated.
 *
 * - Finds or creates the TopicKnowledge entry for question.topic
 * - Computes a rolling average of the new evaluation score
 * - Increments evidenceCount by 1
 * - Updates confidence level based on evidenceCount thresholds
 *
 * Does NOT mutate the input array.
 *
 * @param currentTwin - The existing Knowledge Twin
 * @param question - The question that was just answered
 * @param evaluation - The evaluation of the candidate's answer
 * @returns Updated TopicKnowledge[] — immutable
 */
export function updateKnowledgeTwin(
  currentTwin: TopicKnowledge[],
  question: InterviewQuestion,
  evaluation: AnswerEvaluation
): TopicKnowledge[] {
  const newScore = compositeScore(evaluation);
  const existingIndex = currentTwin.findIndex(
    (t) => t.topic.toLowerCase() === question.topic.toLowerCase()
  );

  if (existingIndex === -1) {
    // Topic not in twin yet — add it
    const newEntry: TopicKnowledge = {
      topic: question.topic,
      estimatedScore: newScore,
      confidence: "low",
      evidenceCount: 1,
    };
    return [...currentTwin, newEntry];
  }

  // Update existing entry
  const existing = currentTwin[existingIndex];
  const updatedScore = rollingAverage(existing.estimatedScore, newScore, existing.evidenceCount);
  const updatedEvidenceCount = existing.evidenceCount + 1;

  const updated: TopicKnowledge = {
    topic: existing.topic,
    estimatedScore: Math.min(10, Math.max(0, updatedScore)),
    confidence: toConfidenceLevel(updatedEvidenceCount),
    evidenceCount: updatedEvidenceCount,
  };

  return currentTwin.map((t, i) => (i === existingIndex ? updated : t));
}
