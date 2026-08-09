/**
 * server/interview-controller.ts
 *
 * Interview Controller — Central Pipeline Orchestrator
 *
 * Orchestrates the complete interview pipeline for both the official Hackathon API
 * (POST /api/interview) and internal development helpers.
 *
 * Pipeline Flow:
 *   initializeInterview → loadCurriculum → analyzeCandidate → createKnowledgeTwin
 *   → createInterviewPlan → createSession → generateQuestion → return reply + done:false
 *
 *   handleConversationTurn → loadSession → record candidate message → evaluate previous answer
 *   → updateKnowledgeTwin → updateInterviewState → decideNextAction
 *   → check completion conditions (min 8 questions & min 4 curriculum days)
 *   → either: generate next question (reply + done:false)
 *     OR: generate final feedback & completeInterview (reply + done:true + feedback)
 *
 * Owner: Member 2 (Backend / API)
 */

import type { CandidateProfile } from "@/types/candidate";
import type { InterviewQuestion, AnswerEvaluation, InterviewState, InterviewTurn } from "@/types/interview";
import type { FinalFeedback } from "@/types/feedback";
import type {
  InterviewInProgressResponse,
  InterviewCompletedResponse,
  InterviewResponse,
  InterviewFeedback,
  InternalStartInterviewResponse,
  InternalSubmitAnswerResponse,
  InterviewProgress,
} from "@/types/api";

import { MIN_INTERVIEW_QUESTIONS, MIN_CURRICULUM_DAYS } from "@/lib/constants";
import { createSession, requireSession } from "./session-manager";
import { setState } from "./interview-state";
import { loadCurriculum, retrieveCurriculumContext } from "./curriculum-service";
import { analyzeCandidate } from "@/ai/candidate-profiler";
import { createKnowledgeTwin, updateKnowledgeTwin } from "@/ai/knowledge-twin";
import { createInterviewPlan } from "@/ai/interview-planner";
import type { InterviewPlan } from "@/ai/interview-planner";
import { generateQuestion } from "@/ai/question-generator";
import { evaluateAnswer } from "@/ai/answer-evaluator";
import { decideNextAction } from "@/ai/decision-engine";
import { applyTurnToState } from "@/ai/state-updater";
import { detectContradiction } from "@/ai/contradiction-detector";
import { generateFinalFeedback } from "@/ai/feedback-generator";
import { defaultInterviewMemoryRAG } from "./interview-memory";

// ---------------------------------------------------------------------------
// Plan Cache — avoids re-running createInterviewPlan() on every turn
// ---------------------------------------------------------------------------

/**
 * Per-session interview plan cache.
 * The plan is created ONCE during initializeInterview and reused for all turns.
 * This eliminates a full LLM round-trip on every conversation turn.
 */
const planCache = new Map<string, InterviewPlan>();

function cachePlan(sessionId: string, plan: InterviewPlan): void {
  planCache.set(sessionId, plan);
}

function getCachedPlan(sessionId: string): InterviewPlan | undefined {
  return planCache.get(sessionId);
}

function evictPlan(sessionId: string): void {
  planCache.delete(sessionId);
}

// ---------------------------------------------------------------------------
// Feedback Mapping Layer
// ---------------------------------------------------------------------------

/**
 * Maps rich internal INTERVUE feedback into the official hackathon API response format.
 *
 * Official public fields: summary, strengths, gaps, next
 */
export function toPublicFeedback(internalFeedback: FinalFeedback): InterviewFeedback {
  return {
    summary: internalFeedback.summary || "Interview completed successfully.",
    strengths: internalFeedback.strengths.map(
      (s) => `${s.topic}: ${s.description}`
    ),
    gaps: internalFeedback.gaps.map(
      (g) => `${g.topic}: ${g.description}`
    ),
    next: internalFeedback.recoveryPlan.map(
      (r) => `${r.topic}: ${r.action}`
    ),
  };
}

// ---------------------------------------------------------------------------
// Official API Handlers
// ---------------------------------------------------------------------------

/**
 * Initializes a new interview session via official API (POST /api/interview).
 *
 * Creates and CACHES the interview plan so subsequent turns don't re-run it.
 *
 * @param sessionId - Session identifier supplied in request
 * @param candidate - CandidateProfile payload
 */
export async function initializeInterview(
  sessionId: string,
  candidate: CandidateProfile
): Promise<InterviewInProgressResponse> {
  const curriculum = await loadCurriculum();

  // 1. Analyze candidate and build initial intelligence profile & knowledge twin
  const profile = await analyzeCandidate(candidate, curriculum);
  const knowledgeTwin = createKnowledgeTwin(profile);

  // 2. Create interview strategy ONCE and cache it for this session
  const plan = await createInterviewPlan(knowledgeTwin, curriculum);
  cachePlan(sessionId, plan);

  // 3. Create session with state
  const candidateId = candidate.member?.id || "unknown";
  await createSession({
    sessionId,
    candidateId,
    initialTopic: plan.topicOrder[0] ?? "",
    initialDifficulty: plan.startingDifficulty,
  });

  const state = await requireSession(sessionId);
  const stateWithTwin: InterviewState = { ...state, knowledgeTwin };
  await setState(sessionId, stateWithTwin);

  // 4. Generate opening question
  const question = await generateQuestion(stateWithTwin, plan, curriculum);

  return {
    reply: question.text,
    done: false,
  };
}

/**
 * Handles a conversation turn via official API (POST /api/interview).
 *
 * Uses the CACHED interview plan — no LLM call for plan creation on each turn.
 * Runs evaluation and next-question generation in PARALLEL where safe.
 *
 * @param sessionId - Active session identifier
 * @param message - Candidate's response message
 */
export async function handleConversationTurn(
  sessionId: string,
  message: string
): Promise<InterviewResponse> {
  const state = await requireSession(sessionId);

  // Use cached curriculum and plan — NO extra LLM calls
  const curriculum = await loadCurriculum();
  const plan = getCachedPlan(sessionId) ?? await createInterviewPlan(state.knowledgeTwin, curriculum);

  // Cache it if it wasn't already (safety net)
  if (!getCachedPlan(sessionId)) {
    cachePlan(sessionId, plan);
  }

  // Retrieve the question being answered from history or generate stub
  const lastTurn = state.questionHistory[state.questionHistory.length - 1];
  const question: InterviewQuestion = lastTurn
    ? lastTurn.question
    : await generateQuestion(state, plan, curriculum);

  // Retrieve curriculum context for grounding evaluation
  const retrievedContext = retrieveCurriculumContext(
    question.topic,
    state.knowledgeGaps,
    question.difficulty,
    curriculum
  );

  // 1. Run evaluation and contradiction detection IN PARALLEL — saves ~5s per turn
  const [evaluation, contradiction]: [AnswerEvaluation, Awaited<ReturnType<typeof detectContradiction>>] =
    await Promise.all([
      evaluateAnswer(question, message, state, retrievedContext),
      detectContradiction(message, state),
    ]);

  // Update Candidate Learning Memory
  await defaultInterviewMemoryRAG.updateCandidateLearningMemory(
    state.candidateId,
    question,
    evaluation
  );

  // 2. Update Knowledge Twin (pure function, no LLM)
  const updatedTwin = updateKnowledgeTwin(state.knowledgeTwin, question, evaluation);

  // 3. Decide next action (pure function, no LLM)
  const decision = decideNextAction(evaluation, state, plan);

  // 4. Apply turn to state (pure function, no LLM)
  const nextState = applyTurnToState(state, question, message, evaluation, decision, updatedTwin);
  if (contradiction.detected && contradiction.description) {
    nextState.contradictions = [...nextState.contradictions, contradiction.description];
  }
  await setState(sessionId, nextState);

  // 5. Check completion constraints
  const meetsMinQuestions = nextState.questionCount >= MIN_INTERVIEW_QUESTIONS;
  const meetsMinDays = nextState.daysCovered.length >= MIN_CURRICULUM_DAYS;
  const isComplete = decision.shouldEnd && meetsMinQuestions && meetsMinDays;

  if (isComplete) {
    evictPlan(sessionId); // Clean up cache on completion
    return await completeInterview(sessionId);
  }

  // 6. Generate next question (only one LLM call per turn now)
  const nextQuestion = await generateQuestion(nextState, plan, curriculum);
  return {
    reply: nextQuestion.text,
    done: false as const,
    evaluation: {
      correctness: evaluation.correctness,
      reasoning: evaluation.reasoning,
      depth: evaluation.depth,
      communication: evaluation.communication,
      engineering: evaluation.engineering,
      nextAction: evaluation.nextAction,
      coveredConcepts: evaluation.coveredConcepts ?? [],
      missingConcepts: evaluation.missingConcepts ?? [],
      misconceptions: evaluation.misconceptions ?? [],
    },
    gaps: nextState.knowledgeGaps ?? [],
    concepts: updatedTwin
      .filter((t) => t.estimatedScore >= 6)
      .map((t) => t.topic)
      .slice(0, 5),
    contradiction: contradiction.detected ? contradiction.description : null,
    progress: {
      questionCount: nextState.questionCount,
      daysCovered: nextState.daysCovered,
      currentDifficulty: nextState.difficulty,
      minimumRequirementsMet: meetsMinQuestions && meetsMinDays,
    },
  };
}

/**
 * Finalizes an interview and returns the official completed response.
 *
 * @param sessionId - Completed session identifier
 */
export async function completeInterview(
  sessionId: string
): Promise<InterviewCompletedResponse> {
  const state = await requireSession(sessionId);
  const internalFeedback = await generateFinalFeedback(state);
  const publicFeedback = toPublicFeedback(internalFeedback);

  return {
    reply: "Interview completed.",
    done: true,
    feedback: publicFeedback,
  };
}

// ---------------------------------------------------------------------------
// Internal Development Helpers (for /api/interview/start, answer, report)
// ---------------------------------------------------------------------------

export async function initializeInternalInterview(
  candidateId: string
): Promise<InternalStartInterviewResponse> {
  const curriculum = await loadCurriculum();
  const dummyCandidate: CandidateProfile = {
    member: {
      id: candidateId,
      name: candidateId,
      jobRole: "AI Engineer",
      yearsExperience: 2,
      education: "Cohort Graduate",
      status: "Active",
    },
    missions: [],
    signals: { commitDays: 30, missionsCompleted: 10, missionsFirstTry: 8 },
  };

  const profile = await analyzeCandidate(dummyCandidate, curriculum);
  const knowledgeTwin = createKnowledgeTwin(profile);
  const plan = await createInterviewPlan(knowledgeTwin, curriculum);

  const sessionId = await createSession({
    sessionId: crypto.randomUUID(),
    candidateId,
    initialTopic: plan.topicOrder[0] ?? "",
    initialDifficulty: plan.startingDifficulty,
  });

  cachePlan(sessionId, plan);

  const state = await requireSession(sessionId);
  const stateWithTwin: InterviewState = { ...state, knowledgeTwin };
  const question = await generateQuestion(stateWithTwin, plan, curriculum);

  const stateWithInitialQ: InterviewState = {
    ...stateWithTwin,
    questionHistory: [
      {
        question,
        answer: "",
        evaluation: {
          correctness: 0,
          reasoning: 0,
          depth: 0,
          communication: 0,
          engineering: 0,
          coveredConcepts: [],
          missingConcepts: [],
          misconceptions: [],
          nextAction: "follow_up",
        },
      },
    ],
  };
  await setState(sessionId, stateWithInitialQ);

  return {
    status: "interviewing",
    sessionId,
    question,
  };
}

export async function processAnswer(
  sessionId: string,
  questionId: string,
  answer: string
): Promise<InternalSubmitAnswerResponse> {
  const state = await requireSession(sessionId);
  const curriculum = await loadCurriculum();
  const plan = getCachedPlan(sessionId) ?? await createInterviewPlan(state.knowledgeTwin, curriculum);

  // Fallback to active question from history if questionId lookup fails
  const question =
    state.questionHistory.map((t) => t.question).find((q) => q.id === questionId) ??
    (state.questionHistory.length > 0
      ? state.questionHistory[state.questionHistory.length - 1].question
      : null) ??
    (await generateQuestion(state, plan, curriculum));

  // Retrieve curriculum context for evaluation grounding
  const retrievedContext = retrieveCurriculumContext(
    question.topic,
    state.knowledgeGaps,
    question.difficulty,
    curriculum
  );

  // Run evaluation and contradiction detection in parallel
  const [evaluation, contradiction] = await Promise.all([
    evaluateAnswer(question, answer, state, retrievedContext),
    detectContradiction(answer, state),
  ]);

  // Update Candidate Learning Memory
  await defaultInterviewMemoryRAG.updateCandidateLearningMemory(
    state.candidateId,
    question,
    evaluation
  );
  const updatedTwin = updateKnowledgeTwin(state.knowledgeTwin, question, evaluation);
  const decision = decideNextAction(evaluation, state, plan);
  const nextState = applyTurnToState(state, question, answer, evaluation, decision, updatedTwin);

  if (contradiction.detected && contradiction.description) {
    nextState.contradictions = [...nextState.contradictions, contradiction.description];
  }
  await setState(sessionId, nextState);

  const progress: InterviewProgress = {
    questionCount: nextState.questionCount,
    daysCovered: nextState.daysCovered,
    currentDifficulty: nextState.difficulty,
    minimumRequirementsMet:
      nextState.questionCount >= MIN_INTERVIEW_QUESTIONS &&
      nextState.daysCovered.length >= MIN_CURRICULUM_DAYS,
  };

  if (decision.shouldEnd && progress.minimumRequirementsMet) {
    evictPlan(sessionId);
    return {
      status: "completed",
      evaluation,
      nextQuestion: null,
      progress,
    };
  }

  const nextQuestion = await generateQuestion(nextState, plan, curriculum);

  return {
    status: "interviewing",
    evaluation,
    nextQuestion,
    progress,
  };
}

export async function getFinalReport(sessionId: string): Promise<{
  feedback: FinalFeedback;
  questionHistory: InterviewTurn[];
}> {
  const state = await requireSession(sessionId);
  const feedback = await generateFinalFeedback(state);
  return {
    feedback,
    questionHistory: state.questionHistory,
  };
}

