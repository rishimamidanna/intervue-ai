/**
 * server/candidate-intelligence.ts
 *
 * Candidate Intelligence Engine (Milestone 2)
 *
 * Converts candidate history into a structured, explainable intelligence profile
 * for adaptive technical interviews.
 *
 * Rules:
 *   - Passed mission does NOT automatically imply mastery (retries require verification).
 *   - Mission data is prior evidence, not final evaluation.
 *   - Explainability: every recommendation, strength, and verification area has a reason.
 *   - Deterministic execution: pure rule-based logic without LLMs or vector databases.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  CandidateProfile,
  CandidateStrength,
  VerificationArea,
  LearningProfile,
  RecommendedFocusTopic,
  CandidateIntelligenceProfile,
} from "@/types/candidate";
import type { CurriculumDay } from "@/types/curriculum";
import { CandidateIntelligenceProfileSchema } from "@/schemas/candidate-intelligence.schema";
import { strictValidate } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Candidate Intelligence Analyzer
// ---------------------------------------------------------------------------

/**
 * Analyzes candidate history and cohort activity to produce a structured
 * Candidate Intelligence Profile.
 *
 * @param candidate - CandidateProfile object loaded from Candidate Service
 * @param curriculum - Optional CurriculumDay array for cross-topic context
 * @returns CandidateIntelligenceProfile
 */
export function analyzeCandidateIntelligence(
  candidate: CandidateProfile,
  curriculum?: CurriculumDay[]
): CandidateIntelligenceProfile {
  const candidateId = candidate.id ?? candidate.member?.id ?? "unknown";
  const role = candidate.role ?? candidate.member?.jobRole ?? "Software Engineer";
  const experience = candidate.experience ?? candidate.member?.yearsExperience ?? 0;
  const education = candidate.member?.education ?? "Not Specified";

  const commitDays = candidate.signals?.commitDays ?? 0;
  const missionsCompleted = candidate.signals?.missionsCompleted ?? 0;
  const missionsFirstTry = candidate.signals?.missionsFirstTry ?? 0;

  // Curriculum topic mapping helper
  const curriculumMap = new Map<number, CurriculumDay>();
  if (curriculum) {
    for (const dayItem of curriculum) {
      curriculumMap.set(dayItem.day, dayItem);
    }
  }

  const strengths: CandidateStrength[] = [];
  const verificationAreas: VerificationArea[] = [];
  const recommendedFocus: RecommendedFocusTopic[] = [];

  // 1. Analyze Missions
  for (const mission of candidate.missions) {
    const day = mission.day;
    const currDay = curriculumMap.get(day);
    const topicName = currDay?.topic ?? mission.title;
    const attempts = mission.attempts ?? 0;
    const passed = mission.passed === true;
    const skipped = mission.skipped === true;

    if (passed && attempts <= 1) {
      // First-try pass -> Strength
      strengths.push({
        topic: topicName,
        day,
        evidence: `Passed mission on initial attempt (${attempts} attempt)`,
        reason: `Demonstrated solid prior understanding on day ${day} (${topicName}) by completing the mission on the first try.`,
      });

      // Low priority focus recommendation
      recommendedFocus.push({
        day,
        topic: topicName,
        priority: "Low",
        priorityScore: 30,
        reason: `Candidate passed ${topicName} on the first try; lower interview priority, candidate can be tested on advanced edge cases if time permits.`,
      });
    } else if (passed && attempts > 1) {
      // Passed with retries -> Verification Area (NOT assumed mastery)
      verificationAreas.push({
        topic: topicName,
        day,
        signal: "high_attempts",
        reason: `Passed mission after ${attempts} attempts. Prior retries suggest potential trial-and-error solution; live verification needed to confirm conceptual depth.`,
      });

      const priorityScore = 60 + Math.min(attempts * 2, 10);
      recommendedFocus.push({
        day,
        topic: topicName,
        priority: "Medium",
        priorityScore,
        reason: `Retried ${attempts} times before passing ${topicName}; interview should verify fundamental understanding versus superficial completion.`,
      });
    } else if (!passed && !skipped) {
      // Attempted & Failed -> Verification Area & High Priority Focus
      verificationAreas.push({
        topic: topicName,
        day,
        signal: "failed_mission",
        reason: `Attempted mission ${attempts} time(s) but failed to pass. Represents a direct documented knowledge gap requiring targeted evaluation.`,
      });

      const priorityScore = 90 + Math.min(attempts * 2, 10);
      recommendedFocus.push({
        day,
        topic: topicName,
        priority: "High",
        priorityScore,
        reason: `Unresolved failure on ${topicName} after ${attempts} attempt(s); primary candidate weakness area to probe during the interview.`,
      });
    } else if (!passed && skipped) {
      // Skipped Mission -> Verification Area & High Priority Focus
      verificationAreas.push({
        topic: topicName,
        day,
        signal: "skipped_topic",
        reason: `Candidate skipped this mission entirely. No prior learning evidence exists for ${topicName}; live verification required.`,
      });

      recommendedFocus.push({
        day,
        topic: topicName,
        priority: "High",
        priorityScore: 85,
        reason: `Skipped mission for ${topicName}; unevidenced topic requires live baseline questioning.`,
      });
    }
  }

  // 2. Analyze Profile Background Signals
  if (experience >= 5) {
    strengths.push({
      topic: `Senior Background (${role})`,
      evidence: `${experience} years of industry experience`,
      reason: `Senior profile background (${experience} years) indicates strong baseline engineering experience.`,
    });
  }

  if (commitDays >= 14) {
    strengths.push({
      topic: "Consistent Cohort Engagement",
      evidence: `${commitDays} active commit days`,
      reason: `Demonstrated sustained commitment across ${commitDays} cohort active days.`,
    });
  } else if (commitDays < 5 && candidate.missions.length > 0) {
    verificationAreas.push({
      topic: "Cohort Consistency",
      signal: "incomplete_evidence",
      reason: `Limited active commit days (${commitDays} days) provides sparse ongoing engagement evidence.`,
    });
  }

  // 3. Synthesize Learning Profile
  const totalMissions = candidate.missions.length;
  const completionRate =
    totalMissions > 0 ? Math.round((missionsCompleted / totalMissions) * 100) : 0;
  const firstTryPassRate =
    totalMissions > 0 ? Math.round((missionsFirstTry / totalMissions) * 100) : 0;

  let consistencyLevel: "High" | "Moderate" | "Low" = "Low";
  if (commitDays >= 14 && completionRate >= 75) {
    consistencyLevel = "High";
  } else if (commitDays >= 7 && completionRate >= 50) {
    consistencyLevel = "Moderate";
  }

  const learningProfile: LearningProfile = {
    consistencyLevel,
    completionRate,
    firstTryPassRate,
    totalCommitDays: commitDays,
    summary: `Candidate maintains a ${consistencyLevel.toLowerCase()} learning consistency level (${commitDays} commit days). Mission completion rate is ${completionRate}% with a ${firstTryPassRate}% first-try pass rate across ${totalMissions} tracked curriculum missions.`,
  };

  // 4. Deterministic Ranking of Recommended Focus Topics
  // Sort by priorityScore descending, with deterministic tie-breaking by day ascending
  recommendedFocus.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return a.day - b.day;
  });

  const rawProfile: CandidateIntelligenceProfile = {
    candidateId,
    role,
    experience,
    education,
    strengths,
    verificationAreas,
    learningProfile,
    recommendedFocus,
    generatedAt: new Date().toISOString(),
  };

  // Validate output object against Zod schema to guarantee contract
  return strictValidate(
    CandidateIntelligenceProfileSchema,
    rawProfile,
    "Candidate Intelligence Profile"
  );
}
