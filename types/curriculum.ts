/**
 * types/curriculum.ts
 *
 * Curriculum structure contracts.
 *
 * Owner: Shared (types/ directory) - Member 2 (Data + RAG) updated
 */

// ---------------------------------------------------------------------------
// Curriculum Day
// ---------------------------------------------------------------------------

/**
 * A single day of the enterprise AI engineering curriculum.
 * Preserves day, title, topic, concepts, content, module, learningObjectives, tools.
 */
export interface CurriculumDay {
  /** Day number in the cohort (1-indexed) */
  day: number;
  /** High-level module or week grouping, e.g. "RAG Foundations" */
  module?: string;
  /** Specific topic covered on this day, e.g. "Vector Embeddings" */
  topic: string;
  /** Title of the curriculum day */
  title: string;
  /** Core concepts introduced or reinforced on this day */
  concepts: string[];
  /** Detailed content, overview, or summary text */
  content?: string | string[];
  /** Measurable outcomes the candidate should achieve by end of day */
  learningObjectives?: string[];
  /** Technologies, frameworks, or platforms used on this day */
  tools?: string[];
}

// ---------------------------------------------------------------------------
// Curriculum Index
// ---------------------------------------------------------------------------

/** The full curriculum, indexed by day number for O(1) lookup */
export type CurriculumIndex = Record<number, CurriculumDay>;
