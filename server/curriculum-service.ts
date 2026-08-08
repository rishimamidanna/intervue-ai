/**
 * server/curriculum-service.ts
 *
 * Curriculum Data Service
 *
 * Loads, validates, and indexes the hackathon curriculum JSON.
 * Provides typed, O(1) lookup of curriculum days.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type { CurriculumDay, CurriculumIndex } from "@/types/curriculum";
import { CurriculumArraySchema } from "@/schemas/curriculum.schema";
import { safeValidate } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Data Loading & Caching
// ---------------------------------------------------------------------------

let _curriculumCache: CurriculumDay[] | null = null;

/**
 * Loads and validates the full curriculum as an ordered array.
 * Data is read from data/curriculum.json.
 *
 * @returns Array of CurriculumDay objects
 * @throws {Error} If the data file cannot be loaded or fails schema validation
 */
export async function loadCurriculum(): Promise<CurriculumDay[]> {
  if (_curriculumCache) return _curriculumCache;

  let raw: unknown;
  try {
    raw = (await import("@/data/curriculum.json")).default;
  } catch (err) {
    throw new Error(
      `Failed to load curriculum.json: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const result = safeValidate(CurriculumArraySchema, raw);
  if (!result.success) {
    throw new Error(
      `Curriculum data validation failed:\n${result.errors.join("\n")}`
    );
  }

  _curriculumCache = result.data as CurriculumDay[];
  return _curriculumCache;
}

/**
 * Returns the curriculum indexed by day number for O(1) day lookups.
 *
 * @returns CurriculumIndex — Record<number, CurriculumDay>
 */
export async function getCurriculumIndex(): Promise<CurriculumIndex> {
  const curriculum = await loadCurriculum();
  return curriculum.reduce<CurriculumIndex>((acc, dayItem) => {
    acc[dayItem.day] = dayItem;
    return acc;
  }, {});
}

/**
 * Retrieves a single curriculum day by its day number.
 *
 * @param day - The day number (1-indexed)
 * @returns CurriculumDay or undefined if not found
 */
export async function getCurriculumDay(
  day: number
): Promise<CurriculumDay | undefined> {
  const index = await getCurriculumIndex();
  return index[day];
}

/**
 * Clears the curriculum cache (useful for testing or dynamic reloads).
 */
export function clearCurriculumCache(): void {
  _curriculumCache = null;
}
