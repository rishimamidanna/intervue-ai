/**
 * lib/rag/context-builder.ts
 *
 * RAG Context Builder Module
 *
 * Combines CandidateIntelligenceProfile data (from Milestone 1.2) and retrieved
 * RelevantKnowledgeContext (from Milestone 1.4) into a structured, AI-ready
 * StructuredInterviewContext.
 *
 * Architecture Position: RAG Context Preparation Layer (Milestone 1.5)
 *
 * Requirements:
 * - 100% Deterministic context synthesis
 * - Zero AI / LLM calls
 * - Zero external dependencies
 * - Graceful handling of empty retrieval results or missing candidate information
 *
 * Owner: Shared / AI & Backend Layer
 */

import type { CandidateIntelligenceProfile, StructuredInterviewContext } from "@/types/candidate";
import type { CurriculumKnowledgeUnit, RelevantKnowledgeContext } from "@/types/curriculum";

/**
 * Formats a clean, structured text block ready for inclusion in LLM system prompts or question generators.
 */
export function formatPromptContext(
  candidateProfile: Partial<CandidateIntelligenceProfile>,
  retrievedUnits: CurriculumKnowledgeUnit[] = [],
  relevanceScore = 0
): string {
  const name = candidateProfile.candidateName || "Candidate";
  const role = candidateProfile.jobRole || "Engineer";
  const exp = candidateProfile.yearsExperience ?? 0;
  const depth = candidateProfile.expectedDepthFactor ?? 1.0;
  const summary = candidateProfile.profileSummary || "No candidate summary provided.";

  const strengthsList = (candidateProfile.strengths ?? []).length > 0
    ? candidateProfile.strengths!.map((s) => `- ${s}`).join("\n")
    : "- None identified";

  const weaknessesList = (candidateProfile.weaknesses ?? []).length > 0
    ? candidateProfile.weaknesses!.map((w) => `- ${w}`).join("\n")
    : "- None identified";

  const focusList = (candidateProfile.recommendedFocusAreas ?? []).length > 0
    ? candidateProfile.recommendedFocusAreas!.map((f) => `- ${f}`).join("\n")
    : "- General AI Engineering";

  let ragSection = "";
  if (retrievedUnits.length > 0) {
    const unitsStr = retrievedUnits
      .map((unit, idx) => {
        const mod = unit.moduleTitle ? `Module ${unit.moduleNumber}: ${unit.moduleTitle}` : "General Module";
        const toolsStr = (unit.tools ?? []).join(", ");
        const conceptsStr = (unit.concepts ?? []).join(", ");
        const objStr = (unit.objectives ?? []).slice(0, 3).join("; ");

        return `[Unit ${idx + 1}: ${mod} | Day ${unit.day}: ${unit.topic} (${unit.type})]\n` +
          `  Tools: ${toolsStr || "N/A"}\n` +
          `  Concepts: ${conceptsStr || "N/A"}\n` +
          `  Objectives: ${objStr || "N/A"}`;
      })
      .join("\n\n");

    ragSection = `=== RETRIEVED CURRICULUM KNOWLEDGE (RAG CONTEXT - Relevance: ${relevanceScore}) ===\n${unitsStr}`;
  } else {
    ragSection = `=== RETRIEVED CURRICULUM KNOWLEDGE (RAG CONTEXT) ===\n[No matching curriculum units retrieved for this candidate profile]`;
  }

  return `=== CANDIDATE INTELLIGENCE SUMMARY ===
Candidate: ${name} (${role}, ${exp} yrs experience)
Expected Depth Factor: ${depth}
Summary: ${summary}

STRENGTHS:
${strengthsList}

WEAKNESSES / GAPS:
${weaknessesList}

RECOMMENDED INTERVIEW FOCUS:
${focusList}

${ragSection}`;
}

/**
 * Main Context Builder Function: Combines Candidate Intelligence Profile and Retrieved Knowledge
 * into a structured, AI-ready StructuredInterviewContext payload.
 *
 * @param candidateProfile - Validated CandidateIntelligenceProfile (from Milestone 1.2)
 * @param retrievalContext - Retrieved RelevantKnowledgeContext (from Milestone 1.4)
 * @returns StructuredInterviewContext
 */
export function buildInterviewContext(
  candidateProfile?: CandidateIntelligenceProfile | null,
  retrievalContext?: RelevantKnowledgeContext | null
): StructuredInterviewContext {
  const fallbackProfile: CandidateIntelligenceProfile = {
    candidateId: "UNKNOWN",
    candidateName: "Unknown Candidate",
    jobRole: "Software Engineer",
    yearsExperience: 0,
    strengths: [],
    weaknesses: [],
    completedTopics: [],
    missingTopics: [],
    skillCoverage: {
      totalMissions: 0,
      completedMissions: 0,
      passedMissions: 0,
      firstTryPasses: 0,
      skippedMissions: 0,
      completionRate: 0,
      passRate: 0,
    },
    recommendedFocusAreas: ["General Technical Foundations"],
    expectedDepthFactor: 1.0,
    profileSummary: "No candidate profile data available.",
    initialKnowledgeEstimates: [],
    priorityTopics: ["General Technical Foundations"],
    weaknessSignals: [],
    strengthSignals: [],
  };

  const profile = candidateProfile ?? fallbackProfile;

  const retrievedKnowledge = Array.isArray(retrievalContext?.units) ? retrievalContext!.units : [];
  const relevanceScore = retrievalContext?.relevanceScore ?? 0;

  // Extract topics: combination of retrieval topics and recommended focus areas
  const topicsSet = new Set<string>();
  (retrievalContext?.topics ?? []).forEach((t) => topicsSet.add(t));
  (profile.recommendedFocusAreas ?? []).forEach((f) => topicsSet.add(f));
  const relevantTopics = Array.from(topicsSet);

  // Extract concepts: retrieval concepts + concepts from units
  const conceptsSet = new Set<string>();
  (retrievalContext?.concepts ?? []).forEach((c) => conceptsSet.add(c));
  retrievedKnowledge.forEach((unit) => {
    (unit.concepts ?? []).forEach((c) => {
      if (c && c.trim().length > 0) conceptsSet.add(c.trim());
    });
  });
  const conceptsToEvaluate = Array.from(conceptsSet);

  const focusAreas = profile.recommendedFocusAreas ?? [];
  const strengths = profile.strengths ?? [];
  const weaknesses = profile.weaknesses ?? [];
  const candidateSummary = profile.profileSummary || "No candidate summary available.";

  const formattedPromptContext = formatPromptContext(profile, retrievedKnowledge, relevanceScore);

  return {
    candidateId: profile.candidateId || "UNKNOWN",
    candidateSummary,
    strengths,
    weaknesses,
    relevantTopics,
    conceptsToEvaluate,
    relevantConcepts: conceptsToEvaluate,
    focusAreas,
    recommendedInterviewFocus: focusAreas,
    retrievedKnowledge,
    relevanceScore,
    formattedPromptContext,
  };
}
