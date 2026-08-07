/**
 * server/interview-state.ts
 *
 * Interview State Manager
 *
 * Manages the authoritative server-side state for active interview sessions.
 * In this scaffold, state is held in memory. A future implementation may
 * persist state to a database (Redis, Firestore, etc.) for reliability.
 *
 * Owner: Member 2 (Backend / API)
 *
 * TODO: Implement persistent session storage when a database is introduced.
 *   Current in-memory approach is suitable for the hackathon but will not
 *   survive server restarts or scale across multiple instances.
 */

import type { InterviewState } from "@/types/interview";

// ---------------------------------------------------------------------------
// In-Memory Store
// ---------------------------------------------------------------------------

/** In-memory session store: sessionId → InterviewState */
const sessionStore = new Map<string, InterviewState>();

// ---------------------------------------------------------------------------
// State Manager
// ---------------------------------------------------------------------------

/**
 * Retrieves the current state for a session.
 *
 * @param sessionId - The session identifier
 * @returns InterviewState or undefined if session not found
 */
export function getState(sessionId: string): InterviewState | undefined {
  return sessionStore.get(sessionId);
}

/**
 * Creates a new session with an initial state.
 *
 * @param initialState - The starting state for the session
 */
export function createState(initialState: InterviewState): void {
  if (sessionStore.has(initialState.sessionId)) {
    throw new Error(`Session already exists: ${initialState.sessionId}`);
  }
  sessionStore.set(initialState.sessionId, initialState);
}

/**
 * Replaces the state for an existing session.
 * Used after each interview turn to persist the updated state.
 *
 * @param sessionId - The session identifier
 * @param nextState - The updated state to store
 * @throws {Error} If the session does not exist
 */
export function setState(sessionId: string, nextState: InterviewState): void {
  if (!sessionStore.has(sessionId)) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  sessionStore.set(sessionId, nextState);
}

/**
 * Deletes a session from the store.
 * Called after the report has been generated and retrieved.
 *
 * @param sessionId - The session identifier to remove
 */
export function deleteState(sessionId: string): void {
  sessionStore.delete(sessionId);
}

/**
 * Returns the count of active sessions (for debugging and monitoring).
 */
export function getActiveSessionCount(): number {
  return sessionStore.size;
}
