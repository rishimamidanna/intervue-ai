/**
 * types/curriculum.ts
 *
 * Curriculum structure contracts.
 *
 * IMPORTANT: These types are preliminary scaffolds based on the expected
 * structure of the hackathon curriculum JSON. They MUST be reviewed and
 * adapted after inspecting the actual curriculum.json file supplied during
 * the hackathon. Field names, nesting, and enumerated values may differ.
 *
 * Owner: Shared (types/ directory)
 */

// ---------------------------------------------------------------------------
// Curriculum Day
// ---------------------------------------------------------------------------

/**
 * A single day of the 31-day enterprise AI engineering cohort curriculum.
 *
 * NOTE TO TEAM: This is a placeholder scaffold. After receiving the official
 * hackathon curriculum file, verify field names against the actual JSON
 * structure. The real curriculum may include additional fields (e.g. labs,
 * assessments, pre-requisites) that should be added here.
 */
export interface CurriculumDay {
  /** Day number in the cohort (1-indexed, range: 1–31) */
  day: number;
  /** High-level module or week grouping, e.g. "RAG Foundations" */
  module: string;
  /** Specific topic covered on this day, e.g. "Vector Embeddings" */
  topic: string;
  /** Measurable outcomes the candidate should achieve by end of day */
  learningObjectives: string[];
  /** Technologies, frameworks, or platforms used on this day */
  tools: string[];
  /** Core concepts introduced or reinforced on this day */
  concepts: string[];
}

// ---------------------------------------------------------------------------
// Curriculum Index
// ---------------------------------------------------------------------------

/** The full 31-day curriculum, indexed by day number for O(1) lookup */
export type CurriculumIndex = Record<number, CurriculumDay>;
