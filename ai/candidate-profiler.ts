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
import { createJsonCompletion } from "@/lib/llm";

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
 */
export async function analyzeCandidate(
  candidateProfile: CandidateProfile,
  curriculum: CurriculumDay[]
): Promise<CandidateIntelligenceProfile> {
  const candidateId = candidateProfile.member?.id || "unknown";

  // Build a summary of curriculum topics for context
  const topicList = curriculum
    .slice(0, 31)
    .map((day) => `Day ${day.day}: ${day.topic}`)
    .join("\n");

  // Summarize missions
  const missions = candidateProfile.missions ?? [];
  const missionSummary = missions
    .map(
      (m) =>
        `Day ${m.day} - "${m.title}": passed=${m.passed}, attempts=${m.attempts ?? 1}, skipped=${m.skipped ?? false}`
    )
    .join("\n");

  const signals = candidateProfile.signals ?? {};
  const member = candidateProfile.member ?? {};

  const systemPrompt = `You are an expert AI interview strategist analyzing a learner's performance in a 31-day AI engineering cohort.
Your job is to analyze their cohort data and produce a structured intelligence profile that will guide a technical interview.

Apply these heuristics:
- passed=true + attempts=1 → strong evidence (strengthSignal)
- passed=true + attempts>2 → needs verification (priorityTopic)
- passed=false → knowledge gap (weaknessSignal + priorityTopic)
- skipped=true → unknown knowledge (priorityTopic, must verify)
- High commitDays and missionsFirstTry → strong learner, increase expectedDepthFactor
- Low commitDays → inconsistent learner, lower expectedDepthFactor

Return ONLY valid JSON matching the required schema. No markdown, no extra text.`;

  const userPrompt = `Analyze this candidate and return a JSON profile.

CANDIDATE:
- ID: ${candidateId}
- Name: ${member.name ?? "Unknown"}
- Job Role: ${member.jobRole ?? "Unknown"}
- Years Experience: ${member.yearsExperience ?? 0}
- Education: ${member.education ?? "Unknown"}

COHORT SIGNALS:
- Commit Days: ${signals.commitDays ?? 0}
- Missions Completed: ${signals.missionsCompleted ?? 0}
- Missions First Try: ${signals.missionsFirstTry ?? 0}

MISSION RESULTS:
${missionSummary || "No mission data available."}

CURRICULUM TOPICS:
${topicList}

Return this exact JSON structure (no extra keys):
{
  "candidateId": "${candidateId}",
  "initialKnowledgeEstimates": [
    { "topic": "string", "estimatedScore": 0-10, "confidence": "low|medium|high", "evidenceCount": 0 }
  ],
  "priorityTopics": ["topic1", "topic2"],
  "weaknessSignals": ["topic1", "topic2"],
  "strengthSignals": ["topic1", "topic2"],
  "expectedDepthFactor": 1.0,
  "profileSummary": "2-3 sentence narrative about the candidate's learning journey and interview focus areas"
}`;

  const profile = await createJsonCompletion<CandidateIntelligenceProfile>([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  // Ensure candidateId is always set correctly
  return { ...profile, candidateId };
}
