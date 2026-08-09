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
 */

import type { DifficultyLevel, TopicKnowledge } from "@/types/interview";
import type { CurriculumDay } from "@/types/curriculum";
import { createJsonCompletion } from "@/lib/llm";
import { MIN_CURRICULUM_DAYS, MIN_INTERVIEW_QUESTIONS } from "@/lib/constants";

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
 * Constraints:
 *   - Must target at least 4 distinct curriculum days
 *   - Must set minimumQuestions >= 8
 *   - Should prioritise weak areas and skip-heavy topics
 */
export async function createInterviewPlan(
  knowledgeTwin: TopicKnowledge[],
  curriculum: CurriculumDay[]
): Promise<InterviewPlan> {
  // Build curriculum day map for the prompt
  const curriculumSummary = curriculum
    .slice(0, 31)
    .map((day) => `Day ${day.day}: ${day.topic}`)
    .join("\n");

  // Summarize the knowledge twin
  const twinSummary =
    knowledgeTwin.length > 0
      ? knowledgeTwin
          .map(
            (t) =>
              `- ${t.topic}: score=${t.estimatedScore}/10, confidence=${t.confidence}, evidence=${t.evidenceCount}`
          )
          .join("\n")
      : "No prior knowledge data available — treat as a fresh candidate.";

  const systemPrompt = `You are an expert technical interview strategist for an AI engineering program.
Your task is to create a personalised interview plan based on a candidate's knowledge profile.

Rules you MUST follow:
1. targetDays MUST contain at least ${MIN_CURRICULUM_DAYS} distinct curriculum day numbers.
2. minimumQuestions MUST be at least ${MIN_INTERVIEW_QUESTIONS}.
3. Prioritise topics where estimatedScore < 6 or confidence = "low".
4. Deprioritise topics where estimatedScore >= 8 and confidence = "high".
5. startingDifficulty should be 2 for beginners, 3 for intermediate, 4 for advanced candidates.

Return ONLY valid JSON. No markdown, no extra text.`;

  const userPrompt = `Create an interview plan for this candidate.

CANDIDATE KNOWLEDGE TWIN:
${twinSummary}

AVAILABLE CURRICULUM DAYS:
${curriculumSummary}

Return this exact JSON structure:
{
  "targetDays": [1, 5, 10, 15],
  "topicOrder": ["Topic A", "Topic B", "Topic C", "Topic D"],
  "startingDifficulty": 2,
  "minimumQuestions": 10,
  "deprioritisedTopics": ["Strong Topic"],
  "rationale": "Brief explanation of the strategy"
}

Ensure targetDays has at least ${MIN_CURRICULUM_DAYS} entries and minimumQuestions >= ${MIN_INTERVIEW_QUESTIONS}.`;

  let plan: InterviewPlan;
  try {
    plan = await createJsonCompletion<InterviewPlan>([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
  } catch (err) {
    console.warn("[InterviewPlanner] LLM API call failed, using curriculum fallback plan:", err);
    const targetDays = curriculum.slice(0, 4).map((d) => d.day);
    const topicOrder = curriculum.slice(0, 6).map((d) => d.topic);
    plan = {
      targetDays,
      topicOrder,
      startingDifficulty: 2,
      minimumQuestions: MIN_INTERVIEW_QUESTIONS,
      deprioritisedTopics: [],
      rationale: "Curriculum fallback strategy due to offline/rate-limited LLM service.",
    };
  }

  // Enforce hard constraints regardless of LLM output
  return {
    ...plan,
    minimumQuestions: Math.max(plan.minimumQuestions, MIN_INTERVIEW_QUESTIONS),
    targetDays:
      plan.targetDays.length >= MIN_CURRICULUM_DAYS
        ? plan.targetDays
        : [...plan.targetDays, ...curriculum.slice(0, MIN_CURRICULUM_DAYS).map((d) => d.day)].slice(
            0,
            MIN_CURRICULUM_DAYS
          ),
  };
}
