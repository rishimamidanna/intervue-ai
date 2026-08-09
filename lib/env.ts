/**
 * lib/env.ts
 *
 * Environment Variable Validation & Diagnostic Helper.
 * Validates required environment variables for LLM and Redis services
 * on application startup, providing clear diagnostic warnings without crashing
 * or leaking sensitive credentials.
 *
 * Owner: Member 2 (Backend / Architecture)
 */

export interface EnvValidationResult {
  hasLlmKey: boolean;
  llmModel: string;
  hasRedisConfig: boolean;
  warnings: string[];
}

/**
 * Returns environment variables dictionary safely.
 */
export function getEnv(): Record<string, string | undefined> {
  return process.env;
}

/**
 * Validates system environment configuration and returns status flags.
 */
export function validateEnv(): EnvValidationResult {
  const warnings: string[] = [];

  const llmKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY;
  const hasLlmKey = Boolean(llmKey && llmKey.trim().length > 0);
  if (!hasLlmKey) {
    warnings.push(
      "LLM_API_KEY is not set. The platform will operate in resilient curriculum fallback mode."
    );
  }

  const llmModel = process.env.LLM_MODEL || "gemini-2.5-flash";

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasRedisConfig = Boolean(
    redisUrl && redisToken && redisUrl.startsWith("http")
  );

  if (!hasRedisConfig) {
    warnings.push(
      "UPSTASH_REDIS_REST_URL / TOKEN not configured. Sessions will persist in local fallback storage."
    );
  }

  return {
    hasLlmKey,
    llmModel,
    hasRedisConfig,
    warnings,
  };
}
