/**
 * lib/llm.ts
 *
 * LLM client abstraction layer.
 *
 * This module will be the single integration point between INTERVUE and the
 * chosen LLM provider. All AI modules (ai/) should call through this client
 * rather than calling the LLM SDK directly, enabling provider swapping
 * without touching business logic.
 *
 * TODO (Member 3 — AI): Implement the real LLM client here once the
 *   hackathon Technical Specification confirms the LLM provider and model.
 *   Candidate providers: Google Gemini, OpenAI, Anthropic.
 *   Use getEnv() to read LLM_API_KEY, LLM_MODEL, LLM_BASE_URL.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import { getEnv } from "./env";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMCompletionOptions {
  /** Target temperature (0 = deterministic, 1 = creative) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Request structured JSON output from the model */
  jsonMode?: boolean;
}

export interface LLMCompletionResult {
  /** The model's text response */
  content: string;
  /** Model identifier that produced this response */
  model: string;
  /** Approximate token usage */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * Sends a chat completion request to the configured LLM provider.
 *
 * TODO (Member 3): Replace this stub with a real SDK call.
 *   1. Import the LLM SDK (e.g. @google/generative-ai, openai)
 *   2. Construct the client using getEnv().LLM_API_KEY
 *   3. Map LLMMessage[] to the SDK's message format
 *   4. Parse and return LLMCompletionResult
 *
 * @throws {Error} Not implemented — prevents accidental use in scaffold
 */
export async function createChatCompletion(
  messages: LLMMessage[],
  options: LLMCompletionOptions = {}
): Promise<LLMCompletionResult> {
  const env = getEnv();
  // Suppress unused variable warning during scaffold phase
  void env;
  void messages;
  void options;

  // TODO: Remove this error and implement the real client
  throw new Error(
    "[lib/llm.ts] createChatCompletion is not implemented. " +
    "Implement the LLM client before wiring to AI modules."
  );
}
