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
import type { RetrievedCurriculumContext } from "@/server/curriculum-service";
import { createJsonCompletion } from "@/lib/llm";

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if the candidate answer is repeating or echoing the question text.
 */
function checkQuestionRepetition(answer: string, questionText: string): boolean {
  const normAns = answer.trim().toLowerCase().replace(/[^\w\s]/g, "");
  const normQ = questionText.trim().toLowerCase().replace(/[^\w\s]/g, "");

  if (normAns.length === 0) return true;

  // Exact or near-exact match
  if (normAns === normQ || normQ.includes(normAns) || normAns.includes(normQ)) {
    if (Math.abs(normAns.length - normQ.length) < normQ.length * 0.45) {
      return true;
    }
  }

  // Word overlap comparison
  const ansWords = normAns.split(/\s+/).filter((w) => w.length > 2);
  const qWords = new Set(normQ.split(/\s+/).filter((w) => w.length > 2));

  if (ansWords.length === 0) return true;

  const overlapCount = ansWords.filter((w) => qWords.has(w)).length;
  const overlapRatio = overlapCount / ansWords.length;
  const newWords = ansWords.filter((w) => !qWords.has(w));

  // If >= 60% of words in candidate's answer match the question and < 3 new words introduced
  if (overlapRatio >= 0.6 && newWords.length < 3) {
    return true;
  }

  return false;
}

/**
 * Checks if candidate provided a non-answer (e.g. "I don't know", "pass", empty).
 */
function checkNonAnswer(answer: string): boolean {
  const clean = answer.trim().toLowerCase().replace(/[^\w\s]/g, "");
  const nonAnswers = [
    "i dont know",
    "i dont know it",
    "i don't know",
    "dont know",
    "don't know",
    "idk",
    "no idea",
    "not sure",
    "no clue",
    "pass",
    "skip",
    "none",
    "na",
    "n/a",
    "dunno",
  ];
  return nonAnswers.includes(clean) || clean.length < 4;
}

/**
 * Checks if candidate provided an overly shallow or single-word answer (e.g. "RAG").
 */
function checkShallowAnswer(answer: string): boolean {
  const clean = answer.trim().toLowerCase().replace(/[^\w\s]/g, "");
  const words = clean.split(/\s+/).filter((w) => w.length > 0);
  return words.length <= 2 && clean.length < 15;
}

/**
 * Validates whether candidate answer contains explanation structure indicators (verbs/connectives).
 * Fails for noun phrases or raw keywords lacking explanatory flow.
 */
function checkExplanationStructure(answer: string): boolean {
  const clean = answer.trim().toLowerCase();
  const words = clean.split(/\s+/).filter((w) => w.length > 0);

  // Answers with >= 30 words are treated as structured explanations
  if (words.length >= 30) return true;

  const indicators = [
    "how", "why", "uses", "use", "using", "used",
    "retrieves", "retrieve", "retrieving", "retrieval",
    "generates", "generate", "generating", "generation",
    "because", "by", "provides", "provide", "providing",
    "improves", "improve", "improving", "combines", "combine",
    "combining", "balances", "balance", "balancing",
    "enables", "enable", "enabling", "allows", "allow",
    "calculates", "calculate", "calculating", "works",
    "processes", "process", "processing", "performs",
    "helps", "serves", "acts", "is a", "is an", "is the"
  ];

  return indicators.some((ind) => clean.includes(ind));
}

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Evaluates a candidate's answer to a specific interview question.
 *
 * @param question - The question that was asked
 * @param answer - The candidate's raw text answer
 * @param state - Current interview state for contextual evaluation
 * @param retrievedContext - Optional curriculum retrieval context for grounded evaluation
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
  state: InterviewState,
  retrievedContext?: RetrievedCurriculumContext
): Promise<AnswerEvaluation> {
  // 1. QUESTION REPETITION CHECK
  if (checkQuestionRepetition(answer, question.text)) {
    return {
      correctness: 0,
      reasoning: 0,
      depth: 0,
      communication: 2,
      engineering: 0,
      coveredConcepts: [],
      missingConcepts: ["No explanation provided", ...question.expectedConcepts],
      misconceptions: ["Copied or echoed the question text instead of answering"],
      nextAction: "probe",
    };
  }

  // 2. NON-ANSWER CHECK
  if (checkNonAnswer(answer)) {
    return {
      correctness: 1,
      reasoning: 0,
      depth: 0,
      communication: 3,
      engineering: 0,
      coveredConcepts: [],
      missingConcepts: ["No explanation provided", ...question.expectedConcepts],
      misconceptions: [],
      nextAction: "probe",
    };
  }

  // 3. SHALLOW / UNSTRUCTURED EXPLANATION CHECK (e.g. single word "RAG" or "RAG architecture")
  if (checkShallowAnswer(answer) || !checkExplanationStructure(answer)) {
    return {
      correctness: 2,
      reasoning: 1,
      depth: 1,
      communication: 3,
      engineering: 1,
      coveredConcepts: [],
      missingConcepts: ["Insufficient explanation provided", ...question.expectedConcepts],
      misconceptions: ["Contains keywords or terms but lacks an actual explanation"],
      nextAction: "probe",
    };
  }

  // Build context about prior performance
  const priorContext =
    state.questionHistory.length > 0
      ? `Prior performance: ${state.questionHistory.length} questions answered. ` +
        `Strengths: ${state.strengths.join(", ") || "none identified"}. ` +
        `Gaps: ${state.knowledgeGaps.join(", ") || "none identified"}.`
      : "This is the first question in the session.";

  const systemPrompt = `You are an expert technical interviewer evaluating a candidate's answer in an AI engineering interview.

CRITICAL EVALUATION RULES:
1. REPETITION / ECHOING: If candidate echoes or repeats the question without providing an independent explanation, correctness MUST be 0/10 and depth 0/10. Add "No explanation provided" to missingConcepts.
2. ANSWER DEPTH: Demand actual explanation, reasoning, technical mechanics, and trade-offs. Do not reward keyword matching alone.
3. GROUNDED EVALUATION: Compare candidate's response against retrieved curriculum objectives and key concepts. Differentiate between concepts actually EXPLAINED vs merely mentioned vs missing.

Scoring rubric (each dimension 0–10):
- correctness: Is the answer factually and technically accurate against curriculum context? (0=completely wrong/echoing, 10=perfectly accurate)
- reasoning: Does the candidate reason logically and connect concepts? (0=no reasoning, 10=excellent logical flow)
- depth: Does the answer go beyond surface recall to show genuine understanding? (0=surface only, 10=deep mastery)
- communication: Is the answer clear, structured, and articulate? (0=incoherent, 10=perfectly clear)
- engineering: Does the candidate show practical real-world judgment? (0=no practical awareness, 10=excellent engineering intuition)

nextAction guide:
- "follow_up": Answer was partially correct or interesting — probe deeper on same topic
- "probe": Answer was ambiguous, shallow, or repeated the question — ask for clarification
- "increase_difficulty": Answer was strong — escalate difficulty on same topic
- "decrease_difficulty": Answer was weak or missing — step down to foundational concepts
- "new_topic": Answer was complete — move to a new curriculum topic
- "cross_concept": Answer reveals a gap in a related area — bridge to that concept
- "contradiction": Answer contradicts something said earlier

Return ONLY valid JSON. No markdown, no extra text.`;

  const retrievedSection = retrievedContext
    ? `RETRIEVED CURRICULUM CONTEXT:
- Expected Learning Objectives: ${retrievedContext.learningObjectives.join("; ") || "Core concept mastery"}
- Required Key Concepts: ${retrievedContext.keyConcepts.join(", ") || question.expectedConcepts.join(", ")}
- Related Cross-Concepts: ${retrievedContext.relatedConcepts.join(", ") || "N/A"}`
    : `EXPECTED CONCEPTS: ${question.expectedConcepts.join(", ")}`;

  const userPrompt = `Evaluate this interview answer strictly against the retrieved curriculum context and candidate state.

QUESTION: ${question.text}
TOPIC: ${question.topic} (Curriculum Day ${question.curriculumDay})
DIFFICULTY: ${question.difficulty}/5

${retrievedSection}

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

  let evaluation: AnswerEvaluation;
  try {
    evaluation = await createJsonCompletion<AnswerEvaluation>([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
  } catch (err) {
    console.warn("[AnswerEvaluator] LLM API call failed, using heuristic fallback evaluation:", err);
    const normAns = answer.toLowerCase();
    const expected = question.expectedConcepts || [];
    const matched = expected.filter((c) => normAns.includes(c.toLowerCase()));
    const missing = expected.filter((c) => !normAns.includes(c.toLowerCase()));

    const matchRatio = expected.length > 0 ? matched.length / expected.length : 0.5;
    const lenBonus = Math.min(3, Math.floor(answer.trim().length / 60));

    const correctnessScore = Math.min(10, Math.max(3, Math.round(matchRatio * 7 + lenBonus)));
    const reasoningScore = Math.min(10, Math.max(3, Math.round(correctnessScore * 0.9)));
    const depthScore = Math.min(10, Math.max(2, Math.round(correctnessScore * 0.8)));

    const nextAction: AnswerEvaluation["nextAction"] =
      correctnessScore >= 8 ? "increase_difficulty" : correctnessScore >= 5 ? "follow_up" : "decrease_difficulty";

    evaluation = {
      correctness: correctnessScore,
      reasoning: reasoningScore,
      depth: depthScore,
      communication: 7,
      engineering: Math.min(10, correctnessScore),
      coveredConcepts: matched.length > 0 ? matched : ["General Concepts"],
      missingConcepts: missing,
      misconceptions: [],
      nextAction,
    };
  }

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
