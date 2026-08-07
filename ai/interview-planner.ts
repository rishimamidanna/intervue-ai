/**
 * ai/interview-planner.ts
 *
 * Interview Strategy Engine
 *
 * Creates a personalised interview strategy for a candidate based on their
 * Knowledge Twin and the full curriculum. The strategy determines which
 * curriculum days to focus on, the initial difficulty, and the order of topics.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 *
 * TODO: Implement createInterviewPlan() using the LLM client:
 *   1. Build a prompt from KnowledgeTwin + curriculum + constraints
 *   2. Call createChatCompletion() from lib/llm.ts
 *   3. Parse and validate the structured JSON response
 *   4. Return InterviewPlan
 */

import type { DifficultyLevel, TopicKnowledge } from "@/types/interview";
import type { CurriculumDay } from "@/types/curriculum";

// ---------------------------------------------------------------------------
// Output Type
// ---------------------------------------------------------------------------

/**
 * The personalised interview strategy created before the interview begins.
 * The Interview Controller uses this plan to guide question generation.
 */
export interface InterviewPlan {
  /** Ordered list of curriculum days to cover (minimum 4) */
  targetDays: number[];
  /** Ordered list of topics to explore */
  topicOrder: string[];
  /** Starting difficulty level for the first question */
  startingDifficulty: DifficultyLevel;
  /** Minimum number of questions to ask (must be >= 8) */
  minimumQuestions: number;
  /** Topics to avoid spending too long on (strong prior evidence) */
  deprioritisedTopics: string[];
  /** Rationale for the strategy — used in debugging and reporting */
  rationale: string;
}

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Creates a personalised interview strategy from the candidate's Knowledge Twin.
 *
 * @param knowledgeTwin - Current state of the Candidate Knowledge Twin
 * @param curriculum - Full curriculum used to resolve day → topic mappings
 * @returns InterviewPlan guiding question selection throughout the session
 *
 * TODO: Replace placeholder return with real LLM-powered strategy creation.
 *   Constraints:
 *   - Must target at least 4 distinct curriculum days
 *   - Must set minimumQuestions >= 8
 *   - Should prioritise weak areas and skip-heavy topics
 */
export async function createInterviewPlan(
  knowledgeTwin: TopicKnowledge[],
  curriculum: CurriculumDay[]
): Promise<InterviewPlan> {
  void knowledgeTwin;
  void curriculum;

  // TODO: Implement real LLM-based interview strategy
  return {
    targetDays: [],
    topicOrder: [],
    startingDifficulty: 2,
    minimumQuestions: 8,
    deprioritisedTopics: [],
    rationale: "Not implemented — createInterviewPlan() is a scaffold stub.",
  };
}
