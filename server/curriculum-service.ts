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

  // The real curriculum.json is an object { cohort, modules, days: [...] }
  // Each day uses `title` and `objectives` instead of `topic` and `learningObjectives`
  const raw = (await import("@/data/curriculum.json")).default as unknown;

  // Handle both array format (scaffold) and real object format
  let days: Record<string, unknown>[];
  if (Array.isArray(raw)) {
    days = raw as Record<string, unknown>[];
  } else if (raw && typeof raw === "object" && "days" in raw) {
    days = (raw as { days: Record<string, unknown>[] }).days;
  } else {
    throw new Error("curriculum.json must contain a JSON array or an object with a 'days' array");
  }

  // Normalize field names to match CurriculumDay type
  _curriculumCache = days.map((d) => ({
    day: d.day as number,
    module: (d.module ?? d.type ?? "") as string,
    // Real JSON uses 'title', type uses 'topic' — support both
    topic: (d.topic ?? d.title ?? `Day ${d.day}`) as string,
    // Real JSON uses 'objectives', type uses 'learningObjectives' — support both
    learningObjectives: (d.learningObjectives ?? d.objectives ?? []) as string[],
    tools: (d.tools ?? []) as string[],
    concepts: (d.concepts ?? []) as string[],
  })) as CurriculumDay[];

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

// ---------------------------------------------------------------------------
// Retrieval Layer
// ---------------------------------------------------------------------------

export interface RetrievedCurriculumContext {
  relevantTopic: string;
  learningObjectives: string[];
  keyConcepts: string[];
  relatedConcepts: string[];
  difficultyContext: string;
  matchedDays: CurriculumDay[];
}

/**
 * Retrieves relevant curriculum concepts, objectives, and related topics
 * based on candidate state (topic, knowledge gaps, difficulty).
 *
 * @param queryTopic - Target curriculum topic
 * @param gaps - List of candidate knowledge gaps
 * @param currentDifficulty - Current difficulty level (1–5 or 1–10)
 * @param curriculumDays - Loaded curriculum days array
 * @returns Structured RetrievedCurriculumContext
 */
export function retrieveCurriculumContext(
  queryTopic: string,
  gaps: string[] = [],
  currentDifficulty: number = 3,
  curriculumDays: CurriculumDay[] = []
): RetrievedCurriculumContext {
  const cleanQuery = `${queryTopic} ${gaps.join(" ")}`.toLowerCase();
  const searchTerms = cleanQuery
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const scoredDays = curriculumDays.map((day) => {
    let score = 0;
    const dayText = `${day.topic} ${(day.concepts ?? []).join(" ")} ${(day.learningObjectives ?? []).join(" ")} ${(day.tools ?? []).join(" ")}`.toLowerCase();

    // Direct topic match
    if (
      day.topic.toLowerCase().includes(queryTopic.toLowerCase()) ||
      queryTopic.toLowerCase().includes(day.topic.toLowerCase())
    ) {
      score += 15;
    }

    // Gap match
    for (const gap of gaps) {
      if (dayText.includes(gap.toLowerCase())) {
        score += 10;
      }
    }

    // Search terms overlap
    for (const term of searchTerms) {
      if (dayText.includes(term)) {
        score += 2;
      }
    }

    return { day, score };
  });

  scoredDays.sort((a, b) => b.score - a.score);
  const primaryDay = scoredDays[0]?.day || curriculumDays[0];
  const topMatchedDays = scoredDays.slice(0, 3).map((sd) => sd.day);

  // Gather primary & related concepts
  const keyConcepts = primaryDay?.concepts ?? [];
  const relatedConcepts = Array.from(
    new Set(
      topMatchedDays
        .flatMap((d) => d.concepts)
        .filter((c) => !keyConcepts.includes(c))
    )
  ).slice(0, 6);

  const difficultyContext =
    currentDifficulty >= 4
      ? "Advanced system design, edge cases, trade-offs, and optimization strategies"
      : currentDifficulty >= 3
      ? "Practical implementation, application scenarios, and standard patterns"
      : "Foundational definitions, core concepts, and basic mechanics";

  return {
    relevantTopic: primaryDay?.topic ?? queryTopic,
    learningObjectives: primaryDay?.learningObjectives ?? [],
    keyConcepts,
    relatedConcepts,
    difficultyContext,
    matchedDays: topMatchedDays,
  };
}

/**
 * Clears the curriculum cache (useful for testing).
 */
export function clearCurriculumCache(): void {
  _curriculumCache = null;
}
