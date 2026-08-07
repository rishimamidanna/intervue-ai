/**
 * ai/candidate-profiler.ts
 *
 * Candidate Intelligence Engine — Profile Analysis
 *
 * Analyzes a candidate's cohort history (member profile, missions, and signals)
 * to produce an initial intelligence profile that seeds the Candidate Knowledge Twin
 * and Interview Strategy.
 *
 * HEURISTICS FOR INTERVIEW PLANNING:
 *   - passed = true + low attempts  → possible strength
 *   - passed = true + high attempts → needs verification (probe deeper)
 *   - passed = false                → likely gap (prioritise questioning)
 *   - skipped = true                → little/no evidence (must verify understanding)
 *   - signals.missionsFirstTry      → overall learning-performance signal
 *   - signals.commitDays            → consistency signal
 *   - member.jobRole                → contextualise interview scenarios
 *   - member.yearsExperience        → adjust expected depth
 *
 * ⚠️ IMPORTANT: These are HEURISTICS for initial strategy and prompt seeding only.
 * They are NOT converted directly into final interview scores. The actual interview
 * MUST verify the candidate's actual understanding during the session.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import type { CandidateProfile } from "@/types/candidate";
import type { CurriculumDay } from "@/types/curriculum";
import type { TopicKnowledge } from "@/types/interview";

// ---------------------------------------------------------------------------
// Output Type
// ---------------------------------------------------------------------------

/**
 * The structured intelligence profile produced by the Candidate Profiler.
 * Feeds directly into createKnowledgeTwin() and createInterviewPlan().
 */
export interface CandidateIntelligenceProfile {
  candidateId: string;
  /** Estimated knowledge level per topic, derived from cohort activity heuristics */
  initialKnowledgeEstimates: TopicKnowledge[];
  /** Topics that should be prioritised in the interview strategy */
  priorityTopics: string[];
  /** Topics that appear weak based on skips, fails, or high attempt counts */
  weaknessSignals: string[];
  /** Topics that appear strong based on first-try passes */
  strengthSignals: string[];
  /** Expected depth factor (derived from yearsExperience and jobRole) */
  expectedDepthFactor: number;
  /** Human-readable narrative profile summary */
  profileSummary: string;
}

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

/**
 * Analyzes a candidate's cohort history to produce an intelligence profile.
 *
 * @param candidateProfile - The candidate's cohort data matching official schema
 * @param curriculum - The full curriculum (used to contextualise topics)
 * @returns CandidateIntelligenceProfile seeding the interview strategy
 *
 * TODO: Replace placeholder return with real LLM-powered candidate analysis.
 */
export async function analyzeCandidate(
  candidateProfile: CandidateProfile,
  curriculum: CurriculumDay[]
): Promise<CandidateIntelligenceProfile> {
  void candidateProfile;
  void curriculum;

  // TODO: Implement real LLM-based candidate analysis using heuristics described above
  return {
    candidateId: candidateProfile.member?.id || "unknown",
    initialKnowledgeEstimates: [],
    priorityTopics: [],
    weaknessSignals: [],
    strengthSignals: [],
    expectedDepthFactor: 1,
    profileSummary: "Not implemented — analyzeCandidate() is a scaffold stub.",
  };
}
