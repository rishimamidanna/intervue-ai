/**
 * lib/analyzer/candidate-analyzer.ts
 *
 * Candidate Intelligence Analyzer
 *
 * Transforms validated CandidateProfile objects into deterministic CandidateIntelligenceProfile objects.
 * Evaluates skill coverage, completed topics, missing topics, strengths, weaknesses, and recommended focus areas.
 *
 * Architecture Position: Candidate Analysis Layer (Milestone 1.2)
 *
 * Requirements:
 * - 100% Deterministic logic
 * - Zero AI/LLM calls
 * - Zero external dependencies
 * - Safe handling of empty/incomplete candidate data
 *
 * Owner: Shared / AI & Backend Layer
 */

import type { CandidateProfile, CandidateIntelligenceProfile, SkillCoverage } from "@/types/candidate";
import type { CurriculumDay } from "@/types/curriculum";
import type { TopicKnowledge } from "@/types/interview";

/**
 * Calculates skill coverage metrics from candidate missions and signals.
 */
export function calculateSkillCoverage(candidate: CandidateProfile): SkillCoverage {
  const missions = candidate?.missions ?? [];
  const totalMissions = missions.length;

  let completedMissions = 0;
  let passedMissions = 0;
  let firstTryPasses = 0;
  let skippedMissions = 0;

  missions.forEach((m) => {
    if (m.skipped) {
      skippedMissions++;
    } else if (m.passed) {
      completedMissions++;
      passedMissions++;
      if (m.attempts === 1 || m.attempts === undefined) {
        firstTryPasses++;
      }
    }
  });

  const completionRate = totalMissions > 0
    ? Number(((completedMissions / totalMissions) * 100).toFixed(1))
    : 0;

  const validAttemptsCount = totalMissions - skippedMissions;
  const passRate = validAttemptsCount > 0
    ? Number(((passedMissions / validAttemptsCount) * 100).toFixed(1))
    : 0;

  return {
    totalMissions,
    completedMissions,
    passedMissions,
    firstTryPasses,
    skippedMissions,
    completionRate,
    passRate,
  };
}

/**
 * Calculates expected depth factor based on years of experience and job role.
 * Range: 0.5 to 2.0
 */
export function calculateExpectedDepthFactor(yearsExperience = 0, jobRole = ""): number {
  let baseDepth = 1.0;

  if (yearsExperience < 2) {
    baseDepth = 0.8;
  } else if (yearsExperience <= 4) {
    baseDepth = 1.0;
  } else if (yearsExperience <= 8) {
    baseDepth = 1.2;
  } else {
    baseDepth = 1.4;
  }

  const roleLower = jobRole.toLowerCase();
  if (roleLower.includes("senior") || roleLower.includes("lead") || roleLower.includes("principal") || roleLower.includes("staff")) {
    baseDepth += 0.2;
  } else if (roleLower.includes("junior") || roleLower.includes("intern")) {
    baseDepth -= 0.1;
  }

  return Number(Math.min(2.0, Math.max(0.5, baseDepth)).toFixed(2));
}

/**
 * Identifies completed topics (unique titles of passed missions).
 */
export function identifyCompletedTopics(candidate: CandidateProfile): string[] {
  const missions = candidate?.missions ?? [];
  const completed = new Set<string>();

  missions.forEach((m) => {
    if (m.passed && !m.skipped && m.title) {
      completed.add(m.title);
    }
  });

  return Array.from(completed);
}

/**
 * Identifies missing topics (skipped/unpassed missions, or curriculum days not present in passed missions).
 */
export function identifyMissingTopics(candidate: CandidateProfile, curriculum?: CurriculumDay[]): string[] {
  const missing = new Set<string>();
  const missions = candidate?.missions ?? [];
  const passedDays = new Set<number>();

  missions.forEach((m) => {
    if (m.passed && !m.skipped) {
      passedDays.add(m.day);
    } else if (m.skipped || m.passed === false) {
      if (m.title) missing.add(m.title);
    }
  });

  if (curriculum && curriculum.length > 0) {
    curriculum.forEach((cDay) => {
      if (!passedDays.has(cDay.day)) {
        missing.add(cDay.title);
      }
    });
  }

  return Array.from(missing);
}

/**
 * Identifies strength topics (passed on 1st attempt with no skips).
 */
export function identifyStrengths(candidate: CandidateProfile): string[] {
  const strengths = new Set<string>();
  const missions = candidate?.missions ?? [];

  missions.forEach((m) => {
    if (m.passed && !m.skipped && (m.attempts === 1 || m.attempts === undefined) && m.title) {
      strengths.add(m.title);
    }
  });

  const signals = candidate?.signals;
  if (signals && signals.missionsCompleted > 0) {
    const firstTryRatio = signals.missionsFirstTry / signals.missionsCompleted;
    if (firstTryRatio >= 0.75) {
      strengths.add("High First-Try Success Rate");
    }
  }

  return Array.from(strengths);
}

/**
 * Identifies weakness topics (failed, skipped, or required >= 3 attempts).
 */
export function identifyWeaknesses(candidate: CandidateProfile): string[] {
  const weaknesses = new Set<string>();
  const missions = candidate?.missions ?? [];

  missions.forEach((m) => {
    if (!m.title) return;
    if (m.passed === false) {
      weaknesses.add(`${m.title} (Failed)`);
    } else if (m.skipped) {
      weaknesses.add(`${m.title} (Skipped)`);
    } else if (m.passed && m.attempts && m.attempts >= 3) {
      weaknesses.add(`${m.title} (${m.attempts} attempts required)`);
    }
  });

  return Array.from(weaknesses);
}

/**
 * Determines recommended focus areas for technical interview.
 * Combines weaknesses and missing topics, falling back to role-appropriate topics if candidate has no gaps.
 */
export function determineRecommendedFocusAreas(
  candidate: CandidateProfile,
  weaknesses: string[],
  missingTopics: string[]
): string[] {
  const focusAreas = new Set<string>();

  // 1. Add weaknesses (clean title without bracket notes)
  weaknesses.forEach((w) => {
    const cleanTitle = w.replace(/\s*\([^)]*\)/g, "").trim();
    if (cleanTitle) focusAreas.add(cleanTitle);
  });

  // 2. Add missing topics
  missingTopics.forEach((m) => focusAreas.add(m));

  // 3. Fallback for high-performing candidates with no weaknesses or missing topics
  if (focusAreas.size === 0) {
    const jobRole = candidate?.member?.jobRole ?? "";
    const roleLower = jobRole.toLowerCase();

    if (roleLower.includes("data") || roleLower.includes("engineer")) {
      focusAreas.add("Vector Databases & Retrieval Pipeline Optimization");
      focusAreas.add("Multi-Agent Orchestration");
    } else if (roleLower.includes("ai") || roleLower.includes("ml")) {
      focusAreas.add("Model Context Protocol (MCP) & Agent Architecture");
      focusAreas.add("Evaluation, Security & Guardrails");
    } else {
      focusAreas.add("System Architecture & Capstone Implementation");
      focusAreas.add("Prompt Engineering & Structured Outputs");
    }
  }

  return Array.from(focusAreas);
}

/**
 * Builds initial deterministic TopicKnowledge estimates for Knowledge Twin.
 */
export function buildInitialKnowledgeEstimates(
  strengths: string[],
  weaknesses: string[],
  completedTopics: string[]
): TopicKnowledge[] {
  const estimates: TopicKnowledge[] = [];
  const processed = new Set<string>();

  const cleanWeaknessTitles = weaknesses.map((w) => w.replace(/\s*\([^)]*\)/g, "").trim());

  cleanWeaknessTitles.forEach((topic) => {
    if (topic && !processed.has(topic)) {
      processed.add(topic);
      estimates.push({
        topic,
        estimatedScore: 3,
        confidence: "low",
        evidenceCount: 1,
      });
    }
  });

  strengths.forEach((topic) => {
    if (topic && !processed.has(topic) && !topic.includes("Success Rate")) {
      processed.add(topic);
      estimates.push({
        topic,
        estimatedScore: 8,
        confidence: "medium",
        evidenceCount: 1,
      });
    }
  });

  completedTopics.forEach((topic) => {
    if (topic && !processed.has(topic)) {
      processed.add(topic);
      estimates.push({
        topic,
        estimatedScore: 6,
        confidence: "medium",
        evidenceCount: 1,
      });
    }
  });

  return estimates;
}

/**
 * Generates a human-readable profile summary narrative.
 */
export function generateProfileSummary(
  candidate: CandidateProfile,
  coverage: SkillCoverage,
  focusAreas: string[]
): string {
  const member = candidate?.member ?? { name: "Candidate", jobRole: "Software Engineer", yearsExperience: 0 };
  const name = member.name || "Candidate";
  const role = member.jobRole || "Engineer";
  const exp = member.yearsExperience ?? 0;

  const focusStr = focusAreas.length > 0 ? focusAreas.slice(0, 3).join(", ") : "General AI Engineering";

  return `${name} is a ${role} with ${exp} years of experience. ` +
    `Completed ${coverage.completedMissions} of ${coverage.totalMissions} cohort missions (${coverage.completionRate}% completion rate). ` +
    `Recommended interview focus: ${focusStr}.`;
}

/**
 * Main Analyzer Function: Analyzes candidate profile deterministically.
 *
 * @param candidate - Validated CandidateProfile object from Milestone 1.1
 * @param curriculum - Optional array of CurriculumDay objects for full 31-day context
 * @returns CandidateIntelligenceProfile
 */
export function analyzeCandidateProfile(
  candidate: CandidateProfile,
  curriculum?: CurriculumDay[]
): CandidateIntelligenceProfile {
  if (!candidate || typeof candidate !== "object") {
    throw new Error("Invalid candidate profile object: candidate must be an object");
  }

  const member = candidate.member ?? {
    id: "UNKNOWN",
    name: "Unknown Candidate",
    jobRole: "Software Engineer",
    yearsExperience: 0,
    education: "Unknown",
    status: "UNKNOWN",
  };

  const candidateId = member.id || "UNKNOWN";
  const candidateName = member.name || "Unknown Candidate";
  const jobRole = member.jobRole || "Software Engineer";
  const yearsExperience = member.yearsExperience ?? 0;

  const skillCoverage = calculateSkillCoverage(candidate);
  const expectedDepthFactor = calculateExpectedDepthFactor(yearsExperience, jobRole);
  const completedTopics = identifyCompletedTopics(candidate);
  const missingTopics = identifyMissingTopics(candidate, curriculum);
  const strengths = identifyStrengths(candidate);
  const weaknesses = identifyWeaknesses(candidate);
  const recommendedFocusAreas = determineRecommendedFocusAreas(candidate, weaknesses, missingTopics);
  const profileSummary = generateProfileSummary(candidate, skillCoverage, recommendedFocusAreas);
  const initialKnowledgeEstimates = buildInitialKnowledgeEstimates(strengths, weaknesses, completedTopics);

  return {
    candidateId,
    candidateName,
    jobRole,
    yearsExperience,
    strengths,
    weaknesses,
    completedTopics,
    missingTopics,
    skillCoverage,
    recommendedFocusAreas,
    expectedDepthFactor,
    profileSummary,

    // Signal mappings for Knowledge Twin & Interview Strategy compatibility
    initialKnowledgeEstimates,
    priorityTopics: recommendedFocusAreas,
    weaknessSignals: weaknesses,
    strengthSignals: strengths,
  };
}
