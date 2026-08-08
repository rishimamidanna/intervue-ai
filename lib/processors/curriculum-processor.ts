/**
 * lib/processors/curriculum-processor.ts
 *
 * Curriculum Processor Module
 *
 * Transforms raw, validated curriculum data (from Milestone 1.1) into structured,
 * indexed CurriculumKnowledgeUnit objects ready for search and RAG retrieval.
 *
 * Architecture Position: Curriculum Processing Layer (Milestone 1.3)
 *
 * Requirements:
 * - 100% Deterministic processing
 * - Zero AI / LLM calls
 * - Zero external dependencies
 * - Graceful handling of empty or missing fields
 *
 * Owner: Shared / Backend (Data Layer)
 */

import type { DifficultyLevel } from "@/types/interview";
import type { CurriculumData, CurriculumDay, CurriculumModule, CurriculumKnowledgeUnit } from "@/types/curriculum";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "this", "that",
  "these", "those", "your", "my", "our", "their", "how", "what", "which", "who",
  "when", "where", "why", "can", "will", "should", "using", "use", "build", "create",
  "run", "setup", "configure", "test", "verify", "first", "end", "all", "each", "every"
]);

/**
 * Extracts normalized search keywords and technical terms from text elements.
 */
export function extractKeywords(title = "", tools: string[] = [], objectives: string[] = []): string[] {
  const keywords = new Set<string>();

  // 1. Add tools directly (tools are key technical terms)
  tools.forEach((tool) => {
    if (tool && tool.trim().length > 0) {
      keywords.add(tool.trim().toLowerCase());
    }
  });

  // 2. Process title and objectives text
  const textBlob = `${title} ${objectives.join(" ")}`;
  const words = textBlob
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  words.forEach((w) => keywords.add(w));

  // 3. Extract common multi-word technical phrases
  const lowerBlob = textBlob.toLowerCase();
  const techPhrases = [
    "vector database", "vector search", "prompt engineering", "fine-tuning",
    "retrieval engine", "structured output", "function calling", "model context protocol",
    "mcp", "multi-agent", "agentic ai", "capstone project", "cosine similarity",
    "semantic search", "rag pipeline", "docker deployment", "kubernetes", "observability",
  ];

  techPhrases.forEach((phrase) => {
    if (lowerBlob.includes(phrase)) {
      keywords.add(phrase);
    }
  });

  return Array.from(keywords);
}

/**
 * Calculates difficulty level (1–5) deterministically based on day number and type.
 */
export function calculateDayDifficulty(dayNumber = 1, dayType = "BUILD"): DifficultyLevel {
  let baseDifficulty = 1;

  if (dayNumber <= 5) {
    baseDifficulty = 1;
  } else if (dayNumber <= 12) {
    baseDifficulty = 2;
  } else if (dayNumber <= 20) {
    baseDifficulty = 3;
  } else if (dayNumber <= 27) {
    baseDifficulty = 4;
  } else {
    baseDifficulty = 5;
  }

  const typeUpper = dayType.toUpperCase();
  if (typeUpper === "CAPSTONE") {
    baseDifficulty = 5;
  } else if (typeUpper === "AI_CORE") {
    baseDifficulty = Math.min(5, baseDifficulty + 1);
  } else if (typeUpper === "SETUP") {
    baseDifficulty = Math.min(baseDifficulty, 2);
  }

  const clamped = Math.min(5, Math.max(1, baseDifficulty));
  return clamped as DifficultyLevel;
}

/**
 * Combines tools and objectives into a clean list of core concepts.
 */
export function extractConcepts(tools: string[] = [], objectives: string[] = []): string[] {
  const concepts = new Set<string>();

  tools.forEach((t) => {
    if (t && t.trim().length > 0) concepts.add(t.trim());
  });

  objectives.forEach((obj) => {
    if (!obj) return;
    // Extract concise action/concept from objective string
    const firstPart = obj.split(/[,:;]/)[0].trim();
    if (firstPart.length > 5 && firstPart.length < 50) {
      concepts.add(firstPart);
    }
  });

  return Array.from(concepts);
}

/**
 * Builds a structured, plain-text searchable content string for retrieval indexing.
 */
export function buildSearchableContent(unit: {
  moduleNumber?: number;
  moduleTitle?: string;
  day?: number;
  topic?: string;
  type?: string;
  tools?: string[];
  objectives?: string[];
  keywords?: string[];
}): string {
  const modStr = unit.moduleTitle ? `Module ${unit.moduleNumber ?? 0}: ${unit.moduleTitle}` : "Module 0: General";
  const dayStr = `Day ${unit.day ?? 0}: ${unit.topic ?? "Untitled Topic"} (${unit.type ?? "GENERAL"})`;
  const toolsStr = unit.tools && unit.tools.length > 0 ? `Tools: ${unit.tools.join(", ")}` : "";
  const objStr = unit.objectives && unit.objectives.length > 0 ? `Objectives: ${unit.objectives.join("; ")}` : "";
  const kwStr = unit.keywords && unit.keywords.length > 0 ? `Keywords: ${unit.keywords.join(", ")}` : "";

  return [modStr, dayStr, toolsStr, objStr, kwStr].filter(Boolean).join(" | ");
}

/**
 * Transforms a single CurriculumDay into a structured CurriculumKnowledgeUnit.
 *
 * @param day - Validated CurriculumDay object
 * @param modules - Optional array of CurriculumModule definitions for module mapping
 * @returns CurriculumKnowledgeUnit
 */
export function processCurriculumDay(
  day: CurriculumDay,
  modules: CurriculumModule[] = []
): CurriculumKnowledgeUnit {
  const dayNumber = day?.day ?? 0;
  const topic = day?.title ?? day?.topic ?? `Day ${dayNumber}`;
  const type = day?.type ?? "GENERAL";
  const tools = day?.tools ?? [];
  const objectives = day?.objectives ?? day?.learningObjectives ?? [];

  // Find module title and number
  let moduleNumber = 0;
  let moduleTitle = "General AI Foundations";

  const matchedModule = modules.find(
    (m) => m.days && dayNumber >= m.days[0] && dayNumber <= m.days[1]
  );

  if (matchedModule) {
    moduleNumber = matchedModule.n;
    moduleTitle = matchedModule.title;
  }

  const id = `unit-day-${dayNumber}`;
  const difficultyLevel = calculateDayDifficulty(dayNumber, type);
  const concepts = extractConcepts(tools, objectives);
  const keywords = extractKeywords(topic, tools, objectives);

  const searchableContent = buildSearchableContent({
    moduleNumber,
    moduleTitle,
    day: dayNumber,
    topic,
    type,
    tools,
    objectives,
    keywords,
  });

  return {
    id,
    day: dayNumber,
    moduleNumber,
    moduleTitle,
    topic,
    type,
    concepts,
    tools,
    objectives,
    difficultyLevel,
    keywords,
    searchableContent,
  };
}

/**
 * Transforms full CurriculumData payload into structured knowledge units.
 *
 * @param curriculumData - Validated CurriculumData object from Milestone 1.1
 * @returns Array of CurriculumKnowledgeUnit objects
 */
export function processCurriculumData(curriculumData: CurriculumData): CurriculumKnowledgeUnit[] {
  if (!curriculumData || !Array.isArray(curriculumData.days)) {
    return [];
  }

  const modules = curriculumData.modules ?? [];
  return curriculumData.days.map((day) => processCurriculumDay(day, modules));
}
