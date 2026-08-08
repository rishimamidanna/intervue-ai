/**
 * server/curriculum-service.ts
 *
 * Curriculum Data Service
 *
 * Loads and indexes the hackathon curriculum JSON. Delegates validation
 * and normalization to the Data Loading Layer (lib/loaders/curriculum-loader).
 * Provides typed, O(1) lookup of curriculum days for AI modules and Interview Controller.
 *
 * Owner: Member 2 (Backend / API)
 */

import type { CurriculumDay, CurriculumIndex } from "@/types/curriculum";
import {
  loadCurriculum as loadCurriculumData,
  getCurriculumIndex as getIndexFromLoader,
  getCurriculumDay as getDayFromLoader,
} from "@/lib/loaders/curriculum-loader";

// ---------------------------------------------------------------------------
// Data Loading Cache
// ---------------------------------------------------------------------------

let _curriculumCache: CurriculumDay[] | null = null;

/**
 * Loads and returns the full curriculum as an ordered array of CurriculumDay objects.
 * Data is read and validated from data/curriculum.json.
 *
 * @returns Array of CurriculumDay objects
 * @throws {Error} If the data file cannot be loaded or is invalid
 */
export async function loadCurriculum(): Promise<CurriculumDay[]> {
  if (_curriculumCache) return _curriculumCache;

  const curriculumData = await loadCurriculumData();
  _curriculumCache = curriculumData.days;
  return _curriculumCache;
}

/**
 * Returns the curriculum indexed by day number for O(1) day lookups.
 *
 * @returns CurriculumIndex — Record<number, CurriculumDay>
 */
export async function getCurriculumIndex(): Promise<CurriculumIndex> {
  return getIndexFromLoader();
}

/**
 * Retrieves a single curriculum day by its day number.
 *
 * @param day - The day number (1–31)
 * @returns CurriculumDay or undefined if not found
 */
export async function getCurriculumDay(
  day: number
): Promise<CurriculumDay | undefined> {
  const result = await getDayFromLoader(day);
  return result ?? undefined;
}

/**
 * Clears the curriculum cache (useful for testing).
 */
export function clearCurriculumCache(): void {
  _curriculumCache = null;
}
