/**
 * tests/processors/curriculum-processor.test.ts
 *
 * Unit tests for Milestone 1.3 — Curriculum Processor.
 * Verifies transformation of raw curriculum data into structured knowledge units,
 * difficulty level calculation, keyword extraction, searchable content formatting, and edge case handling.
 *
 * Owner: Shared (Data & Testing)
 */

import test from "node:test";
import assert from "node:assert";

import { loadCurriculum } from "@/lib/loaders/curriculum-loader";
import {
  processCurriculumData,
  processCurriculumDay,
  extractKeywords,
  calculateDayDifficulty,
  extractConcepts,
  buildSearchableContent,
} from "@/lib/processors/curriculum-processor";
import type { CurriculumData, CurriculumDay } from "@/types/curriculum";

test("Curriculum Processor - Processes full curriculum.json into 31 Knowledge Units", async () => {
  const curriculumData = await loadCurriculum();
  const units = processCurriculumData(curriculumData);

  assert.ok(Array.isArray(units), "Units must be an array");
  assert.strictEqual(units.length, 31, "Should process exactly 31 knowledge units");

  const day7Unit = units.find((u) => u.day === 7);
  assert.ok(day7Unit, "Day 7 unit must exist");

  assert.strictEqual(day7Unit.id, "unit-day-7");
  assert.strictEqual(day7Unit.day, 7);
  assert.strictEqual(day7Unit.moduleNumber, 3);
  assert.strictEqual(day7Unit.moduleTitle, "Embeddings & Vector Search");
  assert.strictEqual(day7Unit.topic, "Embeddings Explained");
  assert.strictEqual(day7Unit.type, "AI_CORE");
  assert.strictEqual(day7Unit.difficultyLevel, 3);

  // Check concepts, tools, keywords, and searchable content
  assert.ok(day7Unit.tools.includes("OpenAI Embeddings"), "Tools should include OpenAI Embeddings");
  assert.ok(day7Unit.tools.includes("Sentence Transformers"), "Tools should include Sentence Transformers");
  assert.ok(day7Unit.keywords.includes("embeddings"), "Keywords should contain 'embeddings'");
  assert.ok(day7Unit.keywords.includes("vector"), "Keywords should contain 'vector'");
  assert.ok(day7Unit.searchableContent.includes("Module 3: Embeddings & Vector Search"), "Searchable content should contain module title");
  assert.ok(day7Unit.searchableContent.includes("Day 7: Embeddings Explained"), "Searchable content should contain day title");
});

test("Curriculum Processor - Keyword extraction utility", () => {
  const keywords = extractKeywords(
    "Embeddings & Vector Search",
    ["OpenAI", "Python", "NumPy"],
    ["Explain text embeddings convert text to vectors", "Generate vector representations"]
  );

  assert.ok(keywords.includes("openai"), "Keywords should include tool 'openai'");
  assert.ok(keywords.includes("python"), "Keywords should include tool 'python'");
  assert.ok(keywords.includes("numpy"), "Keywords should include tool 'numpy'");
  assert.ok(keywords.includes("embeddings"), "Keywords should include 'embeddings'");
  assert.ok(keywords.includes("vector"), "Keywords should include 'vector'");
  // Check that common stop words like "the", "to" are excluded
  assert.strictEqual(keywords.includes("the"), false, "Stop words like 'the' should be excluded");
  assert.strictEqual(keywords.includes("to"), false, "Stop words like 'to' should be excluded");
});

test("Curriculum Processor - Day difficulty calculation", () => {
  assert.strictEqual(calculateDayDifficulty(1, "SETUP"), 1);
  assert.strictEqual(calculateDayDifficulty(7, "AI_CORE"), 3); // base 2 + 1 for AI_CORE
  assert.strictEqual(calculateDayDifficulty(15, "BUILD"), 3);
  assert.strictEqual(calculateDayDifficulty(22, "AI_CORE"), 5); // base 4 + 1
  assert.strictEqual(calculateDayDifficulty(31, "CAPSTONE"), 5);
});

test("Curriculum Processor - Concept extraction utility", () => {
  const concepts = extractConcepts(
    ["VS Code", "Python"],
    ["Install VS Code and Python on your machine", "Configure the Python extension"]
  );

  assert.ok(concepts.includes("VS Code"), "Concepts should include tools");
  assert.ok(concepts.includes("Python"), "Concepts should include tools");
  assert.ok(concepts.some((c) => c.includes("Install VS Code")), "Concepts should extract objective actions");
});

test("Curriculum Processor - Searchable content builder", () => {
  const content = buildSearchableContent({
    moduleNumber: 3,
    moduleTitle: "Embeddings & Vector Search",
    day: 7,
    topic: "Embeddings Explained",
    type: "AI_CORE",
    tools: ["OpenAI", "Python"],
    objectives: ["Explain embeddings"],
    keywords: ["embeddings", "vector"],
  });

  assert.ok(content.includes("Module 3: Embeddings & Vector Search"));
  assert.ok(content.includes("Day 7: Embeddings Explained (AI_CORE)"));
  assert.ok(content.includes("Tools: OpenAI, Python"));
  assert.ok(content.includes("Objectives: Explain embeddings"));
  assert.ok(content.includes("Keywords: embeddings, vector"));
});

test("Curriculum Processor - Handles empty or invalid curriculum data gracefully", () => {
  const emptyData: CurriculumData = {
    cohort: "Test",
    modules: [],
    days: [],
  };

  const units = processCurriculumData(emptyData);
  assert.strictEqual(units.length, 0, "Empty curriculum days should return empty array");

  // Single incomplete day object missing tools and objectives
  const incompleteDay: CurriculumDay = {
    day: 5,
    title: "Incomplete Day",
    type: "BUILD",
    tools: [],
    objectives: [],
  };

  const unit = processCurriculumDay(incompleteDay);
  assert.strictEqual(unit.id, "unit-day-5");
  assert.strictEqual(unit.day, 5);
  assert.strictEqual(unit.topic, "Incomplete Day");
  assert.strictEqual(unit.moduleNumber, 0); // fallback module
  assert.strictEqual(unit.moduleTitle, "General AI Foundations");
  assert.ok(unit.searchableContent.length > 0, "Searchable content should still be generated");
});
