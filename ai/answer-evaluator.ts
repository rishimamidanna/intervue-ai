/**
 * ai/answer-evaluator.ts
 *
 * Answer Evaluation Engine
 *
 * Evaluates a candidate's raw answer against the question's expected concepts
 * and the current knowledge context. Produces a structured AnswerEvaluation
 * that drives both the scoring system and the Decision Engine.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import type { AnswerEvaluation, InterviewQuestion, InterviewState } from "@/types/interview";
import { createJsonCompletion } from "@/lib/llm";

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Evaluates a candidate's answer to a specific interview question.
 *
 * @param question - The question that was asked
 * @param answer - The candidate's raw text answer
 * @param state - Current interview state for contextual evaluation
 * @returns Structured AnswerEvaluation with scores and nextAction
 *
 * Evaluation dimensions (each 0–10):
 *   - correctness (35% weight): Is the answer factually accurate?
 *   - reasoning (25% weight): Does the candidate reason logically?
 *   - depth (20% weight): Does the answer go beyond surface recall?
 *   - communication (10% weight): Is the answer clear and articulate?
 *   - engineering (10% weight): Is practical judgement demonstrated?
 */
export async function evaluateAnswer(
  question: InterviewQuestion,
  answer: string,
  state: InterviewState
): Promise<AnswerEvaluation> {
  // Build context about prior performance
  const priorContext =
    state.questionHistory.length > 0
      ? `Prior performance: ${state.questionHistory.length} questions answered. ` +
        `Strengths: ${state.strengths.join(", ") || "none identified"}. ` +
        `Gaps: ${state.knowledgeGaps.join(", ") || "none identified"}.`
      : "This is the first question in the session.";

  const systemPrompt = `You are an expert technical interviewer evaluating a candidate's answer in an AI engineering interview.

Scoring rubric (each dimension 0–10):
- correctness: Is the answer factually and technically accurate? (0=completely wrong, 10=perfectly accurate)
- reasoning: Does the candidate reason logically and connect concepts? (0=no reasoning, 10=excellent logical flow)
- depth: Does the answer go beyond surface recall to show genuine understanding? (0=surface only, 10=deep mastery)
- communication: Is the answer clear, structured, and articulate? (0=incoherent, 10=perfectly clear)
- engineering: Does the candidate show practical real-world judgment? (0=no practical awareness, 10=excellent engineering intuition)

nextAction guide:
- "follow_up": Answer was partially correct or interesting — probe deeper on same topic
- "probe": Answer was ambiguous or made unclear claims — ask for clarification
- "increase_difficulty": Answer was strong — escalate difficulty on same topic
- "decrease_difficulty": Answer was weak — step down to foundational concepts
- "new_topic": Answer was complete — move to a new curriculum topic
- "cross_concept": Answer reveals a gap in a related area — bridge to that concept
- "contradiction": Answer contradicts something said earlier

Return ONLY valid JSON. No markdown, no extra text.`;

  const userPrompt = `Evaluate this interview answer.

QUESTION: ${question.text}
TOPIC: ${question.topic} (Curriculum Day ${question.curriculumDay})
DIFFICULTY: ${question.difficulty}/5
EXPECTED CONCEPTS: ${question.expectedConcepts.join(", ")}

CANDIDATE'S ANSWER:
"${answer}"

${priorContext}

Return this exact JSON:
{
  "correctness": 0-10,
  "reasoning": 0-10,
  "depth": 0-10,
  "communication": 0-10,
  "engineering": 0-10,
  "coveredConcepts": ["concepts the candidate mentioned correctly"],
  "missingConcepts": ["expected concepts the candidate missed"],
  "misconceptions": ["any factually incorrect statements made"],
  "nextAction": "follow_up|probe|increase_difficulty|decrease_difficulty|new_topic|cross_concept|contradiction"
}`;

  const evaluation = await createJsonCompletion<AnswerEvaluation>([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  // Clamp all scores to valid range [0, 10]
  return {
    ...evaluation,
    correctness: Math.min(10, Math.max(0, evaluation.correctness)),
    reasoning: Math.min(10, Math.max(0, evaluation.reasoning)),
    depth: Math.min(10, Math.max(0, evaluation.depth)),
    communication: Math.min(10, Math.max(0, evaluation.communication)),
    engineering: Math.min(10, Math.max(0, evaluation.engineering)),
  };
}
