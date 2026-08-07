/**
 * lib/env.ts
 *
 * Environment variable validation and typed access.
 * Uses Zod to validate required environment variables at startup.
 *
 * Calling getEnv() in any server module ensures misconfigured environments
 * fail fast with a clear error rather than producing subtle runtime bugs.
 *
 * Owner: Member 2 (Backend / API)
 */

import { z } from "zod";

const EnvSchema = z.object({
  /** LLM provider API key — required in production */
  LLM_API_KEY: z.string().min(1).optional(),
  /** Model identifier, e.g. "gemini-1.5-pro" */
  LLM_MODEL: z.string().optional().default("gemini-1.5-pro"),
  /** Base URL for the LLM API (optional — defaults to provider standard) */
  LLM_BASE_URL: z.string().url().optional(),
  /** Voice provider API key — optional at this stage */
  VOICE_API_KEY: z.string().optional(),
  /** Public application name shown in the UI */
  NEXT_PUBLIC_APP_NAME: z.string().optional().default("INTERVUE"),
  /** Node environment */
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),
});

export type Env = z.infer<typeof EnvSchema>;

let _env: Env | null = null;

/**
 * Returns validated environment variables.
 * Throws on the first call if required variables are missing.
 * Caches the result after the first successful parse.
 *
 * TODO: Tighten validation when the LLM provider is confirmed.
 *       Make LLM_API_KEY required (remove .optional()) in production.
 */
export function getEnv(): Env {
  if (_env) return _env;
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${result.error.toString()}`
    );
  }
  _env = result.data;
  return _env;
}
