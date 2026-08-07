/**
 * ai/state-updater.ts
 *
 * Interview State Updater
 *
 * Applies the result of a completed interview turn (question + answer +
 * evaluation + decision) to produce the next InterviewState. This is a
 * pure function — it does not mutate the input and does not call any LLM.
 *
 * Owner: Member 3 (AI / Prompt Engineering) — coordinate with Member 2
 *   on how the updated state is persisted in server/interview-state.ts
 *
 * TODO: Implement applyTurnToState() with full state transition logic.
 */

import type { InterviewState, InterviewQuestion, AnswerEvaluation, TopicKnowledge } from "@/types/interview";
import type { DecisionResult } from "./decision-engine";

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Applies a completed interview turn to the current state, producing the
 * next state. Does NOT mutate the input state object.
 *
 * @param state - Current interview state before this turn
 * @param question - The question that was asked
 * @param answer - The candidate's raw answer text
 * @param evaluation - The evaluation of the answer
 * @param decision - The Decision Engine's routing result
 * @param updatedTwin - The Knowledge Twin updated by knowledge-twin.ts
 * @returns The next InterviewState
 *
 * TODO: Implement full state transition:
 *   - Append InterviewTurn to questionHistory
 *   - Add any new misconceptions to state.misconceptions
 *   - Merge new claims into state.candidateClaims
 *   - Update state.daysCovered if a new day is introduced
 *   - Update state.currentTopic from decision.nextTopic
 *   - Apply difficulty change if decision.action includes difficulty adjustment
 *   - Increment questionCount
 */
export function applyTurnToState(
  state: InterviewState,
  question: InterviewQuestion,
  answer: string,
  evaluation: AnswerEvaluation,
  decision: DecisionResult,
  updatedTwin: TopicKnowledge[]
): InterviewState {
  // TODO: Implement full state transition logic
  return {
    ...state,
    questionCount: state.questionCount + 1,
    currentTopic: decision.nextTopic,
    knowledgeTwin: updatedTwin,
    questionHistory: [
      ...state.questionHistory,
      { question, answer, evaluation },
    ],
    misconceptions: [
      ...state.misconceptions,
      ...evaluation.misconceptions,
    ],
  };
}
