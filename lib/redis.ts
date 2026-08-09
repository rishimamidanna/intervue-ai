/**
 * lib/redis.ts
 *
 * Persistent Redis client abstraction layer using Upstash Redis.
 *
 * Stores and retrieves interview session states across server restarts
 * and serverless Vercel function instances.
 *
 * Key format: interview:{sessionId}
 *
 * Owner: Member 2 (Backend / API)
 */

import { Redis } from "@upstash/redis";
import type { InterviewState } from "@/types/interview";
import { logger } from "./logger";

// ---------------------------------------------------------------------------
// Upstash Client Singleton
// ---------------------------------------------------------------------------

let _redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (_redisClient) return _redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && url.startsWith("http")) {
    _redisClient = new Redis({ url, token });
    return _redisClient;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Local Persistent Fallback Store (for local dev without Upstash keys)
// ---------------------------------------------------------------------------

const _localFallbackStore = new Map<string, InterviewState>();

// ---------------------------------------------------------------------------
// Redis Session Operations
// ---------------------------------------------------------------------------

function formatKey(sessionId: string): string {
  return `interview:${sessionId}`;
}

/**
 * Retrieves an InterviewState from Redis.
 *
 * @param sessionId - Session identifier
 * @returns InterviewState or null if not found
 */
export async function getRedisSession(
  sessionId: string
): Promise<InterviewState | null> {
  const client = getRedisClient();

  if (client) {
    try {
      const data = await client.get<InterviewState | string>(formatKey(sessionId));
      if (!data) return null;
      if (typeof data === "string") {
        return JSON.parse(data) as InterviewState;
      }
      return data as InterviewState;
    } catch (err) {
      logger.warn("[Redis] Failed to fetch from Upstash, checking fallback", { error: String(err), sessionId });
      return _localFallbackStore.get(sessionId) ?? null;
    }
  }

  // Fallback to local store when Upstash keys are missing
  return _localFallbackStore.get(sessionId) ?? null;
}

/**
 * Persists an InterviewState to Redis.
 *
 * @param sessionId - Session identifier
 * @param state - The InterviewState to save
 */
export async function setRedisSession(
  sessionId: string,
  state: InterviewState
): Promise<void> {
  // Always update local fallback for offline consistency
  _localFallbackStore.set(sessionId, state);

  const client = getRedisClient();
  if (client) {
    try {
      // Store state object with 7-day TTL (604800 seconds)
      await client.set(formatKey(sessionId), JSON.stringify(state), {
        ex: 604800,
      });
    } catch (err) {
      console.warn("[Redis] Failed to save to Upstash Redis:", err);
    }
  }
}

/**
 * Deletes an InterviewState from Redis.
 *
 * @param sessionId - Session identifier to remove
 */
export async function deleteRedisSession(sessionId: string): Promise<void> {
  _localFallbackStore.delete(sessionId);

  const client = getRedisClient();
  if (client) {
    try {
      await client.del(formatKey(sessionId));
    } catch (err) {
      console.warn("[Redis] Failed to delete from Upstash Redis:", err);
    }
  }
}

/**
 * Checks if a session key exists in Redis.
 *
 * @param sessionId - Session identifier
 */
export async function hasRedisSession(sessionId: string): Promise<boolean> {
  const session = await getRedisSession(sessionId);
  return session !== null;
}
