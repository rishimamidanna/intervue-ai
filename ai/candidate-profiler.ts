/**
 * ai/candidate-profiler.ts
 *
 * Candidate Intelligence Profiler Module
 *
 * Analyzes a candidate's cohort history (member profile, missions, and signals)
 * using deterministic heuristics to produce an initial CandidateIntelligenceProfile.
 *
 * Requirements:
 * - Deterministic logic
 * - No AI calls / No external dependencies
 *
 * Owner: Shared / AI & Backend Layer
 */

import type { CandidateProfile, CandidateIntelligenceProfile } from "@/types/candidate";
import type { CurriculumDay } from "@/types/curriculum";
import { analyzeCandidateProfile } from "@/lib/analyzer/candidate-analyzer";

export type { CandidateIntelligenceProfile } from "@/types/candidate";

/**
 * Analyzes a candidate's cohort history to produce a deterministic intelligence profile.
 *
 * @param candidateProfile - The candidate's cohort data matching official schema
 * @param curriculum - Optional full curriculum array to contextualize missing topics
 * @returns CandidateIntelligenceProfile seeding the interview strategy
 */
export async function analyzeCandidate(
  candidateProfile: CandidateProfile,
  curriculum?: CurriculumDay[]
): Promise<CandidateIntelligenceProfile> {
  return analyzeCandidateProfile(candidateProfile, curriculum);
}
