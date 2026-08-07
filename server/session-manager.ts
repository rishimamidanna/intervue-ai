/**
 * server/session-manager.ts
 *
 * Session Lifecycle Manager
 *
 * Handles creation, validation, and termination of interview sessions based on sessionId.
 * Provides the public interface used by API routes to manage session lifecycle.
 *
 * Owner: Member 2 (Backend / API)
 *
 * TODO (IMPORTANT FOR VERCEL): Production serverless deployments on Vercel may not guarantee
 * durable in-memory state across separate function instances or cold starts. The backend implementation
 * owner must validate whether an external temporary session store (e.g. Redis/Upstash/KV) is required
 * before final submission.
 */

import type { InterviewState, DifficultyLevel } from "@/types/interview";
import { createState, getState, deleteState } from "./interview-state";

// ---------------------------------------------------------------------------
// Session Creation
// ---------------------------------------------------------------------------

export interface CreateSessionOptions {
  sessionId: string;
  candidateId: string;
  initialTopic?: string;
  initialDifficulty?: DifficultyLevel;
}

/**
 * Creates a new interview session with an initial state using the supplied sessionId.
 *
 * @param options - Session configuration including the official request sessionId
 * @returns The sessionId of the newly created session
 */
export function createSession(options: CreateSessionOptions): string {
  const initialState: InterviewState = {
    sessionId: options.sessionId,
    candidateId: options.candidateId,
    questionCount: 0,
    daysCovered: [],
    currentTopic: options.initialTopic ?? "",
    difficulty: options.initialDifficulty ?? 2,
    strengths: [],
    knowledgeGaps: [],
    misconceptions: [],
    candidateClaims: [],
    contradictions: [],
    knowledgeTwin: [],
    questionHistory: [],
  };

  createState(initialState);
  return options.sessionId;
}

// ---------------------------------------------------------------------------
// Session Retrieval
// ---------------------------------------------------------------------------

/**
 * Retrieves an active session, throwing if not found.
 *
 * @param sessionId - The session identifier
 * @returns InterviewState for the active session
 * @throws {Error} If the session does not exist
 */
export function requireSession(sessionId: string): InterviewState {
  const state = getState(sessionId);
  if (!state) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  return state;
}

/**
 * Checks whether a session exists without throwing.
 *
 * @param sessionId - The session identifier
 */
export function sessionExists(sessionId: string): boolean {
  return getState(sessionId) !== undefined;
}

// ---------------------------------------------------------------------------
// Session Termination
// ---------------------------------------------------------------------------

/**
 * Terminates a session and removes it from the store.
 *
 * @param sessionId - The session to terminate
 */
export function terminateSession(sessionId: string): void {
  deleteState(sessionId);
}
