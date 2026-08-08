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
 */

import type { InterviewQuestion, InterviewState } from "@/types/interview";
import type { CurriculumDay } from "@/types/curriculum";
import type { InterviewPlan } from "./interview-planner";
import { generateId } from "@/lib/utils";
import { createJsonCompletion } from "@/lib/llm";

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
 * Requirements:
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
  // Determine the next topic to ask about
  const askedTopics = state.questionHistory.map((t) => t.question.topic);
  const nextTopic =
    plan.topicOrder.find((t) => !plan.deprioritisedTopics.includes(t)) ??
    state.currentTopic ??
    plan.topicOrder[0] ??
    "AI Engineering Fundamentals";

  // Find the curriculum day for this topic
  const curriculumDay =
    curriculum.find(
      (d) =>
        d.topic?.toLowerCase().includes(nextTopic.toLowerCase()) ||
        nextTopic.toLowerCase().includes(d.topic?.toLowerCase() ?? "")
    ) ??
    curriculum.find((d) => plan.targetDays.includes(d.day)) ??
    curriculum[0];

  // Build context about previously asked questions to avoid repetition
  const askedQuestions =
    state.questionHistory.length > 0
      ? state.questionHistory
          .slice(-5)
          .map((t, i) => `Q${i + 1}: ${t.question.text}`)
          .join("\n")
      : "None yet — this is the first question.";

  // Recent answers for follow-up context
  const recentAnswers =
    state.questionHistory.length > 0
      ? state.questionHistory
          .slice(-3)
          .map((t, i) => `A${i + 1}: ${t.answer.slice(0, 200)}`)
          .join("\n")
      : "None yet.";

  // Gaps and strengths for adaptive questioning
  const gaps = state.knowledgeGaps.join(", ") || "None identified yet";
  const strengths = state.strengths.join(", ") || "None identified yet";

  const systemPrompt = `You are a senior AI engineer conducting a rigorous technical interview for an AI engineering cohort graduate.

Your role is to ask EXACTLY ONE focused, specific technical question at the appropriate difficulty level.

Interview style:
- Be conversational but professional, like a real technical interviewer
- Ask questions that reveal genuine understanding, not just memorized facts
- Difficulty 1-2: Conceptual/definitional questions
- Difficulty 3: Application and "how would you" questions  
- Difficulty 4-5: Complex design, tradeoffs, and edge case questions
- Do NOT ask compound multi-part questions
- Do NOT repeat questions that have already been asked

Return ONLY valid JSON. No markdown, no extra text.`;

  const userPrompt = `Generate the next interview question.

SESSION STATE:
- Questions asked so far: ${state.questionCount}
- Current difficulty: ${state.difficulty}/5
- Current topic: ${nextTopic}
- Curriculum day: ${curriculumDay?.day ?? 1}
- Known strengths: ${strengths}
- Knowledge gaps: ${gaps}
- Topics covered: ${[...new Set(askedTopics)].join(", ") || "None yet"}

CURRICULUM CONTEXT (Day ${curriculumDay?.day ?? 1}):
Topic: ${curriculumDay?.topic ?? nextTopic}
Learning Objectives: ${curriculumDay?.learningObjectives?.join(", ") ?? "Advanced AI engineering concepts"}
Key Concepts: ${curriculumDay?.concepts?.join(", ") ?? ""}

RECENTLY ASKED QUESTIONS (do NOT repeat these):
${askedQuestions}

RECENT CANDIDATE ANSWERS (use for follow-up context):
${recentAnswers}

Return this exact JSON:
{
  "text": "The full question text to ask the candidate",
  "topic": "${nextTopic}",
  "curriculumDay": ${curriculumDay?.day ?? 1},
  "difficulty": ${state.difficulty},
  "reason": "Why this question was chosen at this point in the interview",
  "expectedConcepts": ["concept1", "concept2", "concept3"]
}`;

  const raw = await createJsonCompletion<Omit<InterviewQuestion, "id">>([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  return {
    id: generateId(),
    ...raw,
    difficulty: state.difficulty, // Always use state difficulty as the source of truth
  };
}
