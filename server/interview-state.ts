/**
 * server/interview-state.ts
 *
 * Interview State Manager — Persistent Redis Implementation
 *
 * Manages the authoritative server-side state for active interview sessions
 * backed by Redis (Upstash Redis). Sessions persist across server restarts
 * and serverless Vercel function invocations.
 *
 * Key format: interview:{sessionId}
 *
 * Owner: Member 2 (Backend / API)
 */

import type { InterviewState } from "@/types/interview";
import {
  getRedisSession,
  setRedisSession,
  deleteRedisSession,
  hasRedisSession,
} from "@/lib/redis";

// ---------------------------------------------------------------------------
// State Manager (Async Persistent Storage)
// ---------------------------------------------------------------------------

/**
 * Retrieves the current state for a session.
 *
 * @param sessionId - The session identifier
 * @returns InterviewState or undefined if session not found
 */
export async function getState(
  sessionId: string
): Promise<InterviewState | undefined> {
  const session = await getRedisSession(sessionId);
  return session ?? undefined;
}

/**
 * Creates a new session with an initial state.
 *
 * @param initialState - The starting state for the session
 */
export async function createState(initialState: InterviewState): Promise<void> {
  const exists = await hasRedisSession(initialState.sessionId);
  if (exists) {
    throw new Error(`Session already exists: ${initialState.sessionId}`);
  }
  await setRedisSession(initialState.sessionId, initialState);
}

/**
 * Replaces the state for an existing session.
 * Used after each interview turn to persist the updated state.
 *
 * @param sessionId - The session identifier
 * @param nextState - The updated state to store
 * @throws {Error} If the session does not exist
 */
export async function setState(
  sessionId: string,
  nextState: InterviewState
): Promise<void> {
  const exists = await hasRedisSession(sessionId);
  if (!exists) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  await setRedisSession(sessionId, nextState);
}

/**
 * Deletes a session from the store.
 * Called after the report has been generated and retrieved.
 *
 * @param sessionId - The session identifier to remove
 */
export async function deleteState(sessionId: string): Promise<void> {
  await deleteRedisSession(sessionId);
}
