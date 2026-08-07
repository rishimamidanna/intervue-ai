/**
 * server/curriculum-service.ts
 *
 * Curriculum Data Service
 *
 * Loads and indexes the hackathon curriculum JSON. Provides typed, O(1)
 * lookup of curriculum days for use by the AI modules and Interview Controller.
 *
 * Owner: Member 2 (Backend / API)
 *
 * TODO: After receiving the official hackathon curriculum.json:
 *   1. Update CurriculumDay type in types/curriculum.ts to match actual schema
 *   2. Replace data/curriculum.json with the real curriculum data
 *   3. Add any curriculum-specific validation here
 */

import type { CurriculumDay, CurriculumIndex } from "@/types/curriculum";

// ---------------------------------------------------------------------------
// Data Loading
// ---------------------------------------------------------------------------

/**
 * Lazily loaded curriculum data.
 * Loaded once on first access and cached for the server process lifetime.
 *
 * TODO: In production, consider reloading on deployment without restarting.
 */
let _curriculumCache: CurriculumDay[] | null = null;

/**
 * Loads and returns the full curriculum as an ordered array.
 * Data is read from data/curriculum.json.
 *
 * @returns Array of CurriculumDay objects
 * @throws {Error} If the data file cannot be loaded or is invalid
 */
export async function loadCurriculum(): Promise<CurriculumDay[]> {
  if (_curriculumCache) return _curriculumCache;

  // TODO: Replace this dynamic import with the real data loading strategy.
  //   Options: fs.readFileSync, fetch from CDN, or database query.
  const raw = (await import("@/data/curriculum.json")).default as unknown;

  if (!Array.isArray(raw)) {
    throw new Error("curriculum.json must contain a JSON array");
  }

  _curriculumCache = raw as CurriculumDay[];
  return _curriculumCache;
}

/**
 * Returns the curriculum indexed by day number for O(1) day lookups.
 *
 * @returns CurriculumIndex — Record<number, CurriculumDay>
 */
export async function getCurriculumIndex(): Promise<CurriculumIndex> {
  const curriculum = await loadCurriculum();
  return curriculum.reduce<CurriculumIndex>((acc, day) => {
    acc[day.day] = day;
    return acc;
  }, {});
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
  const index = await getCurriculumIndex();
  return index[day];
}

/**
 * Clears the curriculum cache (useful for testing).
 */
export function clearCurriculumCache(): void {
  _curriculumCache = null;
}
