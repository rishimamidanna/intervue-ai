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

import { MIN_INTERVIEW_QUESTIONS, MIN_CURRICULUM_DAYS, MAX_INTERVIEW_QUESTIONS } from "@/lib/constants";
import { calculateFinalScore } from "@/lib/scoring";
import { createSession, requireSession } from "./session-manager";
import { setState, getState } from "./interview-state";
import { logger } from "@/lib/logger";
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

// ---------------------------------------------------------------------------
// Plan Cache — avoids re-running createInterviewPlan() on every turn
// ---------------------------------------------------------------------------

/**
 * Per-session interview plan cache.
 * The plan is created ONCE during initializeInterview and reused for all turns.
 * This eliminates a full LLM round-trip on every conversation turn.
 */
declare global {
  var _intervuePlanCache: Map<string, InterviewPlan> | undefined;
}

const planCache =
  globalThis._intervuePlanCache ??
  (globalThis._intervuePlanCache = new Map<string, InterviewPlan>());

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
    done: false,
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
  if (!state.finalScore && state.questionHistory?.length > 0) {
    state.finalScore = calculateFinalScore(state.questionHistory.map((t) => t.evaluation));
    await setState(sessionId, state);
  }
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
  candidateId: string,
  existingSessionId?: string | null,
  forceNew?: boolean
): Promise<InternalStartInterviewResponse> {
  const curriculum = await loadCurriculum();

  // 1. Session Recovery Check
  if (existingSessionId && !forceNew) {
    const existingState = await getState(existingSessionId);
    if (existingState && existingState.questionHistory && existingState.questionHistory.length > 0) {
      logger.info("[initializeInternalInterview] Resuming existing active session", {
        sessionId: existingSessionId,
        questionCount: existingState.questionCount,
        historyLength: existingState.questionHistory.length,
      });

      const turns = existingState.questionHistory;
      const lastTurn = turns[turns.length - 1];

      // Re-cache plan in memory if evicted
      if (!getCachedPlan(existingSessionId)) {
        const plan = await createInterviewPlan(existingState.knowledgeTwin || [], curriculum);
        cachePlan(existingSessionId, plan);
      }

      const isCompleted =
        (existingState.questionCount || turns.length) >= MIN_INTERVIEW_QUESTIONS &&
        (existingState.daysCovered || []).length >= MIN_CURRICULUM_DAYS;

      // Extract last completed evaluation if available
      const lastEvaluation =
        turns.length > 1 && turns[turns.length - 2].evaluation?.correctness !== undefined
          ? turns[turns.length - 2].evaluation
          : lastTurn.evaluation?.correctness !== undefined && lastTurn.evaluation?.correctness > 0
          ? lastTurn.evaluation
          : null;

      return {
        status: isCompleted ? "completed" : "interviewing",
        sessionId: existingSessionId,
        question: lastTurn.question,
        lastEvaluation,
        progress: {
          questionCount: Math.max(existingState.questionCount || 0, turns.length),
          daysCovered: existingState.daysCovered?.length > 0 ? existingState.daysCovered : [lastTurn.question?.curriculumDay || 1],
          currentDifficulty: existingState.difficulty ?? lastTurn.question?.difficulty ?? 2,
          minimumRequirementsMet: isCompleted,
        },
      };
    }
  }

  // 2. Create Brand New Session
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
    currentQuestion: question,
    questionHistory: [],
  };
  await setState(sessionId, stateWithInitialQ);

  return {
    status: "interviewing",
    sessionId,
    question,
    progress: {
      questionCount: 1,
      daysCovered: [question.curriculumDay || 1],
      currentDifficulty: question.difficulty || 2,
      minimumRequirementsMet: false,
    },
  };
}

export async function processAnswer(
  sessionId: string,
  questionId: string,
  answer: string
): Promise<InternalSubmitAnswerResponse> {
  const state = await requireSession(sessionId);

  console.log("SESSION BEFORE", state);
  console.log("SESSION BEFORE UPDATE", state);
  console.log("QUESTION COUNT", state.questionCount);
  console.log("ANSWER RECEIVED");
  console.log("CURRENT QUESTION COUNT", state.questionCount);
  console.log("QUESTION BEFORE", state.currentQuestion);

  // Guard: If session has already recorded MAX_INTERVIEW_QUESTIONS (8 turns), reject further turn submissions
  if (state.questionHistory.length >= MAX_INTERVIEW_QUESTIONS) {
    const lastTurn = state.questionHistory.length > 0 ? state.questionHistory[state.questionHistory.length - 1] : null;
    return {
      status: "completed",
      evaluation: lastTurn?.evaluation || {
        correctness: 8,
        reasoning: 8,
        depth: 8,
        communication: 8,
        engineering: 8,
        coveredConcepts: [],
        missingConcepts: [],
        misconceptions: [],
        nextAction: "follow_up",
      },
      nextQuestion: null,
      progress: {
        questionCount: MAX_INTERVIEW_QUESTIONS,
        daysCovered: state.daysCovered,
        currentDifficulty: state.difficulty,
        minimumRequirementsMet: true,
      },
    };
  }

  const curriculum = await loadCurriculum();
  const plan = getCachedPlan(sessionId) ?? await createInterviewPlan(state.knowledgeTwin, curriculum);

  // Match current active question or fallback to history / generator
  const question =
    (state.currentQuestion?.id === questionId ? state.currentQuestion : null) ??
    state.questionHistory.map((t) => t.question).find((q) => q.id === questionId) ??
    state.currentQuestion ??
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

  const updatedTwin = updateKnowledgeTwin(state.knowledgeTwin, question, evaluation);
  const decision = decideNextAction(evaluation, state, plan);
  const nextState = applyTurnToState(
    state,
    question,
    answer,
    evaluation,
    decision,
    updatedTwin,
    retrievedContext ? (retrievedContext as any).contextText || JSON.stringify(retrievedContext) : undefined
  );

  if (contradiction.detected && contradiction.description) {
    nextState.contradictions = [...nextState.contradictions, contradiction.description];
  }

  const progress: InterviewProgress = {
    // nextState.questionCount represents the number of completed questions.
    // So the current question being asked is nextState.questionCount + 1.
    questionCount: Math.min(MAX_INTERVIEW_QUESTIONS, nextState.questionCount + 1),
    daysCovered: nextState.daysCovered,
    currentDifficulty: nextState.difficulty,
    minimumRequirementsMet:
      nextState.questionCount >= MIN_INTERVIEW_QUESTIONS &&
      nextState.daysCovered.length >= MIN_CURRICULUM_DAYS,
  };

  const isComplete =
    nextState.questionCount >= MAX_INTERVIEW_QUESTIONS ||
    (decision.shouldEnd && progress.minimumRequirementsMet);

  if (isComplete) {
    evictPlan(sessionId);
    const finalScore = nextState.finalScore || calculateFinalScore(nextState.questionHistory.map((t) => t.evaluation));
    const completedState = {
      ...nextState,
      finalScore,
      currentQuestion: undefined,
    };
    await setState(sessionId, completedState);
    console.log("SESSION AFTER SAVE", completedState);
    console.log("QUESTION AFTER", null);
    return {
      status: "completed",
      evaluation,
      nextQuestion: null,
      progress: {
        ...progress,
        questionCount: Math.min(MAX_INTERVIEW_QUESTIONS, nextState.questionCount),
        minimumRequirementsMet: true,
      },
    };
  }

  console.log("GENERATING NEXT QUESTION");
  const nextQuestion = await generateQuestion(nextState, plan, curriculum);
  console.log("NEXT QUESTION GENERATED", nextQuestion);
  console.log("GENERATED NEXT QUESTION", nextQuestion);
  nextState.currentQuestion = nextQuestion;
  await setState(sessionId, nextState);

  console.log("SESSION AFTER SAVE", nextState);
  console.log("SESSION AFTER UPDATE", nextState);
  console.log("NEW QUESTION", nextQuestion);
  console.log("QUESTION AFTER", nextQuestion);

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

