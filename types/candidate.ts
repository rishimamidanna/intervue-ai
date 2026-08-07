/**
 * types/candidate.ts
 *
 * Candidate profile contracts matching the official hackathon Candidate Profile schema.
 *
 * Owner: Shared (types/ directory)
 */

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
