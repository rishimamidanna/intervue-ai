/**
 * tests/retrieval/curriculum-retriever.test.ts
 *
 * Unit tests for Milestone 1.4 — Retrieval Foundation.
 * Verifies relevant topic retrieval, multiple topic matches, no match handling, and score calculations.
 *
 * Owner: Shared (Data & Testing)
 */

import test from "node:test";
import assert from "node:assert";

import { loadCandidates } from "@/lib/loaders/candidate-loader";
import { loadCurriculum } from "@/lib/loaders/curriculum-loader";
import { analyzeCandidateProfile } from "@/lib/analyzer/candidate-analyzer";
import { processCurriculumData } from "@/lib/processors/curriculum-processor";
import {
  retrieveRelevantKnowledge,
  searchKnowledgeUnitsByTopic,
  calculateUnitRelevanceScore,
} from "@/lib/retrieval/curriculum-retriever";

test("Curriculum Retriever - Relevant topic retrieval for CAND-001 Sarah Johnson", async () => {
  const candidates = await loadCandidates();
  const rawCurriculum = await loadCurriculum();
  const processedUnits = processCurriculumData(rawCurriculum);

  const sarah = candidates.find((c) => c.member.id === "CAND-001");
  assert.ok(sarah, "CAND-001 Sarah Johnson must exist");

  const sarahProfile = analyzeCandidateProfile(sarah, rawCurriculum.days);
  const context = retrieveRelevantKnowledge(sarahProfile, processedUnits);

  assert.ok(context.matchedCount > 0, "Should retrieve matched knowledge units for candidate");
  assert.ok(context.relevanceScore > 0.50, "Overall relevance score should be high (>0.50)");
  assert.ok(Array.isArray(context.topics), "Topics must be an array");
  assert.ok(Array.isArray(context.concepts), "Concepts must be an array");
  assert.ok(Array.isArray(context.units), "Units must be an array");

  // Sarah has weakness in Monitoring/Observability (skipped) and Prompt Eng (4 attempts)
  const topicsStr = context.topics.join(" ");
  assert.ok(
    topicsStr.includes("Prompt Engineering") || topicsStr.includes("Monitoring") || topicsStr.includes("Observability"),
    "Retrieved topics should include candidate weaknesses and focus areas"
  );
});

test("Curriculum Retriever - Multiple topic matches sorted by relevance score", async () => {
  const candidates = await loadCandidates();
  const rawCurriculum = await loadCurriculum();
  const processedUnits = processCurriculumData(rawCurriculum);

  const alex = candidates.find((c) => c.member.id === "CAND-002");
  assert.ok(alex, "CAND-002 Alex Turner must exist");

  const alexProfile = analyzeCandidateProfile(alex, rawCurriculum.days);
  const context = retrieveRelevantKnowledge(alexProfile, processedUnits, { limit: 5 });

  assert.ok(context.units.length > 1, "Should retrieve multiple matching units for candidate with multiple focus areas");
  assert.ok(context.units.length <= 5, "Should respect limit option");

  // Check descending score ordering
  for (let i = 0; i < context.matches.length - 1; i++) {
    assert.ok(
      context.matches[i].score >= context.matches[i + 1].score,
      "Matches must be sorted in descending order of relevance score"
    );
  }
});

test("Curriculum Retriever - No match handling (empty curriculum, missing candidate, unmapped query)", async () => {
  const rawCurriculum = await loadCurriculum();
  const processedUnits = processCurriculumData(rawCurriculum);

  // 1. Empty curriculum units
  const emptyContext1 = retrieveRelevantKnowledge(
    {
      candidateId: "TEST",
      candidateName: "Test",
      jobRole: "Dev",
      yearsExperience: 1,
      strengths: [],
      weaknesses: ["Prompting"],
      completedTopics: [],
      missingTopics: [],
      skillCoverage: { totalMissions: 0, completedMissions: 0, passedMissions: 0, firstTryPasses: 0, skippedMissions: 0, completionRate: 0, passRate: 0 },
      recommendedFocusAreas: ["Prompting"],
      expectedDepthFactor: 1,
      profileSummary: "",
      initialKnowledgeEstimates: [],
      priorityTopics: ["Prompting"],
      weaknessSignals: ["Prompting"],
      strengthSignals: [],
    },
    []
  );
  assert.strictEqual(emptyContext1.matchedCount, 0);
  assert.strictEqual(emptyContext1.relevanceScore, 0);
  assert.strictEqual(emptyContext1.topics.length, 0);

  // 2. Missing candidate profile
  const emptyContext2 = retrieveRelevantKnowledge(null, processedUnits);
  assert.strictEqual(emptyContext2.matchedCount, 0);
  assert.strictEqual(emptyContext2.relevanceScore, 0);

  // 3. Unmapped topic query matching zero curriculum items
  const noMatchContext = searchKnowledgeUnitsByTopic("NonExistentTopicX999", processedUnits, { minScore: 0.50 });
  assert.strictEqual(noMatchContext.matchedCount, 0);
  assert.strictEqual(noMatchContext.relevanceScore, 0);
  assert.strictEqual(noMatchContext.topics.length, 0);
});

test("Curriculum Retriever - Direct topic search by string", async () => {
  const rawCurriculum = await loadCurriculum();
  const processedUnits = processCurriculumData(rawCurriculum);

  const context = searchKnowledgeUnitsByTopic("Embeddings", processedUnits);

  assert.ok(context.matchedCount > 0, "Direct search for 'Embeddings' should find units");
  assert.ok(context.topics.some((t) => t.includes("Embeddings")), "Topics should contain Embeddings");
  assert.ok(context.relevanceScore > 0, "Relevance score should be positive");
});

test("Curriculum Retriever - calculateUnitRelevanceScore scoring rules", () => {
  const sampleUnit = {
    id: "unit-day-7",
    day: 7,
    moduleNumber: 3,
    moduleTitle: "Embeddings & Vector Search",
    topic: "Embeddings Explained",
    type: "AI_CORE",
    concepts: ["Sentence Transformers", "OpenAI Embeddings"],
    tools: ["Sentence Transformers", "OpenAI Embeddings"],
    objectives: ["Understand vector embeddings"],
    difficultyLevel: 3 as const,
    keywords: ["embeddings", "vector", "openai"],
    searchableContent: "Module 3: Embeddings & Vector Search | Day 7: Embeddings Explained | Tools: OpenAI",
  };

  // Matching weakness
  const match1 = calculateUnitRelevanceScore(sampleUnit, { weaknesses: ["Embeddings Explained"] });
  assert.ok(match1.score >= 0.50, "Exact weakness topic match should yield high score");
  assert.ok(match1.matchReasons.some((r) => r.toLowerCase().includes("weakness")), "Match reasons should list weakness match");

  // Unrelated weakness
  const match2 = calculateUnitRelevanceScore(sampleUnit, { weaknesses: ["Docker & Kubernetes Deployment"] });
  assert.strictEqual(match2.score, 0, "Unrelated weakness should yield zero score");
});
