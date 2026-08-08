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
import type { InterviewQuestion, AnswerEvaluation, InterviewState } from "@/types/interview";
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
import { loadCurriculum } from "./curriculum-service";
import { analyzeCandidate } from "@/ai/candidate-profiler";
import { createKnowledgeTwin, updateKnowledgeTwin } from "@/ai/knowledge-twin";
import { createInterviewPlan } from "@/ai/interview-planner";
import { generateQuestion } from "@/ai/question-generator";
import { evaluateAnswer } from "@/ai/answer-evaluator";
import { decideNextAction } from "@/ai/decision-engine";
import { applyTurnToState } from "@/ai/state-updater";
import { detectContradiction } from "@/ai/contradiction-detector";
import { generateFinalFeedback } from "@/ai/feedback-generator";

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

  // 2. Create interview strategy
  const plan = await createInterviewPlan(knowledgeTwin, curriculum);

  // 3. Create session with state
  const candidateId = candidate.member?.id || "unknown";
  createSession({
    sessionId,
    candidateId,
    initialTopic: plan.topicOrder[0] ?? "",
    initialDifficulty: plan.startingDifficulty,
  });

  const state = requireSession(sessionId);
  const stateWithTwin: InterviewState = { ...state, knowledgeTwin };
  setState(sessionId, stateWithTwin);

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
 * @param sessionId - Active session identifier
 * @param message - Candidate's response message
 */
export async function handleConversationTurn(
  sessionId: string,
  message: string
): Promise<InterviewResponse> {
  const state = requireSession(sessionId);
  const curriculum = await loadCurriculum();
  const plan = await createInterviewPlan(state.knowledgeTwin, curriculum);

  // Retrieve the question being answered from history or generate stub
  const lastTurn = state.questionHistory[state.questionHistory.length - 1];
  const question: InterviewQuestion = lastTurn
    ? lastTurn.question
    : await generateQuestion(state, plan, curriculum);

  // 1. Evaluate answer
  const evaluation: AnswerEvaluation = await evaluateAnswer(question, message, state);

  // 2. Detect contradictions
  const contradiction = await detectContradiction(message, state);

  // 3. Update Knowledge Twin
  const updatedTwin = updateKnowledgeTwin(state.knowledgeTwin, question, evaluation);

  // 4. Decide next action
  const decision = decideNextAction(evaluation, state, plan);

  // 5. Apply turn to state (difficulty update is carried via decision.newDifficulty in state-updater)
  const nextState = applyTurnToState(state, question, message, evaluation, decision, updatedTwin);
  if (contradiction.detected && contradiction.description) {
    nextState.contradictions = [...nextState.contradictions, contradiction.description];
  }
  setState(sessionId, nextState);

  // 6. Check completion constraints
  const meetsMinQuestions = nextState.questionCount >= MIN_INTERVIEW_QUESTIONS;
  const meetsMinDays = nextState.daysCovered.length >= MIN_CURRICULUM_DAYS;
  const isComplete = decision.shouldEnd && meetsMinQuestions && meetsMinDays;

  if (isComplete) {
    return completeInterview(sessionId);
  }

  // Generate next question
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
  const state = requireSession(sessionId);
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

  const sessionId = createSession({
    sessionId: crypto.randomUUID(),
    candidateId,
    initialTopic: plan.topicOrder[0] ?? "",
    initialDifficulty: plan.startingDifficulty,
  });

  const state = requireSession(sessionId);
  const stateWithTwin: InterviewState = { ...state, knowledgeTwin };
  setState(sessionId, stateWithTwin);

  const question = await generateQuestion(stateWithTwin, plan, curriculum);

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
  const state = requireSession(sessionId);
  const curriculum = await loadCurriculum();
  const plan = await createInterviewPlan(state.knowledgeTwin, curriculum);

  const question = state.questionHistory
    .map((t) => t.question)
    .find((q) => q.id === questionId)
    ?? (await generateQuestion(state, plan, curriculum));

  const evaluation = await evaluateAnswer(question, answer, state);
  const contradiction = await detectContradiction(answer, state);
  const updatedTwin = updateKnowledgeTwin(state.knowledgeTwin, question, evaluation);
  const decision = decideNextAction(evaluation, state, plan);
  const nextState = applyTurnToState(state, question, answer, evaluation, decision, updatedTwin);

  if (contradiction.detected && contradiction.description) {
    nextState.contradictions = [...nextState.contradictions, contradiction.description];
  }
  setState(sessionId, nextState);

  const progress: InterviewProgress = {
    questionCount: nextState.questionCount,
    daysCovered: nextState.daysCovered,
    currentDifficulty: nextState.difficulty,
    minimumRequirementsMet:
      nextState.questionCount >= MIN_INTERVIEW_QUESTIONS &&
      nextState.daysCovered.length >= MIN_CURRICULUM_DAYS,
  };

  if (decision.shouldEnd && progress.minimumRequirementsMet) {
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

export async function getFinalReport(sessionId: string): Promise<FinalFeedback> {
  const state = requireSession(sessionId);
  return generateFinalFeedback(state);
}
