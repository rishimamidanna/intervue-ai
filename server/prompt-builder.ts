/**
 * server/prompt-builder.ts
 *
 * Prompt Context Builder (Milestone 7.2)
 *
 * Constructs structured, LLM-ready System and User prompt payloads by combining
 * Candidate Profile data, Target Question / Topic, and Retrieved RAG Context blocks.
 * Enforces strict anti-hallucination guardrails, curriculum knowledge grounding,
 * and candidate-adaptive difficulty directives.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  PromptBuilderInput,
  LLMPromptPayload,
  FormattedContextResponse,
} from "@/types/rag";
import type { CandidateProfile, CandidateIntelligenceProfile } from "@/types/candidate";
import { LLMPromptPayloadSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";
import { buildFormattedContext } from "./context-builder";

/**
 * Generates system prompt instructions enforcing RAG context grounding,
 * anti-hallucination rules, and candidate-adaptive difficulty directives.
 *
 * @param candidateProfile - CandidateProfile, CandidateIntelligenceProfile, or generic candidate object
 * @returns System prompt string
 */
export function generateSystemPrompt(
  candidateProfile?: CandidateProfile | CandidateIntelligenceProfile | Record<string, unknown>
): string {
  const rawProfile = (candidateProfile || {}) as Record<string, unknown>;
  const intelProfile = candidateProfile as CandidateIntelligenceProfile;
  const standardProfile = candidateProfile as CandidateProfile;

  const experienceYears =
    intelProfile.experience ?? standardProfile.experience ?? standardProfile.member?.yearsExperience;
  const experienceLevel =
    typeof rawProfile.experienceLevel === "string" ? rawProfile.experienceLevel : undefined;

  let difficultyGuidance = "Adapt technical depth appropriately for a standard software engineer.";

  if (experienceYears !== undefined) {
    if (experienceYears <= 2) {
      difficultyGuidance =
        "The candidate is Entry Level (0-2 years). Focus on fundamental concept understanding, core definitions, and basic syntax.";
    } else if (experienceYears <= 5) {
      difficultyGuidance =
        "The candidate is Mid Level (3-5 years). Focus on practical implementation details, design trade-offs, and chunking/retrieval strategy decisions.";
    } else {
      difficultyGuidance =
        "The candidate is Senior/Lead (6+ years). Focus on high-level system architecture, multi-agent coordination, scalability, and complex failure recovery.";
    }
  } else if (experienceLevel) {
    const lvl = experienceLevel.toLowerCase();
    if (lvl.includes("begin")) {
      difficultyGuidance =
        "The candidate is Beginner level. Focus on fundamental concept understanding and core definitions.";
    } else if (lvl.includes("mid") || lvl.includes("inter")) {
      difficultyGuidance =
        "The candidate is Intermediate level. Focus on practical implementation details and RAG strategy trade-offs.";
    } else if (lvl.includes("sen") || lvl.includes("adv")) {
      difficultyGuidance =
        "The candidate is Senior level. Focus on architecture, multi-agent workflows, and complex edge cases.";
    }
  }

  return `You are Intervue AI, an expert technical interviewer and AI curriculum evaluator.

Core Instructions:
1. KNOWLEDGE GROUNDING: Ground all generated questions, evaluations, and explanations strictly in the provided Knowledge Context.
2. ANTI-HALLUCINATION: Do not invent unverified facts, APIs, or tools outside the provided curriculum context sources.
3. ADAPTIVE DIFFICULTY: ${difficultyGuidance}
4. RELEVANCE & FOCUS: If candidate weak areas or verification topics are specified in the candidate profile, target those areas with constructive technical questions.`;
}

/**
 * Formats user prompt text with clear delimited sections for Candidate Profile,
 * Knowledge Context, and Target Question / Topic.
 *
 * @param question - Interview question or topic text
 * @param candidateProfile - Candidate profile details
 * @param formattedContext - Formatted RAG context string
 * @param customInstructions - Optional additional directives
 * @returns Sectioned user prompt string
 */
export function formatUserPromptSections(
  question: string,
  candidateProfile?: CandidateProfile | CandidateIntelligenceProfile | Record<string, unknown>,
  formattedContext?: string,
  customInstructions?: string
): string {
  const sections: string[] = [];

  // Section 1: Candidate Profile
  if (candidateProfile) {
    const rawProfile = candidateProfile as Record<string, unknown>;
    const intelProfile = candidateProfile as CandidateIntelligenceProfile;
    const standardProfile = candidateProfile as CandidateProfile;

    const name =
      typeof rawProfile.name === "string"
        ? rawProfile.name
        : standardProfile.member?.name || "Candidate";
    const role =
      intelProfile.role || standardProfile.role || standardProfile.member?.jobRole || "Engineer";
    const exp =
      intelProfile.experience ?? standardProfile.experience ?? standardProfile.member?.yearsExperience;
    const expStr = exp !== undefined ? `${exp} years` : (rawProfile.experienceLevel as string) || "Unspecified";

    const weakAreas: string[] = [];
    if (Array.isArray(rawProfile.weakAreas)) {
      weakAreas.push(...rawProfile.weakAreas.map(String));
    }
    if (Array.isArray(rawProfile.previousWeakTopics)) {
      weakAreas.push(...rawProfile.previousWeakTopics.map(String));
    }
    if (intelProfile.verificationAreas && Array.isArray(intelProfile.verificationAreas)) {
      weakAreas.push(...intelProfile.verificationAreas.map((v) => v.topic));
    }

    const weaknesses: string[] = [];
    if (Array.isArray(rawProfile.weaknesses)) {
      weaknesses.push(...rawProfile.weaknesses.map(String));
    }
    const strengths: string[] = [];
    if (Array.isArray(rawProfile.strengths)) {
      strengths.push(...rawProfile.strengths.map(String));
    }
    const recommendedTopics: string[] = [];
    if (Array.isArray(rawProfile.recommendedTopics)) {
      recommendedTopics.push(...rawProfile.recommendedTopics.map(String));
    }

    let profileBlock = `--- CANDIDATE PROFILE ---
Candidate Name: ${name}
Target Role: ${role}
Experience Level: ${expStr}`;

    if (strengths.length > 0) {
      profileBlock += `\nDemonstrated Strengths: ${Array.from(new Set(strengths)).join(", ")}`;
    }
    if (weaknesses.length > 0) {
      profileBlock += `\nTarget Focus / Weaknesses: ${Array.from(new Set(weaknesses)).join(", ")}`;
    } else if (weakAreas.length > 0) {
      profileBlock += `\nTarget Focus / Weak Areas: ${Array.from(new Set(weakAreas)).join(", ")}`;
    }
    if (recommendedTopics.length > 0) {
      profileBlock += `\nRecommended Topics: ${Array.from(new Set(recommendedTopics)).join(", ")}`;
    }

    sections.push(profileBlock);
  }

  // Section 2: Knowledge Context (Retrieved RAG Sources)
  if (formattedContext && formattedContext.trim().length > 0) {
    sections.push(`--- RETRIEVED KNOWLEDGE CONTEXT ---
${formattedContext.trim()}`);
  }

  // Section 3: Question / Interview Topic
  sections.push(`--- INTERVIEW QUESTION / TOPIC ---
${question.trim()}`);

  // Section 4: Custom Instructions
  if (customInstructions && customInstructions.trim().length > 0) {
    sections.push(`--- ADDITIONAL INSTRUCTIONS ---
${customInstructions.trim()}`);
  }

  return sections.join("\n\n");
}

/**
 * Constructs structured LLM prompt payload (systemPrompt, userPrompt, metadata)
 * from candidate data, question, and retrieved chunks.
 *
 * @param input - PromptBuilderInput payload
 * @returns LLMPromptPayload
 */
export function buildLLMPromptPayload(input: PromptBuilderInput): LLMPromptPayload {
  // 1. Resolve Formatted Context Response
  let contextResp: FormattedContextResponse;
  if (input.contextResponse) {
    contextResp = input.contextResponse;
  } else if (input.chunks && input.chunks.length > 0) {
    contextResp = buildFormattedContext(input.chunks);
  } else {
    contextResp = {
      context: "",
      sources: [],
      totalChunksUsed: 0,
      characterCount: 0,
      truncated: false,
    };
  }

  // 2. Build System & User Prompts
  const systemPrompt = generateSystemPrompt(input.candidateProfile);
  const userPrompt = formatUserPromptSections(
    input.question,
    input.candidateProfile,
    contextResp.context,
    input.customInstructions
  );

  // 3. Extract Metadata
  const rawProfile = (input.candidateProfile || {}) as Record<string, unknown>;
  const intelProfile = input.candidateProfile as CandidateIntelligenceProfile;
  const standardProfile = input.candidateProfile as CandidateProfile;

  const candidateId =
    intelProfile?.candidateId || standardProfile?.id || standardProfile?.member?.id || (rawProfile.name as string) || undefined;
  const candidateRole =
    intelProfile?.role || standardProfile?.role || standardProfile?.member?.jobRole || undefined;
  const experienceYears =
    intelProfile?.experience ?? standardProfile?.experience ?? standardProfile?.member?.yearsExperience ?? undefined;

  const payload: LLMPromptPayload = {
    systemPrompt,
    userPrompt,
    metadata: {
      sources: contextResp.sources,
      totalChunks: contextResp.totalChunksUsed,
      candidateId,
      candidateRole,
      experienceYears,
    },
  };

  return strictValidate(
    LLMPromptPayloadSchema,
    payload,
    "LLM Prompt Payload"
  );
}
