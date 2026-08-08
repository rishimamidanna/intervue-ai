/**
 * types/candidate.ts
 *
 * Candidate profile contracts matching the official hackathon Candidate Profile schema
 * and Candidate Intelligence Analyzer output.
 *
 * Owner: Shared (types/ directory)
 */

import type { TopicKnowledge } from "./interview";

export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface CandidateMission {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

/**
 * Official CandidateProfile structure from hackathon specification.
 */
export interface CandidateProfile {
  member: CandidateMember;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

/**
 * Top-level JSON container format for data/candidates.json.
 */
export interface CandidatesData {
  candidates: CandidateProfile[];
}

/**
 * Skill coverage metrics computed by Candidate Intelligence Analyzer.
 */
export interface SkillCoverage {
  totalMissions: number;
  completedMissions: number;
  passedMissions: number;
  firstTryPasses: number;
  skippedMissions: number;
  completionRate: number;
  passRate: number;
}

/**
 * The structured intelligence profile produced by the Candidate Intelligence Analyzer.
 * Seeds the Candidate Knowledge Twin and Interview Strategy.
 */
export interface CandidateIntelligenceProfile {
  candidateId: string;
  candidateName: string;
  jobRole: string;
  yearsExperience: number;
  strengths: string[];
  weaknesses: string[];
  completedTopics: string[];
  missingTopics: string[];
  skillCoverage: SkillCoverage;
  recommendedFocusAreas: string[];
  expectedDepthFactor: number;
  profileSummary: string;

  // Initial knowledge signals for Knowledge Twin & Interview Planner
  initialKnowledgeEstimates: TopicKnowledge[];
  priorityTopics: string[];
  weaknessSignals: string[];
  strengthSignals: string[];
}
