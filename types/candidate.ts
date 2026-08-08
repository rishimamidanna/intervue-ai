/**
 * types/candidate.ts
 *
 * Candidate profile contracts matching candidate data requirements.
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
 * Official CandidateProfile structure.
 * Preserves required fields: id, role, experience, missions, attempts, passed, skipped, signals, member.
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
