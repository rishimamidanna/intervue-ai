/**
 * server/curriculum-service.ts
 *
 * Curriculum Data Service, Normalizer, Concept Extractor & Concept Enricher (Milestone 3.1, 3.2 & 3.3)
 *
 * Loads, validates, indexes, normalizes, extracts, and enriches concepts from the hackathon curriculum JSON.
 * Provides typed, O(1) lookups for raw curriculum, normalized curriculum documents, extracted concepts,
 * and retrieval-ready enriched concepts.
 *
 * Owner: Member 2 (Data + RAG)
 */

import type {
  CurriculumDay,
  CurriculumIndex,
  NormalizedCurriculumItem,
  NormalizedCurriculumIndex,
  CurriculumConcept,
  EnrichedCurriculumConcept,
  ConceptDifficultyLevel,
} from "@/types/curriculum";
import {
  CurriculumArraySchema,
  NormalizedCurriculumItemSchema,
  CurriculumConceptSchema,
  EnrichedCurriculumConceptSchema,
} from "@/schemas/curriculum.schema";
import { safeValidate, strictValidate } from "@/lib/validation";

// ---------------------------------------------------------------------------
// Data Loading & Caching
// ---------------------------------------------------------------------------

let _curriculumCache: CurriculumDay[] | null = null;
let _normalizedCache: NormalizedCurriculumItem[] | null = null;
let _extractedConceptsCache: CurriculumConcept[] | null = null;
let _enrichedConceptsCache: EnrichedCurriculumConcept[] | null = null;

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

  const dataToValidate = (raw as Record<string, unknown>).days ?? raw;
  const result = safeValidate(CurriculumArraySchema, dataToValidate);
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
 */
export function retrieveCurriculumContext(
  queryTopic: string,
  gaps: string[] = [],
  currentDifficulty: number = 3,
  curriculumDays: CurriculumDay[] = []
): RetrievedCurriculumContext {
  const cleanQuery = `${queryTopic} ${gaps.join(" ")}`.toLowerCase();
  const searchTerms = cleanQuery.split(/\s+/).filter((t) => t.length > 2);

  const scoredDays = curriculumDays.map((day) => {
    let score = 0;
    const dayText = `${day.topic} ${(day.concepts ?? []).join(" ")} ${(day.learningObjectives ?? []).join(" ")} ${(day.tools ?? []).join(" ")}`.toLowerCase();

    if (
      day.topic.toLowerCase().includes(queryTopic.toLowerCase()) ||
      queryTopic.toLowerCase().includes(day.topic.toLowerCase())
    ) {
      score += 15;
    }
    for (const gap of gaps) {
      if (dayText.includes(gap.toLowerCase())) score += 10;
    }
    for (const term of searchTerms) {
      if (dayText.includes(term)) score += 2;
    }
    return { day, score };
  });

  scoredDays.sort((a, b) => b.score - a.score);
  const topMatchedDays = scoredDays.slice(0, 3).map((sd) => sd.day);
  const primaryDay = topMatchedDays[0] ?? curriculumDays[0];
  const keyConcepts = primaryDay?.concepts ?? [];
  const relatedConcepts = Array.from(
    new Set(
      topMatchedDays
        .flatMap((d) => d.concepts ?? [])
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

// ---------------------------------------------------------------------------
// Curriculum Concept Extraction (Milestone 3.2)
// ---------------------------------------------------------------------------

/**
 * Deterministically extracts concept units from a raw or normalized curriculum day.
 * Maps keywords, preserves source day, source topic, module, tools, and description.
 *
 * @param dayItem - Raw CurriculumDay or NormalizedCurriculumItem
 * @returns Array of CurriculumConcept objects
 */
export function extractConceptsFromDay(
  dayItem: CurriculumDay | NormalizedCurriculumItem
): CurriculumConcept[] {
  const norm =
    "sourceRef" in dayItem
      ? (dayItem as NormalizedCurriculumItem)
      : normalizeCurriculumDay(dayItem as CurriculumDay);

  return norm.concepts.map((conceptName) => {
    const slug = conceptName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const id = `concept-day-${norm.day}-${slug}`;

    const keywordsSet = new Set<string>();

    // 1. Concept name lowercased
    keywordsSet.add(conceptName.toLowerCase());

    // 2. Word tokens (>2 chars)
    const words = conceptName
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2);
    for (const w of words) {
      keywordsSet.add(w);
    }

    // 3. Topic name lowercased
    keywordsSet.add(norm.topic.toLowerCase());

    // 4. Tools associated with day
    for (const tool of norm.tools) {
      keywordsSet.add(tool.toLowerCase());
    }

    const relatedKeywords = Array.from(keywordsSet);

    const description = `Concept '${conceptName}' covered on Day ${norm.day} (${norm.topic}) in module '${norm.module}'. Content context: ${norm.content}`;

    const rawConcept: CurriculumConcept = {
      id,
      conceptName,
      relatedKeywords,
      sourceDay: norm.day,
      sourceTopic: norm.topic,
      module: norm.module,
      tools: norm.tools,
      description,
    };

    return strictValidate(
      CurriculumConceptSchema,
      rawConcept,
      `Extracted Concept ${conceptName}`
    );
  });
}

/**
 * Loads and extracts concepts across the entire curriculum.
 * Cached in memory.
 *
 * @returns Array of CurriculumConcept objects
 */
export async function loadExtractedConcepts(): Promise<CurriculumConcept[]> {
  if (_extractedConceptsCache) return _extractedConceptsCache;

  const normalized = await loadNormalizedCurriculum();
  _extractedConceptsCache = normalized.flatMap((item) =>
    extractConceptsFromDay(item)
  );
  return _extractedConceptsCache;
}

/**
 * Retrieves all concepts extracted for a given curriculum day number.
 *
 * @param day - Day number (1-indexed)
 * @returns Array of CurriculumConcept objects
 */
export async function getConceptsByDay(
  day: number
): Promise<CurriculumConcept[]> {
  const norm = await getNormalizedCurriculumDay(day);
  if (!norm) return [];
  return extractConceptsFromDay(norm);
}

/**
 * Retrieves a concept by conceptName (case-insensitive search).
 *
 * @param name - Concept name or search string
 * @returns CurriculumConcept or null if not found
 */
export async function getConceptByName(
  name: string
): Promise<CurriculumConcept | null> {
  const concepts = await loadExtractedConcepts();
  const searchLower = name.trim().toLowerCase();
  return (
    concepts.find(
      (c) => c.conceptName.toLowerCase() === searchLower || c.id === name
    ) ?? null
  );
}

// ---------------------------------------------------------------------------
// Curriculum Concept Metadata Enrichment (Milestone 3.3)
// ---------------------------------------------------------------------------

/**
 * Deterministically enriches an extracted CurriculumConcept with retrieval-ready
 * metadata, difficulty level, category, keywords, related concepts, and source mapping.
 *
 * @param concept - Base CurriculumConcept
 * @param allConcepts - Optional list of all extracted concepts for relation linking
 * @returns EnrichedCurriculumConcept
 */
export function enrichConcept(
  concept: CurriculumConcept,
  allConcepts?: CurriculumConcept[]
): EnrichedCurriculumConcept {
  // 1. Difficulty Level (Deterministic rule by curriculum progression)
  let difficultyLevel: ConceptDifficultyLevel = "Intermediate";
  if (concept.sourceDay <= 2) {
    difficultyLevel = "Beginner";
  } else if (concept.sourceDay >= 6) {
    difficultyLevel = "Advanced";
  }

  // 2. Category Grouping
  const category = concept.module || "General AI Engineering";

  // 3. Related Concepts
  let relatedConcepts: string[] = [];
  if (allConcepts) {
    relatedConcepts = Array.from(
      new Set(
        allConcepts
          .filter(
            (c) =>
              (c.sourceDay === concept.sourceDay || c.module === concept.module) &&
              c.conceptName !== concept.conceptName
          )
          .map((c) => c.conceptName)
      )
    );
  }

  // 4. Related Topics
  let relatedTopics: string[] = [concept.sourceTopic];
  if (allConcepts) {
    relatedTopics = Array.from(
      new Set(
        allConcepts
          .filter(
            (c) =>
              Math.abs(c.sourceDay - concept.sourceDay) <= 1 ||
              c.module === concept.module
          )
          .map((c) => c.sourceTopic)
      )
    );
  }

  // 5. Expanded Keywords
  const keywordsSet = new Set<string>(concept.relatedKeywords);
  keywordsSet.add(category.toLowerCase());
  keywordsSet.add(difficultyLevel.toLowerCase());
  keywordsSet.add(`day ${concept.sourceDay}`);
  const expandedKeywords = Array.from(keywordsSet);

  // 6. Source Mapping
  const sourceMapping = {
    file: "curriculum.json",
    day: concept.sourceDay,
    uri: `data/curriculum.json#day=${concept.sourceDay}`,
    topic: concept.sourceTopic,
    module: concept.module,
  };

  // 7. Rich Metadata
  const metadata = {
    difficultyLevel,
    category,
    conceptCountInDay: relatedConcepts.length + 1,
    toolCount: concept.tools.length,
    isAgentic: concept.sourceDay >= 6,
    isRagFoundation: concept.sourceDay <= 4,
  };

  const rawEnriched: EnrichedCurriculumConcept = {
    id: concept.id,
    conceptName: concept.conceptName,
    difficultyLevel,
    category,
    keywords: expandedKeywords,
    relatedConcepts,
    relatedTopics,
    sourceDay: concept.sourceDay,
    sourceTopic: concept.sourceTopic,
    module: concept.module,
    tools: concept.tools,
    description: concept.description,
    sourceMapping,
    metadata,
  };

  return strictValidate(
    EnrichedCurriculumConceptSchema,
    rawEnriched,
    `Enriched Concept ${concept.conceptName}`
  );
}

/**
 * Loads, extracts, and enriches all curriculum concepts.
 * Cached in memory.
 *
 * @returns Array of EnrichedCurriculumConcept objects
 */
export async function loadEnrichedConcepts(): Promise<
  EnrichedCurriculumConcept[]
> {
  if (_enrichedConceptsCache) return _enrichedConceptsCache;

  const baseConcepts = await loadExtractedConcepts();
  _enrichedConceptsCache = baseConcepts.map((c) => enrichConcept(c, baseConcepts));
  return _enrichedConceptsCache;
}

/**
 * Retrieves all enriched concepts for a given curriculum day number.
 *
 * @param day - Day number (1-indexed)
 * @returns Array of EnrichedCurriculumConcept objects
 */
export async function getEnrichedConceptsByDay(
  day: number
): Promise<EnrichedCurriculumConcept[]> {
  const allEnriched = await loadEnrichedConcepts();
  return allEnriched.filter((c) => c.sourceDay === day);
}

/**
 * Retrieves an enriched concept by name or concept ID.
 *
 * @param name - Concept name or search string
 * @returns EnrichedCurriculumConcept or null if not found
 */
export async function getEnrichedConceptByName(
  name: string
): Promise<EnrichedCurriculumConcept | null> {
  const allEnriched = await loadEnrichedConcepts();
  const searchLower = name.trim().toLowerCase();
  return (
    allEnriched.find(
      (c) => c.conceptName.toLowerCase() === searchLower || c.id === name
    ) ?? null
  );
}

/**
 * Clears curriculum caches (useful for testing or dynamic reloads).
 */
export function clearCurriculumCache(): void {
  _curriculumCache = null;
  _normalizedCache = null;
  _extractedConceptsCache = null;
  _enrichedConceptsCache = null;
}
