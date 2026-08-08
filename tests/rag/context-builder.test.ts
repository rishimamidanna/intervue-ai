/**
 * tests/rag/context-builder.test.ts
 *
 * Unit tests for Milestone 1.5 — RAG Context Builder.
 * Verifies context generation with valid data, empty retrieval handling, missing field handling,
 * and prompt formatting.
 *
 * Owner: Shared (Data & Testing)
 */

import test from "node:test";
import assert from "node:assert";

import { loadCandidates, getInterviewContextForCandidate } from "@/server/candidate-service";
import { loadCurriculum } from "@/lib/loaders/curriculum-loader";
import { analyzeCandidateProfile } from "@/lib/analyzer/candidate-analyzer";
import { processCurriculumData } from "@/lib/processors/curriculum-processor";
import { retrieveRelevantKnowledge } from "@/lib/retrieval/curriculum-retriever";
import { buildInterviewContext, formatPromptContext } from "@/lib/rag/context-builder";
import type { CandidateIntelligenceProfile } from "@/types/candidate";
import type { RelevantKnowledgeContext } from "@/types/curriculum";

test("RAG Context Builder - Context generation with valid data (Sarah Johnson)", async () => {
  const candidates = await loadCandidates();
  const rawCurriculum = await loadCurriculum();
  const processedUnits = processCurriculumData(rawCurriculum);

  const sarah = candidates.find((c) => c.member.id === "CAND-001");
  assert.ok(sarah, "CAND-001 Sarah Johnson must exist");

  const sarahProfile = analyzeCandidateProfile(sarah, rawCurriculum.days);
  const retrievalContext = retrieveRelevantKnowledge(sarahProfile, processedUnits);

  const context = buildInterviewContext(sarahProfile, retrievalContext);

  assert.strictEqual(context.candidateId, "CAND-001");
  assert.ok(context.candidateSummary.includes("Sarah Johnson"), "Summary should contain candidate name");
  assert.ok(Array.isArray(context.strengths), "Strengths must be an array");
  assert.ok(Array.isArray(context.weaknesses), "Weaknesses must be an array");
  assert.ok(Array.isArray(context.relevantTopics), "Relevant topics must be an array");
  assert.ok(Array.isArray(context.conceptsToEvaluate), "Concepts to evaluate must be an array");
  assert.ok(Array.isArray(context.relevantConcepts), "Relevant concepts must be an array");
  assert.ok(Array.isArray(context.focusAreas), "Focus areas must be an array");
  assert.ok(Array.isArray(context.retrievedKnowledge), "Retrieved knowledge must be an array");

  assert.ok(context.retrievedKnowledge.length > 0, "Should contain retrieved knowledge units");
  assert.ok(context.relevanceScore > 0, "Relevance score should be greater than 0");

  // Check formatted prompt text block
  assert.ok(context.formattedPromptContext.includes("=== CANDIDATE INTELLIGENCE SUMMARY ==="), "Prompt context should contain candidate header");
  assert.ok(context.formattedPromptContext.includes("=== RETRIEVED CURRICULUM KNOWLEDGE"), "Prompt context should contain RAG header");
});

test("RAG Context Builder - Empty retrieval handling", async () => {
  const candidates = await loadCandidates();
  const sarah = candidates.find((c) => c.member.id === "CAND-001");
  const sarahProfile = analyzeCandidateProfile(sarah!);

  const emptyRetrieval: RelevantKnowledgeContext = {
    units: [],
    topics: [],
    concepts: [],
    relevanceScore: 0,
    matchedCount: 0,
    matches: [],
  };

  const context = buildInterviewContext(sarahProfile, emptyRetrieval);

  assert.strictEqual(context.candidateId, "CAND-001");
  assert.strictEqual(context.retrievedKnowledge.length, 0, "Retrieved knowledge should be empty array");
  assert.strictEqual(context.relevanceScore, 0, "Relevance score should be 0");
  assert.ok(context.focusAreas.length > 0, "Focus areas from profile should still be preserved");
  assert.ok(
    context.formattedPromptContext.includes("[No matching curriculum units retrieved"),
    "Formatted prompt should note absence of retrieved units"
  );
});

test("RAG Context Builder - Missing field and null input handling", () => {
  // 1. Both profile and retrieval are null
  const nullContext = buildInterviewContext(null, null);
  assert.strictEqual(nullContext.candidateId, "UNKNOWN");
  assert.strictEqual(nullContext.retrievedKnowledge.length, 0);
  assert.strictEqual(nullContext.relevanceScore, 0);
  assert.ok(nullContext.formattedPromptContext.length > 0, "Should generate fallback prompt text");

  // 2. Incomplete profile object missing optional arrays
  const incompleteProfile: Partial<CandidateIntelligenceProfile> = {
    candidateId: "CAND-INC",
    candidateName: "Incomplete User",
  };

  const formattedText = formatPromptContext(incompleteProfile, [], 0);
  assert.ok(formattedText.includes("Incomplete User"));
  assert.ok(formattedText.includes("None identified"));
});

test("RAG Context Builder - End-to-End Server Candidate Service Integration", async () => {
  const context = await getInterviewContextForCandidate("CAND-001");

  assert.ok(context !== null, "Context for CAND-001 should not be null");
  assert.strictEqual(context?.candidateId, "CAND-001");
  assert.ok(context?.retrievedKnowledge.length! > 0, "End-to-end service should retrieve knowledge units");
});
