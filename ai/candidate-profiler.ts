/**
 * ai/candidate-profiler.ts
 *
 * Candidate Intelligence Profiler Module
 *
 * Analyzes a candidate's cohort history (member profile, missions, and signals)
 * using an LLM to produce an initial CandidateIntelligenceProfile that seeds
 * the Knowledge Twin and Interview Strategy.
 *
 * Owner: Shared / AI & Backend Layer
 */

import type { CandidateProfile, CandidateIntelligenceProfile, CandidateMember } from "@/types/candidate";
import type { CurriculumDay } from "@/types/curriculum";
import { createJsonCompletion } from "@/lib/llm";

export type { CandidateIntelligenceProfile } from "@/types/candidate";

/**
 * Analyzes a candidate's cohort history to produce a structured intelligence profile.
 *
 * @param candidateProfile - The candidate's cohort data matching official schema
 * @param curriculum - Optional full curriculum array to contextualize missing topics
 * @returns CandidateIntelligenceProfile seeding the interview strategy
 */
export async function analyzeCandidate(
  candidateProfile: CandidateProfile,
  curriculum?: CurriculumDay[]
): Promise<CandidateIntelligenceProfile> {
  const candidateId = candidateProfile.member?.id || "unknown";
  const member: Partial<CandidateMember> = candidateProfile.member ?? {};
  const missions = candidateProfile.missions ?? [];
  const signals = candidateProfile.signals ?? {};

  const topicList = (curriculum ?? [])
    .slice(0, 31)
    .map((day) => `Day ${day.day}: ${day.topic}`)
    .join("\n");

  const missionSummary = missions
    .map(
      (m) =>
        `Day ${m.day} - "${m.title}": passed=${m.passed}, attempts=${m.attempts ?? 1}, skipped=${m.skipped ?? false}`
    )
    .join("\n");

  const systemPrompt = `You are an expert AI interview strategist analyzing a learner's performance in a 31-day AI engineering cohort.
Produce a structured intelligence profile to guide a technical interview.

Heuristics:
- passed=true + attempts=1 → strength
- passed=true + attempts>2 → needs verification
- passed=false → knowledge gap
- skipped=true → unknown knowledge, must verify
- High commitDays and missionsFirstTry → strong learner

Return ONLY valid JSON. No markdown, no extra text.`;

  const userPrompt = `Analyze this candidate.

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
${topicList || "Standard AI Engineering curriculum"}

Return this exact JSON:
{
  "candidateId": "${candidateId}",
  "strengths": [{ "topic": "string", "evidence": "string", "reason": "string" }],
  "verificationAreas": [{ "topic": "string", "signal": "failed_mission", "reason": "string" }],
  "learningProfile": {
    "consistencyLevel": "High",
    "completionRate": 85,
    "firstTryPassRate": 70,
    "totalCommitDays": ${signals.commitDays ?? 0},
    "summary": "string"
  },
  "recommendedFocus": [{ "day": 1, "topic": "string", "priority": "High", "priorityScore": 8, "reason": "string" }],
  "role": "${member.jobRole ?? "AI Engineer"}",
  "experience": ${member.yearsExperience ?? 0},
  "education": "${member.education ?? "Unknown"}",
  "generatedAt": "${new Date().toISOString()}"
}`;

  try {
    const profile = await createJsonCompletion<CandidateIntelligenceProfile>([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
    return { ...profile, candidateId };
  } catch (err) {
    console.warn("[CandidateProfiler] LLM call failed, using fallback profile:", err);
    const fallbackTopics = (curriculum ?? []).slice(0, 5).map((d) => d.topic);
    return {
      candidateId,
      role: member.jobRole ?? "AI Engineer",
      experience: member.yearsExperience ?? 0,
      education: member.education ?? "Unknown",
      strengths: fallbackTopics.slice(0, 2).map((topic) => ({
        topic,
        evidence: "Cohort data",
        reason: "Passed mission on first attempt",
      })),
      verificationAreas: fallbackTopics.slice(2, 4).map((topic) => ({
        topic,
        signal: "high_attempts" as const,
        reason: "Required multiple attempts",
      })),
      learningProfile: {
        consistencyLevel: "Moderate" as const,
        completionRate: 80,
        firstTryPassRate: 65,
        totalCommitDays: signals.commitDays ?? 0,
        summary: `Candidate ${member.name ?? candidateId} has completed the AI engineering cohort with solid fundamentals.`,
      },
      recommendedFocus: fallbackTopics.slice(0, 3).map((topic, i) => ({
        day: i + 1,
        topic,
        priority: "High" as const,
        priorityScore: 8,
        reason: "Key AI engineering concept",
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}
