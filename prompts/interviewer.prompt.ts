/**
 * prompts/interviewer.prompt.ts
 *
 * Prompts for the Adaptive AI Interviewer (Question Generator).
 *
 * TODO (Member 3 — AI): Implement these prompts to:
 *   - Accept full session state, interview plan, and last evaluation as context
 *   - Generate exactly ONE question per call (not a list)
 *   - Ensure the question has never been asked in this session
 *   - Respect the current difficulty level
 *   - Respect the nextAction from the Decision Engine
 *   - Request JSON output matching InterviewQuestion schema
 *   - Include chain-of-thought reasoning for question selection
 *
 * The INTERVIEWER_SYSTEM_PROMPT should establish the AI Interviewer persona:
 *   - Expert technical interviewer for AI engineering roles
 *   - Adaptive and empathetic tone
 *   - One question at a time, never lists
 *   - "Every Answer Changes the Interview" core principle
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

/** System prompt establishing the Adaptive AI Interviewer persona */
export const INTERVIEWER_SYSTEM_PROMPT = "";

/**
 * User prompt template for question generation.
 * Expects placeholders: {sessionState}, {plan}, {lastEvaluation}, {nextAction}
 */
export const INTERVIEWER_USER_PROMPT = "";
