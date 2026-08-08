/**
 * types/curriculum.ts
 *
 * Curriculum structure contracts matching data/curriculum.json.
 *
 * Owner: Shared (types/ directory)
 */

export interface CurriculumModule {
  n: number;
  title: string;
  days: [number, number];
}

/**
 * A single day of the 31-day enterprise AI engineering cohort curriculum.
 */
export interface CurriculumDay {
  /** Day number in the cohort (1-indexed, range: 1–31) */
  day: number;
  /** Specific day title, e.g. "Embeddings Explained" */
  title: string;
  /** Day classification type, e.g. "SETUP", "BUILD", "AI_CORE", "SHIP_IT" */
  type: string;
  /** Technologies, frameworks, or platforms used on this day */
  tools: string[];
  /** Measurable learning objectives the candidate should achieve */
  objectives: string[];
  /** Optional module name mapping (computed/normalized helper property) */
  module?: string;
  /** Alias for title (backward-compatibility helper property) */
  topic?: string;
  /** Alias for objectives (backward-compatibility helper property) */
  learningObjectives?: string[];
  /** Core concepts introduced or reinforced on this day */
  concepts?: string[];
}

/**
 * Full curriculum data payload.
 */
export interface CurriculumData {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

/** The full 31-day curriculum, indexed by day number for O(1) lookup */
export type CurriculumIndex = Record<number, CurriculumDay>;
