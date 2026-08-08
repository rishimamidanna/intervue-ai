/**
 * types/curriculum.ts
 *
 * Curriculum structure & normalized curriculum contracts.
 *
 * Owner: Shared (types/ directory) - Member 2 (Data + RAG) updated
 */

// ---------------------------------------------------------------------------
// Raw Curriculum Day
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

/** The full curriculum, indexed by day number for O(1) lookup */
export type CurriculumIndex = Record<number, CurriculumDay>;

// ---------------------------------------------------------------------------
// Normalized Curriculum Document (Milestone 3.1)
// ---------------------------------------------------------------------------

export interface CurriculumSourceRef {
  file: string;
  day: number;
  uri: string;
}

export interface CurriculumMetadata {
  day: number;
  topic: string;
  title: string;
  module: string;
  conceptCount: number;
  toolsCount: number;
  objectivesCount: number;
  [key: string]: unknown;
}

/**
 * Normalized curriculum document representation prepared for future RAG / indexing.
 */
export interface NormalizedCurriculumItem {
  id: string;
  day: number;
  module: string;
  topic: string;
  title: string;
  concepts: string[];
  content: string;
  learningObjectives: string[];
  tools: string[];
  sourceRef: CurriculumSourceRef;
  metadata: CurriculumMetadata;
}

export type NormalizedCurriculumIndex = Record<number, NormalizedCurriculumItem>;
