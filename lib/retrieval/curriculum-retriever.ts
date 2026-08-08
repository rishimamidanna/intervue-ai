/**
 * lib/retrieval/curriculum-retriever.ts
 *
 * Curriculum Retrieval Layer
 *
 * Provides reusable, deterministic curriculum retrieval for matching candidate needs
 * (weaknesses, missing topics, recommended focus areas, job role) against processed
 * curriculum knowledge units.
 *
 * Architecture Position: Retrieval Foundation (Milestone 1.4)
 *
 * Requirements:
 * - 100% Deterministic retrieval logic
 * - Zero AI / LLM calls
 * - Zero external APIs / No vector DB required
 * - Graceful handling of empty/missing candidate info, empty curriculum, or zero matches
 *
 * Owner: Shared / Backend (Data Layer)
 */

import type { CandidateIntelligenceProfile } from "@/types/candidate";
import type { CurriculumKnowledgeUnit, MatchedKnowledgeUnit, RelevantKnowledgeContext } from "@/types/curriculum";

export interface RetrievalOptions {
  /** Maximum number of knowledge units to retrieve (default: 5) */
  limit?: number;
  /** Minimum relevance score threshold to include a unit (0.00 to 1.00, default: 0.15) */
  minScore?: number;
}

export interface RetrievalQuery {
  focusAreas?: string[];
  weaknesses?: string[];
  missingTopics?: string[];
  strengths?: string[];
  keywords?: string[];
  jobRole?: string;
}

/**
 * Normalizes a topic or phrase string by stripping parenthetical notes and punctuation.
 */
export function normalizePhrase(phrase: string): string {
  if (!phrase) return "";
  return phrase
    .replace(/\s*\([^)]*\)/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Calculates deterministic relevance score (0.00 to 1.00) between a query and a single CurriculumKnowledgeUnit.
 */
export function calculateUnitRelevanceScore(
  unit: CurriculumKnowledgeUnit,
  query: RetrievalQuery
): MatchedKnowledgeUnit {
  if (!unit) {
    return {
      unit: {} as CurriculumKnowledgeUnit,
      score: 0,
      matchReasons: [],
    };
  }

  let rawScore = 0;
  const matchReasons: string[] = [];

  const unitTopicLower = (unit.topic ?? "").toLowerCase();
  const unitModuleLower = (unit.moduleTitle ?? "").toLowerCase();
  const unitSearchableLower = (unit.searchableContent ?? "").toLowerCase();
  const unitKeywords = (unit.keywords ?? []).map((k) => k.toLowerCase());
  const unitConcepts = (unit.concepts ?? []).map((c) => c.toLowerCase());

  // 1. Candidate Weaknesses Match (HIGHEST PRIORITY - up to 60 pts)
  const weaknesses = query.weaknesses ?? [];
  weaknesses.forEach((weakness) => {
    const cleanWeakness = normalizePhrase(weakness);
    if (!cleanWeakness) return;

    if (unitTopicLower.includes(cleanWeakness) || cleanWeakness.includes(unitTopicLower)) {
      rawScore += 60;
      matchReasons.push(`Candidate weakness topic match: "${weakness}"`);
    } else if (unitSearchableLower.includes(cleanWeakness)) {
      rawScore += 40;
      matchReasons.push(`Candidate weakness content match: "${weakness}"`);
    } else {
      const words = cleanWeakness.split(/\s+/).filter((w) => w.length > 3);
      const matchedWords = words.filter((w) => unitKeywords.includes(w) || unitSearchableLower.includes(w));
      if (matchedWords.length > 0) {
        rawScore += 15 * matchedWords.length;
        matchReasons.push(`Candidate weakness keyword match: [${matchedWords.join(", ")}]`);
      }
    }
  });

  // 2. Recommended Focus Areas Match (HIGH PRIORITY - up to 30 pts)
  const focusAreas = query.focusAreas ?? [];
  focusAreas.forEach((focus) => {
    const cleanFocus = normalizePhrase(focus);
    if (!cleanFocus) return;

    if (unitTopicLower.includes(cleanFocus) || cleanFocus.includes(unitTopicLower)) {
      rawScore += 30;
      matchReasons.push(`Focus area topic match: "${focus}"`);
    } else if (unitSearchableLower.includes(cleanFocus)) {
      rawScore += 20;
      matchReasons.push(`Focus area content match: "${focus}"`);
    }
  });

  // 3. Missing Topics Match (MEDIUM PRIORITY - up to 15 pts)
  const missing = query.missingTopics ?? [];
  missing.forEach((topic) => {
    const cleanMissing = normalizePhrase(topic);
    if (!cleanMissing) return;

    if (unitTopicLower.includes(cleanMissing)) {
      rawScore += 15;
      matchReasons.push(`Missing topic match: "${topic}"`);
    } else if (unitSearchableLower.includes(cleanMissing)) {
      rawScore += 10;
      matchReasons.push(`Missing topic content match: "${topic}"`);
    }
  });

  // 4. Keyword & Skill Query Match (MEDIUM - up to 15 pts)
  const queryKeywords = query.keywords ?? [];
  queryKeywords.forEach((kw) => {
    const cleanKw = kw.toLowerCase().trim();
    if (!cleanKw) return;

    if (unitKeywords.includes(cleanKw) || unitConcepts.some((c) => c.includes(cleanKw))) {
      rawScore += 10;
      matchReasons.push(`Keyword match: "${cleanKw}"`);
    }
  });

  // 5. Job Role Alignment (LOW - up to 5 pts)
  if (query.jobRole) {
    const roleLower = query.jobRole.toLowerCase();
    if (roleLower.includes("data") && (unitKeywords.includes("python") || unitKeywords.includes("vector") || unitModuleLower.includes("data"))) {
      rawScore += 5;
      matchReasons.push(`Role alignment: ${query.jobRole}`);
    } else if (roleLower.includes("ai") && (unitKeywords.includes("mcp") || unitKeywords.includes("agent") || unitKeywords.includes("embeddings"))) {
      rawScore += 5;
      matchReasons.push(`Role alignment: ${query.jobRole}`);
    }
  }

  // Normalize final score to range [0.00, 1.00]
  const finalScore = Number(Math.min(1.0, Math.max(0.0, rawScore / 60)).toFixed(2));

  return {
    unit,
    score: finalScore,
    matchReasons: Array.from(new Set(matchReasons)),
  };
}

/**
 * Retrieves the most relevant curriculum knowledge units based on candidate intelligence profile.
 *
 * @param candidateProfile - CandidateIntelligenceProfile from Milestone 1.2
 * @param units - Array of CurriculumKnowledgeUnit objects from Milestone 1.3
 * @param options - Retrieval options (limit, minScore)
 * @returns RelevantKnowledgeContext object containing units, topics, concepts, and relevanceScore
 */
export function retrieveRelevantKnowledge(
  candidateProfile?: CandidateIntelligenceProfile | null,
  units?: CurriculumKnowledgeUnit[] | null,
  options?: RetrievalOptions
): RelevantKnowledgeContext {
  const emptyResult: RelevantKnowledgeContext = {
    units: [],
    topics: [],
    concepts: [],
    relevanceScore: 0,
    matchedCount: 0,
    matches: [],
  };

  if (!candidateProfile || !units || !Array.isArray(units) || units.length === 0) {
    return emptyResult;
  }

  const limit = options?.limit ?? 5;
  const minScore = options?.minScore ?? 0.15;

  const query: RetrievalQuery = {
    focusAreas: candidateProfile.recommendedFocusAreas ?? [],
    weaknesses: candidateProfile.weaknesses ?? [],
    missingTopics: candidateProfile.missingTopics ?? [],
    strengths: candidateProfile.strengths ?? [],
    jobRole: candidateProfile.jobRole ?? "",
  };

  const allMatches = units
    .map((unit) => calculateUnitRelevanceScore(unit, query))
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score);

  if (allMatches.length === 0) {
    return emptyResult;
  }

  const topMatches = allMatches.slice(0, limit);
  const matchedUnits = topMatches.map((m) => m.unit);

  // Extract unique topics and concepts
  const topicsSet = new Set<string>();
  const conceptsSet = new Set<string>();

  matchedUnits.forEach((unit) => {
    if (unit.topic) topicsSet.add(unit.topic);
    if (Array.isArray(unit.concepts)) {
      unit.concepts.forEach((c) => {
        if (c && c.trim().length > 0) conceptsSet.add(c.trim());
      });
    }
  });

  // Calculate overall relevance score (average score of top matches)
  const scoreSum = topMatches.reduce((acc, m) => acc + m.score, 0);
  const overallRelevanceScore = Number((scoreSum / topMatches.length).toFixed(2));

  return {
    units: matchedUnits,
    topics: Array.from(topicsSet),
    concepts: Array.from(conceptsSet),
    relevanceScore: overallRelevanceScore,
    matchedCount: matchedUnits.length,
    matches: topMatches,
  };
}

/**
 * Searches curriculum knowledge units by specific topic string or query keywords.
 *
 * @param topicOrQuery - String query to match against topics and keywords
 * @param units - Array of CurriculumKnowledgeUnit objects
 * @param options - Retrieval options
 * @returns RelevantKnowledgeContext
 */
export function searchKnowledgeUnitsByTopic(
  topicOrQuery: string,
  units: CurriculumKnowledgeUnit[],
  options?: RetrievalOptions
): RelevantKnowledgeContext {
  const emptyResult: RelevantKnowledgeContext = {
    units: [],
    topics: [],
    concepts: [],
    relevanceScore: 0,
    matchedCount: 0,
    matches: [],
  };

  if (!topicOrQuery || !units || !Array.isArray(units) || units.length === 0) {
    return emptyResult;
  }

  const dummyProfile: CandidateIntelligenceProfile = {
    candidateId: "QUERY",
    candidateName: "Search Query",
    jobRole: "",
    yearsExperience: 0,
    strengths: [],
    weaknesses: [topicOrQuery],
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
    recommendedFocusAreas: [topicOrQuery],
    expectedDepthFactor: 1.0,
    profileSummary: "",
    initialKnowledgeEstimates: [],
    priorityTopics: [topicOrQuery],
    weaknessSignals: [topicOrQuery],
    strengthSignals: [],
  };

  return retrieveRelevantKnowledge(dummyProfile, units, options);
}
