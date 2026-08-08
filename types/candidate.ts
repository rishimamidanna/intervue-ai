/**
 * types/candidate.ts
 *
 * Candidate profile contracts matching the official hackathon Candidate Profile schema,
 * Candidate Intelligence Analyzer output, and RAG Context Builder output (Milestone 1.5).
 *
 * Owner: Shared (types/ directory)
 */

import type { TopicKnowledge } from "./interview";
import type { CurriculumKnowledgeUnit } from "./curriculum";

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

/**
 * Structured RAG Interview Context produced by RAG Context Builder (Milestone 1.5).
 * Combines candidate intelligence and retrieved curriculum knowledge into an AI-ready context.
 */
export interface StructuredInterviewContext {
  /** Candidate identifier */
  candidateId: string;
  /** Human-readable narrative summary of candidate profile */
  candidateSummary: string;
  /** Identified candidate strengths */
  strengths: string[];
  /** Identified candidate weaknesses and gaps */
  weaknesses: string[];
  /** Relevant curriculum topics retrieved */
  relevantTopics: string[];
  /** Core concepts to evaluate in the interview */
  conceptsToEvaluate: string[];
  /** Alias for conceptsToEvaluate (matching milestone example) */
  relevantConcepts: string[];
  /** Primary focus areas for the interview session */
  focusAreas: string[];
  /** Alias for focusAreas (recommended interview focus) */
  recommendedInterviewFocus: string[];
  /** Array of retrieved CurriculumKnowledgeUnit objects (RAG context) */
  retrievedKnowledge: CurriculumKnowledgeUnit[];
  /** Overall relevance confidence score (0.00 to 1.00) */
  relevanceScore: number;
  /** Pre-formatted structured prompt text ready for AI question generation */
  formattedPromptContext: string;
}
