/**
 * types/api.ts
 *
 * Official Hackathon API contracts (POST /api/interview) & Internal development contracts.
 *
 * Owner: Shared (types/ directory) — Backend member leads implementation
 */

import type { CandidateProfile } from "./candidate";
import type { InterviewQuestion, InterviewState, AnswerEvaluation } from "./interview";
import type { FinalFeedback } from "./feedback";

// ===========================================================================
// OFFICIAL PUBLIC HACKATHON API SPECIFICATION (POST /api/interview)
// ===========================================================================

/** Start request payload for POST /api/interview */
export interface StartInterviewRequest {
  sessionId: string;
  candidate: CandidateProfile;
}

/** Conversation turn request payload for POST /api/interview */
export interface ConversationTurnRequest {
  sessionId: string;
  message: string;
}

/** Union of valid request types for POST /api/interview */
export type InterviewRequest = StartInterviewRequest | ConversationTurnRequest;

/** Response returned while the interview is in progress */
export interface InterviewInProgressResponse {
  reply: string;
  done: false;
}

/** Official feedback structure returned when the interview is completed */
export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

/** Response returned when the interview completes */
export interface InterviewCompletedResponse {
  reply: string;
  done: true;
  feedback: InterviewFeedback;
}

/** Union of valid response types for POST /api/interview */
export type InterviewResponse =
  | InterviewInProgressResponse
  | InterviewCompletedResponse;


// ===========================================================================
// INTERNAL DEVELOPMENT API CONTRACTS
// ===========================================================================

export type InterviewStatus =
  | "initializing"
  | "interviewing"
  | "completed"
  | "error";

export interface InternalStartInterviewResponse {
  status: InterviewStatus;
  sessionId: string;
  question: InterviewQuestion;
  error?: string;
}

export interface InternalSubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
}

export interface InternalSubmitAnswerResponse {
  status: InterviewStatus;
  evaluation: AnswerEvaluation;
  nextQuestion: InterviewQuestion | null;
  progress: InterviewProgress;
  error?: string;
}

export interface InterviewProgress {
  questionCount: number;
  daysCovered: number[];
  currentDifficulty: InterviewState["difficulty"];
  minimumRequirementsMet: boolean;
}

export interface GetReportResponse {
  status: InterviewStatus;
  feedback: FinalFeedback;
  error?: string;
}
