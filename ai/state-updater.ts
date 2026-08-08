/**
 * ai/state-updater.ts
 *
 * Interview State Updater
 *
 * Applies the result of a completed interview turn (question + answer +
 * evaluation + decision) to produce the next InterviewState. This is a
 * pure function — it does not mutate the input and does not call any LLM.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import type {
  InterviewState,
  InterviewQuestion,
  AnswerEvaluation,
  TopicKnowledge,
} from "@/types/interview";
import type { DecisionResult } from "./decision-engine";

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Applies a completed interview turn to the current state, producing the
 * next state. Does NOT mutate the input state object.
 *
 * State transitions:
 *   - Appends InterviewTurn to questionHistory
 *   - Adds new misconceptions to state.misconceptions
 *   - Extracts and merges key claims into state.candidateClaims
 *   - Updates state.daysCovered if a new curriculum day was introduced
 *   - Updates state.currentTopic from decision.nextTopic
 *   - Adjusts difficulty based on decision.newDifficulty
 *   - Increments questionCount
 *   - Updates strengths and knowledgeGaps based on evaluation scores
 *
 * @param state - Current interview state before this turn
 * @param question - The question that was asked
 * @param answer - The candidate's raw answer text
 * @param evaluation - The evaluation of the answer
 * @param decision - The Decision Engine's routing result
 * @param updatedTwin - The Knowledge Twin updated by knowledge-twin.ts
 * @returns The next InterviewState
 */
export function applyTurnToState(
  state: InterviewState,
  question: InterviewQuestion,
  answer: string,
  evaluation: AnswerEvaluation,
  decision: DecisionResult,
  updatedTwin: TopicKnowledge[]
): InterviewState {
  // Extract a concise claim from the answer to track for contradiction detection
  // We take the first 200 chars as a representative claim
  const newClaim = answer.trim().slice(0, 200);

  // Update days covered
  const newDaysCovered = state.daysCovered.includes(question.curriculumDay)
    ? state.daysCovered
    : [...state.daysCovered, question.curriculumDay];

  // Compute composite score for this answer
  const compositeScore =
    evaluation.correctness * 0.35 +
    evaluation.reasoning * 0.25 +
    evaluation.depth * 0.20 +
    evaluation.communication * 0.10 +
    evaluation.engineering * 0.10;

  // Update strengths (score >= 7) and knowledge gaps (score < 5)
  let updatedStrengths = [...state.strengths];
  let updatedGaps = [...state.knowledgeGaps];

  if (compositeScore >= 7 && !updatedStrengths.includes(question.topic)) {
    updatedStrengths = [...updatedStrengths, question.topic];
  }
  if (compositeScore < 5) {
    if (!updatedGaps.includes(question.topic)) {
      updatedGaps = [...updatedGaps, question.topic];
    }
    for (const missing of evaluation.missingConcepts || []) {
      if (!updatedGaps.includes(missing)) {
        updatedGaps = [...updatedGaps, missing];
      }
    }
  }
  // Remove from gaps if they show improvement
  if (compositeScore >= 7) {
    updatedGaps = updatedGaps.filter((g) => g !== question.topic && g !== "No actual explanation provided");
  }

  return {
    ...state,
    questionCount: state.questionCount + 1,
    currentTopic: decision.nextTopic,
    difficulty: decision.newDifficulty ?? state.difficulty,
    daysCovered: newDaysCovered,
    knowledgeTwin: updatedTwin,
    strengths: updatedStrengths,
    knowledgeGaps: updatedGaps,
    questionHistory: [
      ...state.questionHistory,
      { question, answer, evaluation },
    ],
    misconceptions: [
      ...state.misconceptions,
      ...evaluation.misconceptions,
    ],
    candidateClaims: [
      ...state.candidateClaims,
      newClaim,
    ],
  };
}
