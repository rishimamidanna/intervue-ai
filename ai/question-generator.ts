/**
 * ai/question-generator.ts
 *
 * Adaptive Question Generator
 *
 * Generates a single interview question ONE AT A TIME based on the current
 * interview state, the interview plan, and the previous evaluation's nextAction.
 * Every generated question is unique within the session and contextually
 * relevant to the candidate's demonstrated knowledge level.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 *
 * TODO: Implement generateQuestion() using the LLM client:
 *   1. Build context-rich prompt from InterviewState + InterviewPlan
 *   2. Call createChatCompletion() with jsonMode: true
 *   3. Parse and validate against InterviewQuestionSchema
 *   4. Return validated InterviewQuestion
 */

import type { InterviewQuestion, InterviewState } from "@/types/interview";
import type { CurriculumDay } from "@/types/curriculum";
import type { InterviewPlan } from "./interview-planner";
import { generateId } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Generates the next interview question based on the current session state.
 *
 * @param state - Current interview session state
 * @param plan - The personalised interview plan for this candidate
 * @param curriculum - Full curriculum for topic resolution
 * @returns A single InterviewQuestion to present to the candidate
 *
 * TODO: Replace placeholder with real LLM call.
 *   Requirements:
 *   - Never repeat a question already in state.questionHistory
 *   - Respect state.difficulty as the current difficulty level
 *   - Use state.currentTopic unless plan indicates a topic change
 *   - Validate output with InterviewQuestionSchema before returning
 */
export async function generateQuestion(
  state: InterviewState,
  plan: InterviewPlan,
  curriculum: CurriculumDay[]
): Promise<InterviewQuestion> {
  void state;
  void plan;
  void curriculum;

  // TODO: Implement real LLM-based question generation
  // Placeholder compiles and returns a typed stub
  return {
    id: generateId(),
    text: "[Placeholder] Question generation not yet implemented.",
    topic: state.currentTopic || "General AI Engineering",
    curriculumDay: 1,
    difficulty: state.difficulty,
    reason: "Scaffold placeholder — generateQuestion() not implemented.",
    expectedConcepts: [],
  };
}
