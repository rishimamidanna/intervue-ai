/**
 * prompts/evaluator.prompt.ts
 *
 * Prompts for the Answer Evaluation Engine.
 *
 * TODO (Member 3 — AI): Implement these prompts to:
 *   - Accept the question, candidate answer, and session context
 *   - Evaluate across all 5 dimensions (correctness, reasoning, depth,
 *     communication, engineering) on a 0–10 scale
 *   - Identify covered concepts, missing concepts, and misconceptions
 *   - Determine the appropriate nextAction for the Decision Engine
 *   - Request JSON output matching AnswerEvaluation schema
 *   - Be strict and calibrated — scores should reflect real engineering standards
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

/** System prompt establishing the Answer Evaluator persona */
export const EVALUATOR_SYSTEM_PROMPT = "";

/**
 * User prompt template for answer evaluation.
 * Expects placeholders: {question}, {answer}, {expectedConcepts}, {sessionContext}
 */
export const EVALUATOR_USER_PROMPT = "";
