/**
 * ai/contradiction-detector.ts
 *
 * Contradiction Detection Engine
 *
 * Monitors the candidate's accumulated claims across all turns and surfaces
 * contradictions — where the candidate has made statements in different answers
 * that are logically inconsistent.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import type { InterviewState } from "@/types/interview";
import { createJsonCompletion } from "@/lib/llm";

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
 * Only runs when there are prior claims to check against (>= 2 prior turns).
 * Uses Gemini for natural language contradiction detection.
 *
 * @param answer - The candidate's most recent answer
 * @param state - Current interview state containing candidateClaims history
 * @returns ContradictionResult indicating whether a contradiction was found
 */
export async function detectContradiction(
  answer: string,
  state: InterviewState
): Promise<ContradictionResult> {
  // Skip detection if there are not enough prior claims to compare against
  if (state.candidateClaims.length < 2) {
    return { detected: false };
  }

  const priorClaims = state.candidateClaims
    .slice(-10) // Only check the last 10 claims to keep the prompt focused
    .map((c, i) => `Claim ${i + 1}: "${c}"`)
    .join("\n");

  const systemPrompt = `You are a sharp technical interviewer checking for logical inconsistencies in a candidate's answers.
Your task is to determine if the candidate's current answer CONTRADICTS any of their prior statements.

A contradiction exists when:
- The candidate claims X is true in one answer but claims X is false in another
- The candidate describes a process/concept differently in ways that are mutually exclusive
- The candidate attributes something to one cause, then to a different incompatible cause

Do NOT flag:
- Different levels of detail (elaborating further is not a contradiction)
- Correcting themselves when prompted
- Using different terminology for the same concept

Be conservative — only flag clear, definitive contradictions.

Return ONLY valid JSON. No markdown, no extra text.`;

  const userPrompt = `Check for contradictions.

PRIOR CLAIMS FROM THIS CANDIDATE:
${priorClaims}

CURRENT ANSWER:
"${answer}"

Return this exact JSON:
{
  "detected": true or false,
  "description": "Brief description of the contradiction (or null if not detected)",
  "conflictingClaims": ["claim A", "claim B"] or null
}`;

  try {
    const result = await createJsonCompletion<ContradictionResult>([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
    return result;
  } catch {
    // Contradiction detection is non-critical — fail silently
    return { detected: false };
  }
}
