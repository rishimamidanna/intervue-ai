/**
 * ai/contradiction-detector.ts
 *
 * Contradiction Detection Engine
 *
 * Monitors the candidate's accumulated claims across all turns and surfaces
 * contradictions — where the candidate has made statements in different answers
 * that are logically inconsistent. When a contradiction is detected, the
 * Decision Engine may choose to surface it as a follow-up question.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 *
 * TODO: Implement detectContradiction() using the LLM client:
 *   1. Build a prompt from state.candidateClaims + current answer
 *   2. Ask the LLM to identify any logical inconsistency
 *   3. Validate and return ContradictionResult
 */

import type { InterviewState } from "@/types/interview";

// ---------------------------------------------------------------------------
// Output Type
// ---------------------------------------------------------------------------

export interface ContradictionResult {
  /** Whether a contradiction was detected */
  detected: boolean;
  /** Human-readable description of the contradiction, if detected */
  description?: string;
  /** Claims that are in conflict, if detected */
  conflictingClaims?: [string, string];
}

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Analyses the candidate's answer against prior claims for contradictions.
 *
 * @param answer - The candidate's most recent answer
 * @param state - Current interview state containing candidateClaims history
 * @returns ContradictionResult indicating whether a contradiction was found
 *
 * TODO: Implement real LLM-based contradiction detection.
 *   Only trigger this check if state.candidateClaims.length > 0.
 *   Use the contradiction prompt from prompts/contradiction.prompt.ts.
 */
export async function detectContradiction(
  answer: string,
  state: InterviewState
): Promise<ContradictionResult> {
  void answer;
  void state;

  // TODO: Implement real contradiction detection
  return { detected: false };
}
