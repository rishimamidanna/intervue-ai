/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * server/difficulty-engine.ts
 *
 * Dynamic Difficulty Engine (Milestone 7.20)
 *
 * Automatically adjusts the next question's difficulty level based on candidate
 * correctness score, answer confidence metrics, and tracked weak areas.
 *
 * Flow:
 *   Candidate Performance → Difficulty Analyzer → Next Difficulty Level
 *
 * Owner: Member 2 (Advanced RAG Intelligence)
 */

import type {
  CandidateAssessment,
  DifficultyDecision,
} from "@/types/rag";
import type { CandidateProfile, CandidateIntelligenceProfile } from "@/types/candidate";
import { DifficultyDecisionSchema } from "@/schemas/rag.schema";
import { strictValidate } from "@/lib/validation";

export class DynamicDifficultyEngine {
  // Threshold Constants (Configurable rules)
  private promoteScoreThreshold = 0.75;
  private promoteConfidenceThreshold = 0.75;
  private demoteScoreThreshold = 0.45;
  private demoteWeaknessCountThreshold = 2;

  /**
   * Adjusts thresholds if desired.
   */
  configureRules(rules: {
    promoteScore?: number;
    promoteConfidence?: number;
    demoteScore?: number;
    demoteWeaknesses?: number;
  }): void {
    if (rules.promoteScore !== undefined) this.promoteScoreThreshold = rules.promoteScore;
    if (rules.promoteConfidence !== undefined) this.promoteConfidenceThreshold = rules.promoteConfidence;
    if (rules.demoteScore !== undefined) this.demoteScoreThreshold = rules.demoteScore;
    if (rules.demoteWeaknesses !== undefined) this.demoteWeaknessCountThreshold = rules.demoteWeaknesses;
  }

  /**
   * Determines next difficulty level from current level and candidate performance.
   *
   * @param currentLevel - Active difficulty level (Beginner/Intermediate/Advanced or easy/medium/hard)
   * @param performance - Assessment of candidate response correctness & confidence
   * @returns DifficultyDecision
   */
  analyzeDifficulty(
    currentLevel: string,
    performance: CandidateAssessment
  ): DifficultyDecision {
    const normalized = currentLevel.trim().toLowerCase();
    let nextLevel = currentLevel;
    let reasoning = "Satisfactory performance. Consolidating knowledge at current difficulty level before progressing.";

    const isPromote =
      performance.score >= this.promoteScoreThreshold &&
      performance.confidence >= this.promoteConfidenceThreshold;

    const weaknessCount = performance.weaknessesTracked?.length || 0;
    const isDemote =
      performance.score < this.demoteScoreThreshold ||
      weaknessCount >= this.demoteWeaknessCountThreshold;

    if (isPromote) {
      if (normalized === "easy") {
        nextLevel = "medium";
      } else if (normalized === "medium") {
        nextLevel = "hard";
      } else if (normalized === "beginner") {
        nextLevel = "Intermediate";
      } else if (normalized === "intermediate") {
        nextLevel = "Advanced";
      }
      reasoning = "Strong understanding demonstrated with high correctness score and confidence. Promoting to next challenge tier.";
    } else if (isDemote) {
      if (normalized === "hard") {
        nextLevel = "medium";
      } else if (normalized === "medium") {
        nextLevel = "easy";
      } else if (normalized === "advanced") {
        nextLevel = "Intermediate";
      } else if (normalized === "intermediate") {
        nextLevel = "Beginner";
      }
      reasoning = `Struggled with the concepts (score: ${performance.score}, weaknesses: ${weaknessCount}). Adjusting difficulty down for reinforcement.`;
    }

    const decision: DifficultyDecision = {
      currentLevel,
      nextLevel,
      reasoning,
    };

    return strictValidate(
      DifficultyDecisionSchema,
      decision,
      "Difficulty Decision"
    );
  }

  /**
   * Evaluates candidate assessment, updates candidate profile's active level,
   * and returns the decision.
   *
   * @param candidateProfile - Target candidate profile
   * @param performance - Active performance metrics
   * @returns Object containing the difficulty decision and updated candidate profile
   */
  evaluateAndUpdateProfile(
    candidateProfile: CandidateProfile | CandidateIntelligenceProfile,
    performance: CandidateAssessment
  ): { decision: DifficultyDecision; updatedProfile: CandidateProfile | CandidateIntelligenceProfile } {
    const rawProfile = candidateProfile as Record<string, any>;
    const currentLevel = rawProfile.experienceLevel || rawProfile.level || "Intermediate";

    const decision = this.analyzeDifficulty(currentLevel, performance);

    const updatedProfile = {
      ...candidateProfile,
    } as Record<string, any>;

    if (updatedProfile.experienceLevel !== undefined) {
      updatedProfile.experienceLevel = decision.nextLevel;
    }
    if (updatedProfile.level !== undefined) {
      updatedProfile.level = decision.nextLevel;
    }

    // Accumulate weaknesses if present
    if (performance.weaknessesTracked && performance.weaknessesTracked.length > 0) {
      const existingWeak = Array.isArray(updatedProfile.weakAreas) ? updatedProfile.weakAreas : [];
      const newWeak = Array.from(new Set([...existingWeak, ...performance.weaknessesTracked]));
      updatedProfile.weakAreas = newWeak;
    }

    return {
      decision,
      updatedProfile: updatedProfile as CandidateProfile | CandidateIntelligenceProfile,
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const defaultDifficultyEngine = new DynamicDifficultyEngine();
