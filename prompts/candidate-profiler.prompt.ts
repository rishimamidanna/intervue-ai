/**
 * prompts/candidate-profiler.prompt.ts
 *
 * Prompts for the Candidate Intelligence Engine.
 *
 * TODO (Member 3 — AI): Implement these prompts to:
 *   - Accept a serialised CandidateProfile and full curriculum as context
 *   - Instruct the LLM to produce a structured CandidateIntelligenceProfile
 *   - Request JSON output following the exact CandidateIntelligenceProfile schema
 *   - Include few-shot examples if needed for reliability
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

/**
 * System prompt establishing the Candidate Profiler persona and task.
 * Injected as the first message in the LLM conversation.
 */
export const CANDIDATE_PROFILER_SYSTEM_PROMPT = "";

/**
 * User prompt template for candidate analysis.
 * Expects placeholders: {candidateProfile}, {curriculum}
 */
export const CANDIDATE_PROFILER_USER_PROMPT = "";
