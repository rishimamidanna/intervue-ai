/**
 * tests/milestones/milestone-1-verification.test.ts
 *
 * Comprehensive Milestone 1 (Data + RAG Core) End-to-End Pipeline Verification Test.
 *
 * Verifies the full pipeline:
 * Candidate Data -> Candidate Loader -> Candidate Intelligence Analyzer -> Curriculum Loader -> Curriculum Processor -> Retrieval Foundation -> RAG Context Builder
 *
 * Owner: Shared (Testing & Verification)
 */

import test from "node:test";
import assert from "node:assert";

import { loadCandidates, loadCandidateById, parseSingleCandidate } from "@/lib/loaders/candidate-loader";
import { loadCurriculum } from "@/lib/loaders/curriculum-loader";
import { analyzeCandidateProfile } from "@/lib/analyzer/candidate-analyzer";
import { processCurriculumData } from "@/lib/processors/curriculum-processor";
import { retrieveRelevantKnowledge, searchKnowledgeUnitsByTopic } from "@/lib/retrieval/curriculum-retriever";
import { buildInterviewContext } from "@/lib/rag/context-builder";
import { getInterviewContextForCandidate } from "@/server/candidate-service";

test("Milestone 1 Verification — 1. Candidate Loader", async () => {
  // 1. Loads candidates.json successfully
  const candidates = await loadCandidates();
  assert.ok(Array.isArray(candidates), "Candidates must be an array");
  assert.ok(candidates.length > 0, "Candidates array must not be empty");

  // 2. Loads by ID
  const candidate = await loadCandidateById("CAND-001");
  assert.ok(candidate !== null, "Candidate CAND-001 must exist");
  assert.strictEqual(candidate?.member.name, "Sarah Johnson");

  // 3. Validation rejects invalid candidate payload gracefully
  assert.throws(() => parseSingleCandidate(JSON.stringify({ invalid: true })), /Validation failed/i);
});

test("Milestone 1 Verification — 2. Candidate Intelligence Analyzer", async () => {
  const candidate = await loadCandidateById("CAND-001");
  const curriculumData = await loadCurriculum();
  assert.ok(candidate !== null);

  const profile = analyzeCandidateProfile(candidate!, curriculumData.days);

  // Check generated output fields
  assert.strictEqual(profile.candidateId, "CAND-001");
  assert.strictEqual(profile.candidateName, "Sarah Johnson");
  assert.strictEqual(profile.jobRole, "Senior Data Engineer");
  assert.ok(Array.isArray(profile.strengths), "Strengths must be an array");
  assert.ok(profile.strengths.length > 0, "Strengths should be generated");
  assert.ok(Array.isArray(profile.weaknesses), "Weaknesses must be an array");
  assert.ok(profile.weaknesses.length > 0, "Weaknesses should be identified");
  assert.ok(Array.isArray(profile.recommendedFocusAreas), "Focus areas must be an array");
  assert.ok(profile.recommendedFocusAreas.length > 0, "Focus areas should be created");
  assert.ok(profile.expectedDepthFactor >= 0.5 && profile.expectedDepthFactor <= 2.0, "Depth factor must be in range [0.5, 2.0]");
  assert.ok(profile.profileSummary.includes("Sarah Johnson"), "Profile summary narrative must be generated");
});

test("Milestone 1 Verification — 3. Curriculum Loader & Processor", async () => {
  const rawCurriculum = await loadCurriculum();
  assert.ok(rawCurriculum.days.length === 31, "Raw curriculum must have 31 days");

  const units = processCurriculumData(rawCurriculum);
  assert.strictEqual(units.length, 31, "Must process 31 knowledge units");

  const unit7 = units.find((u) => u.day === 7);
  assert.ok(unit7 !== undefined);
  assert.strictEqual(unit7?.topic, "Embeddings Explained");
  assert.strictEqual(unit7?.moduleNumber, 3);
  assert.strictEqual(unit7?.moduleTitle, "Embeddings & Vector Search");
  assert.ok(unit7?.concepts.length! > 0, "Concepts must be extracted");
  assert.ok(unit7?.keywords.includes("embeddings"), "Keywords must be extracted");
  assert.ok(unit7?.searchableContent.includes("Embeddings Explained"), "Searchable content block must be created");
});

test("Milestone 1 Verification — 4. Retrieval Foundation", async () => {
  const candidate = await loadCandidateById("CAND-001");
  const rawCurriculum = await loadCurriculum();
  const units = processCurriculumData(rawCurriculum);
  const profile = analyzeCandidateProfile(candidate!, rawCurriculum.days);

  // 1. Retrieve relevant curriculum concepts given candidate weaknesses/focus areas
  const context = retrieveRelevantKnowledge(profile, units);
  assert.ok(context.matchedCount > 0, "Must retrieve matching units for candidate");
  assert.ok(context.relevanceScore > 0, "Relevance score must be positive");
  assert.ok(context.topics.length > 0, "Retrieved topics must not be empty");
  assert.ok(context.concepts.length > 0, "Retrieved concepts must not be empty");

  // 2. Direct query search
  const ragContext = searchKnowledgeUnitsByTopic("RAG", units);
  assert.ok(ragContext.matchedCount > 0, "RAG search must retrieve RAG units");

  // 3. Handles empty retrieval
  const emptyContext = retrieveRelevantKnowledge(profile, []);
  assert.strictEqual(emptyContext.matchedCount, 0);
  assert.strictEqual(emptyContext.relevanceScore, 0);
});

test("Milestone 1 Verification — 5. RAG Context Builder", async () => {
  const candidate = await loadCandidateById("CAND-001");
  const rawCurriculum = await loadCurriculum();
  const units = processCurriculumData(rawCurriculum);
  const profile = analyzeCandidateProfile(candidate!, rawCurriculum.days);
  const retrieval = retrieveRelevantKnowledge(profile, units);

  const context = buildInterviewContext(profile, retrieval);

  assert.strictEqual(context.candidateId, "CAND-001");
  assert.ok(context.candidateSummary.length > 0, "Candidate summary must be present");
  assert.ok(context.strengths.length > 0, "Strengths must be present");
  assert.ok(context.weaknesses.length > 0, "Weaknesses must be present");
  assert.ok(context.focusAreas.length > 0, "Focus areas must be present");
  assert.ok(context.relevantTopics.length > 0, "Relevant topics must be present");
  assert.ok(context.conceptsToEvaluate.length > 0, "Concepts to evaluate must be present");
  assert.ok(context.retrievedKnowledge.length > 0, "Retrieved knowledge units must be present");
  assert.ok(context.formattedPromptContext.includes("=== CANDIDATE INTELLIGENCE SUMMARY ==="));
  assert.ok(context.formattedPromptContext.includes("=== RETRIEVED CURRICULUM KNOWLEDGE"));

  // Missing data handling
  const nullContext = buildInterviewContext(null, null);
  assert.strictEqual(nullContext.candidateId, "UNKNOWN");
  assert.ok(nullContext.formattedPromptContext.length > 0);
});

test("Milestone 1 Verification — End-to-End Pipeline Integration", async () => {
  const context = await getInterviewContextForCandidate("CAND-001");
  assert.ok(context !== null, "End-to-end pipeline context must not be null");
  assert.strictEqual(context?.candidateId, "CAND-001");
  assert.ok(context?.retrievedKnowledge.length! > 0, "End-to-end pipeline must retrieve curriculum units");
});
