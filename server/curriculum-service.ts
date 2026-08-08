/**
 * server/curriculum-service.ts
 *
 * Curriculum Data Service & Curriculum Normalizer (Milestone 3.1)
 *
 * Loads, validates, indexes, and normalizes the hackathon curriculum JSON.
 * Provides typed, O(1) lookup of curriculum days and normalized document representations
 * prepared for future RAG / indexing.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  CurriculumDay,
  CurriculumIndex,
  NormalizedCurriculumItem,
  NormalizedCurriculumIndex,
} from "@/types/curriculum";
import {
  CurriculumArraySchema,
  NormalizedCurriculumItemSchema,
} from "@/schemas/curriculum.schema";
import { safeValidate, strictValidate } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Data Loading & Caching
// ---------------------------------------------------------------------------

let _curriculumCache: CurriculumDay[] | null = null;
let _normalizedCache: NormalizedCurriculumItem[] | null = null;

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
 * Returns the raw curriculum indexed by day number for O(1) day lookups.
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
 * Retrieves a single raw curriculum day by its day number.
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

// ---------------------------------------------------------------------------
// Curriculum Normalization (Milestone 3.1)
// ---------------------------------------------------------------------------

/**
 * Deterministically normalizes a raw CurriculumDay item into a uniform
 * NormalizedCurriculumItem representation ready for downstream RAG.
 *
 * @param item - Raw CurriculumDay object
 * @returns NormalizedCurriculumItem
 */
export function normalizeCurriculumDay(
  item: CurriculumDay
): NormalizedCurriculumItem {
  const dayStr = String(item.day).padStart(2, "0");
  const id = `curriculum-day-${dayStr}`;

  const topic = item.topic.trim();
  const title = item.title.trim();
  const moduleName = item.module?.trim() || "General AI Engineering";

  const concepts = Array.from(
    new Set(item.concepts.map((c) => c.trim()).filter(Boolean))
  );

  let contentText = "";
  if (Array.isArray(item.content)) {
    contentText = item.content.map((c) => c.trim()).filter(Boolean).join("\n\n");
  } else if (typeof item.content === "string") {
    contentText = item.content.trim();
  }

  if (!contentText) {
    contentText = `${title}. Topic: ${topic}. Module: ${moduleName}. Concepts covered: ${concepts.join(", ")}.`;
  }

  const learningObjectives = Array.from(
    new Set((item.learningObjectives || []).map((o) => o.trim()).filter(Boolean))
  );

  const tools = Array.from(
    new Set((item.tools || []).map((t) => t.trim()).filter(Boolean))
  );

  const sourceRef = {
    file: "curriculum.json",
    day: item.day,
    uri: `data/curriculum.json#day=${item.day}`,
  };

  const metadata = {
    day: item.day,
    topic,
    title,
    module: moduleName,
    conceptCount: concepts.length,
    toolsCount: tools.length,
    objectivesCount: learningObjectives.length,
  };

  const rawNormalized: NormalizedCurriculumItem = {
    id,
    day: item.day,
    module: moduleName,
    topic,
    title,
    concepts,
    content: contentText,
    learningObjectives,
    tools,
    sourceRef,
    metadata,
  };

  return strictValidate(
    NormalizedCurriculumItemSchema,
    rawNormalized,
    `Normalized Curriculum Day ${item.day}`
  );
}

/**
 * Loads, validates, and normalizes the full curriculum.
 * Output is cached in memory.
 *
 * @returns Array of NormalizedCurriculumItem objects
 */
export async function loadNormalizedCurriculum(): Promise<
  NormalizedCurriculumItem[]
> {
  if (_normalizedCache) return _normalizedCache;

  const rawCurriculum = await loadCurriculum();
  _normalizedCache = rawCurriculum.map((item) => normalizeCurriculumDay(item));
  return _normalizedCache;
}

/**
 * Returns the normalized curriculum indexed by day number.
 *
 * @returns NormalizedCurriculumIndex
 */
export async function getNormalizedCurriculumIndex(): Promise<
  NormalizedCurriculumIndex
> {
  const normalized = await loadNormalizedCurriculum();
  return normalized.reduce<NormalizedCurriculumIndex>((acc, item) => {
    acc[item.day] = item;
    return acc;
  }, {});
}

/**
 * Retrieves a single normalized curriculum document by day number.
 *
 * @param day - The day number (1-indexed)
 * @returns NormalizedCurriculumItem or undefined if not found
 */
export async function getNormalizedCurriculumDay(
  day: number
): Promise<NormalizedCurriculumItem | undefined> {
  const index = await getNormalizedCurriculumIndex();
  return index[day];
}

/**
 * Clears curriculum caches (useful for testing or dynamic reloads).
 */
export function clearCurriculumCache(): void {
  _curriculumCache = null;
  _normalizedCache = null;
}
