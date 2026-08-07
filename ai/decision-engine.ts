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
 *
 * TODO: Implement decideNextAction():
 *   Option A (rule-based): Apply deterministic rules to evaluation.nextAction
 *     and session constraints (e.g. minimum questions, day coverage).
 *   Option B (LLM-assisted): Use an LLM to weigh multiple signals.
 *   Coordinate with Member 2 on how the decision feeds into question generation.
 */

import type { NextAction, AnswerEvaluation, InterviewState } from "@/types/interview";
import type { InterviewPlan } from "./interview-planner";

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
}

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Determines the optimal next action after evaluating a candidate's answer.
 *
 * @param evaluation - The evaluation of the most recent answer
 * @param state - Current interview state
 * @param plan - The interview plan for this session
 * @returns DecisionResult directing the next question generation step
 *
 * TODO: Implement real decision logic.
 *   Rules to enforce:
 *   - Do not end before state.questionCount >= plan.minimumQuestions
 *   - Do not end before state.daysCovered.length >= 4
 *   - Respect evaluation.nextAction as the primary signal
 *   - Apply contradiction detection before contradiction action
 */
export function decideNextAction(
  evaluation: AnswerEvaluation,
  state: InterviewState,
  plan: InterviewPlan
): DecisionResult {
  void plan;

  // TODO: Implement real decision logic
  return {
    action: evaluation.nextAction,
    nextTopic: state.currentTopic,
    shouldEnd: false,
    rationale: "Scaffold placeholder — decideNextAction() not implemented.",
  };
}
