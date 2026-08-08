/**
 * lib/llm.ts
 *
 * LLM client abstraction layer — Google Gemini implementation.
 *
 * Single integration point between INTERVUE and the LLM provider.
 * All AI modules (ai/) call through this client so the provider
 * can be swapped without touching business logic.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
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
// Singleton client
// ---------------------------------------------------------------------------

let _genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (_genAI) return _genAI;
  const { LLM_API_KEY } = getEnv();
  if (!LLM_API_KEY) {
    throw new Error(
      "[lib/llm.ts] LLM_API_KEY is not set. " +
        "Add your Gemini API key to .env.local as LLM_API_KEY=<your-key>"
    );
  }
  _genAI = new GoogleGenerativeAI(LLM_API_KEY);
  return _genAI;
}

// ---------------------------------------------------------------------------
// Core completion function
// ---------------------------------------------------------------------------

/**
 * Sends a chat completion request to Google Gemini.
 *
 * System messages are passed as the model's systemInstruction.
 * Conversation history (user + assistant turns) is passed via startChat().
 * jsonMode forces the model to return valid JSON via responseMimeType.
 */
export async function createChatCompletion(
  messages: LLMMessage[],
  options: LLMCompletionOptions = {}
): Promise<LLMCompletionResult> {
  const { LLM_MODEL } = getEnv();
  const modelName = LLM_MODEL ?? "gemini-2.5-flash";
  const genAI = getClient();

  // Pull system instruction out separately
  const systemInstruction = messages.find((m) => m.role === "system")?.content;
  const convoMessages = messages.filter((m) => m.role !== "system");

  if (convoMessages.length === 0) {
    throw new Error("[lib/llm.ts] At least one user message is required.");
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    ...(systemInstruction && { systemInstruction }),
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 8192,
      // Tell Gemini to respond with JSON when jsonMode is enabled
      responseMimeType: options.jsonMode ? "application/json" : "text/plain",
    },
  });

  // Map our format to Gemini's history format (all but the last message)
  const history = convoMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : ("user" as "user" | "model"),
    parts: [{ text: m.content }],
  }));

  const lastMessage = convoMessages[convoMessages.length - 1];

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;
  const usage = response.usageMetadata;

  return {
    content: response.text(),
    model: modelName,
    usage: usage
      ? {
          inputTokens: usage.promptTokenCount ?? 0,
          outputTokens: usage.candidatesTokenCount ?? 0,
        }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// JSON helper
// ---------------------------------------------------------------------------

/**
 * Calls the LLM with jsonMode=true and parses the response as JSON.
 * Throws a descriptive error if parsing fails.
 *
 * @param messages - Conversation messages
 * @param options  - Optional temperature / maxTokens overrides
 * @returns Parsed JSON of type T
 */
export async function createJsonCompletion<T>(
  messages: LLMMessage[],
  options: Omit<LLMCompletionOptions, "jsonMode"> = {}
): Promise<T> {
  const result = await createChatCompletion(messages, {
    ...options,
    jsonMode: true,
  });
  try {
    return JSON.parse(result.content) as T;
  } catch {
    throw new Error(
      `[lib/llm.ts] Failed to parse LLM JSON response.\n` +
        `Raw response (first 500 chars): ${result.content.slice(0, 500)}`
    );
  }
}
