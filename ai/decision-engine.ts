/**
 * ai/decision-engine.ts
 *
 * Adaptive Decision Engine
 *
 * After each answer evaluation, the Decision Engine determines the optimal
 * next action for the interview. It considers the evaluation's nextAction
 * suggestion, the overall session state, and the interview plan to produce
 * the final routing decision.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import type { NextAction, AnswerEvaluation, InterviewState, DifficultyLevel } from "@/types/interview";
import type { InterviewPlan } from "./interview-planner";
import { MIN_CURRICULUM_DAYS, MIN_INTERVIEW_QUESTIONS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Output Type
// ---------------------------------------------------------------------------

export interface DecisionResult {
  /** The resolved action to take */
  action: NextAction;
  /** The topic to address in the next question */
  nextTopic: string;
  /** Whether the interview should end after this turn */
  shouldEnd: boolean;
  /** Reasoning behind the decision (for debugging and reporting) */
  rationale: string;
  /** New difficulty level after this turn */
  newDifficulty: DifficultyLevel;
}

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Determines the optimal next action after evaluating a candidate's answer.
 *
 * Rule-based decision engine (deterministic — no LLM call needed).
 * Respects all hard constraints: min questions, min days covered.
 *
 * @param evaluation - The evaluation of the most recent answer
 * @param state - Current interview state
 * @param plan - The interview plan for this session
 * @returns DecisionResult directing the next question generation step
 */
export function decideNextAction(
  evaluation: AnswerEvaluation,
  state: InterviewState,
  plan: InterviewPlan
): DecisionResult {
  const meetsMinQuestions = state.questionCount >= MIN_INTERVIEW_QUESTIONS;
  const meetsMinDays = state.daysCovered.length >= MIN_CURRICULUM_DAYS;

  // Calculate composite score for this answer
  const compositeScore =
    evaluation.correctness * 0.35 +
    evaluation.reasoning * 0.25 +
    evaluation.depth * 0.20 +
    evaluation.communication * 0.10 +
    evaluation.engineering * 0.10;

  // Determine difficulty adjustment
  let newDifficulty: DifficultyLevel = state.difficulty;
  if (compositeScore >= 7.5 && state.difficulty < 5) {
    newDifficulty = Math.min(5, state.difficulty + 1) as DifficultyLevel;
  } else if (compositeScore < 4 && state.difficulty > 1) {
    newDifficulty = Math.max(1, state.difficulty - 1) as DifficultyLevel;
  }

  // Determine the next topic
  const currentTopicIndex = plan.topicOrder.indexOf(state.currentTopic);
  const nextTopicFromPlan =
    plan.topicOrder[currentTopicIndex + 1] ?? plan.topicOrder[0] ?? state.currentTopic;

  // Decide whether to stay on topic or move on based on the evaluation action
  const stayOnTopic =
    evaluation.nextAction === "follow_up" ||
    evaluation.nextAction === "probe" ||
    evaluation.nextAction === "increase_difficulty" ||
    evaluation.nextAction === "decrease_difficulty" ||
    evaluation.nextAction === "contradiction";

  const nextTopic = stayOnTopic ? state.currentTopic : nextTopicFromPlan;

  // Check if we should end the interview
  // Only end if BOTH constraints are met AND the LLM suggested wrapping up
  const shouldEnd =
    meetsMinQuestions &&
    meetsMinDays &&
    (evaluation.nextAction === "new_topic" && currentTopicIndex >= plan.topicOrder.length - 1);

  // Build rationale
  const rationale =
    `Score: ${compositeScore.toFixed(1)}/10. ` +
    `Questions: ${state.questionCount}/${MIN_INTERVIEW_QUESTIONS} min. ` +
    `Days covered: ${state.daysCovered.length}/${MIN_CURRICULUM_DAYS} min. ` +
    `Action: ${evaluation.nextAction}. ` +
    `${shouldEnd ? "Completing interview — all requirements met." : `Continuing with topic: ${nextTopic}.`}`;

  return {
    action: evaluation.nextAction,
    nextTopic,
    shouldEnd,
    rationale,
    newDifficulty,
  };
}
