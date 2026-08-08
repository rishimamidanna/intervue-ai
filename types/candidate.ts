/**
 * types/candidate.ts
 *
 * Candidate profile & candidate intelligence contracts.
 *
 * Owner: Shared (types/ directory) - Member 2 (Data + RAG) updated
 */

export interface CandidateMission {
  day: number;
  title: string;
  attempts?: number;
  /** Whether candidate passed the mission test (passed=false != skipped=true) */
  passed?: boolean;
  /** Whether candidate skipped the mission */
  skipped?: boolean;
}

export interface CandidateSignals {
  commitDays?: number;
  missionsCompleted?: number;
  missionsFirstTry?: number;
  [key: string]: unknown;
}

export interface CandidateMember {
  id: string;
  name?: string;
  jobRole: string;
  yearsExperience: number;
  education?: string;
  status?: string;
}

/**
 * CandidateProfile structure matching Milestone 1 specifications.
 */
export interface CandidateProfile {
  id?: string;
  role?: string;
  experience?: number;
  missions: CandidateMission[];
  attempts?: number;
  passed?: boolean;
  skipped?: boolean;
  signals?: CandidateSignals;
  member?: CandidateMember;
}

// ---------------------------------------------------------------------------
// Candidate Intelligence Engine Types (Milestone 2)
// ---------------------------------------------------------------------------

export interface CandidateStrength {
  topic: string;
  day?: number;
  evidence: string;
  reason: string;
}

export type VerificationSignal =
  | "failed_mission"
  | "skipped_topic"
  | "high_attempts"
  | "incomplete_evidence";

export interface VerificationArea {
  topic: string;
  day?: number;
  signal: VerificationSignal;
  reason: string;
}

export interface LearningProfile {
  consistencyLevel: "High" | "Moderate" | "Low";
  completionRate: number; // 0-100 percentage
  firstTryPassRate: number; // 0-100 percentage
  totalCommitDays: number;
  summary: string;
}

export interface RecommendedFocusTopic {
  day: number;
  topic: string;
  priority: "High" | "Medium" | "Low";
  priorityScore: number;
  reason: string;
}

/**
 * Structured Candidate Intelligence Profile produced by Candidate Intelligence Engine.
 */
export interface CandidateIntelligenceProfile {
  candidateId: string;
  role: string;
  experience: number;
  education: string;
  strengths: CandidateStrength[];
  verificationAreas: VerificationArea[];
  learningProfile: LearningProfile;
  recommendedFocus: RecommendedFocusTopic[];
  generatedAt: string;
}
