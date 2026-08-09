/**
 * server/session-manager.ts
 *
 * Session Lifecycle Manager — Redis Persistent Implementation
 *
 * Handles creation, validation, and termination of interview sessions based on sessionId.
 * Backed by Redis (Upstash Redis) for production serverless reliability.
 *
 * Owner: Member 2 (Backend / API)
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
export async function createSession(options: CreateSessionOptions): Promise<string> {
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

  await createState(initialState);
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
export async function requireSession(sessionId: string): Promise<InterviewState> {
  const state = await getState(sessionId);
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
export async function sessionExists(sessionId: string): Promise<boolean> {
  const state = await getState(sessionId);
  return state !== undefined;
}

// ---------------------------------------------------------------------------
// Session Termination
// ---------------------------------------------------------------------------

/**
 * Terminates a session and removes it from the store.
 *
 * @param sessionId - The session to terminate
 */
export async function terminateSession(sessionId: string): Promise<void> {
  await deleteState(sessionId);
}
