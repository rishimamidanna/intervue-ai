/**
 * types/feedback.ts
 *
 * Final feedback and report contracts. These types represent the structured
 * output produced by the Feedback Engine at the end of an interview session.
 *
 * Owner: Shared (types/ directory)
 */

import type { TopicKnowledge } from "./interview";

// ---------------------------------------------------------------------------
// Report Sub-Sections
// ---------------------------------------------------------------------------

/** A demonstrated strength with supporting evidence */
export interface StrengthEntry {
  /** Topic or concept where strength was demonstrated */
  topic: string;
  /** Human-readable description of the demonstrated strength */
  description: string;
  /** Specific answer quotes or behaviors that support this assessment */
  evidence: string[];
}

/** A knowledge gap that requires further study */
export interface GapEntry {
  /** Topic or concept where the gap was identified */
  topic: string;
  /** Human-readable description of the gap */
  description: string;
  /** Specific misconceptions or missing concepts that reveal the gap */
  evidence: string[];
  /** Curriculum day(s) to revisit */
  curriculumDays: number[];
}

/** A single actionable item in the candidate's recovery plan */
export interface RecoveryItem {
  /** Prioritized order (1 = highest priority) */
  priority: number;
  /** Topic to address */
  topic: string;
  /** Specific recommended action */
  action: string;
  /** Resources or curriculum references to consult */
  resources: string[];
}

// ---------------------------------------------------------------------------
// Final Feedback
// ---------------------------------------------------------------------------

/**
 * The complete structured feedback report generated at the end of
 * an INTERVUE session. This is the "Interview DNA" output.
 */
export interface FinalFeedback {
  /** Session this feedback corresponds to */
  sessionId: string;
  /** Candidate this feedback targets */
  candidateId: string;
  /** ISO 8601 timestamp of report generation */
  generatedAt: string;
  /**
   * Overall composite score (0–100).
   * Calculated deterministically from weighted evaluation dimensions.
   * See lib/scoring.ts for the formula.
   */
  overallScore: number;
  /** Narrative summary of the candidate's interview performance */
  summary: string;
  /** Demonstrated areas of strength */
  strengths: StrengthEntry[];
  /** Identified knowledge gaps */
  gaps: GapEntry[];
  /** Final state of the Candidate Knowledge Twin */
  knowledgeTwin: TopicKnowledge[];
  /** Prioritized recovery plan */
  recoveryPlan: RecoveryItem[];
  /** Curriculum days covered during the interview */
  daysCovered: number[];
  /** Total questions asked */
  totalQuestions: number;
}
