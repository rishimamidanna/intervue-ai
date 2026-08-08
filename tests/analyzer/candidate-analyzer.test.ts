/**
 * tests/analyzer/candidate-analyzer.test.ts
 *
 * Unit tests for Milestone 1.2 — Candidate Intelligence Analyzer.
 * Verifies deterministic candidate analysis, skill coverage, topic extraction,
 * recommended focus areas, and graceful handling of empty/incomplete candidate data.
 *
 * Owner: Shared (Data & Testing)
 */

import test from "node:test";
import assert from "node:assert";

import { loadCandidates } from "@/lib/loaders/candidate-loader";
import { loadCurriculum } from "@/lib/loaders/curriculum-loader";
import {
  analyzeCandidateProfile,
  calculateSkillCoverage,
  calculateExpectedDepthFactor,
} from "@/lib/analyzer/candidate-analyzer";
import type { CandidateProfile } from "@/types/candidate";

test("Candidate Analyzer - Analyzes CAND-001 Sarah Johnson successfully", async () => {
  const candidates = await loadCandidates();
  const curriculum = await loadCurriculum();

  const sarah = candidates.find((c) => c.member.id === "CAND-001");
  assert.ok(sarah, "CAND-001 must exist");

  const profile = analyzeCandidateProfile(sarah, curriculum.days);

  assert.strictEqual(profile.candidateId, "CAND-001");
  assert.strictEqual(profile.candidateName, "Sarah Johnson");
  assert.strictEqual(profile.jobRole, "Senior Data Engineer");
  assert.strictEqual(profile.yearsExperience, 9);
  assert.strictEqual(profile.expectedDepthFactor, 1.6); // 1.4 base for 9+ yrs + 0.2 Senior

  // Check strengths
  assert.ok(Array.isArray(profile.strengths), "Strengths must be an array");
  assert.ok(profile.strengths.includes("Embeddings Explained"), "Should identify first-try pass as strength");

  // Check weaknesses (monitoring was skipped, prompt eng took 4 attempts)
  assert.ok(Array.isArray(profile.weaknesses), "Weaknesses must be an array");
  const weaknessStr = profile.weaknesses.join(" ");
  assert.ok(weaknessStr.includes("Monitoring, Logging & Observability"), "Skipped mission should be in weaknesses");
  assert.ok(weaknessStr.includes("Prompt Engineering Fundamentals"), "High attempt mission should be in weaknesses");

  // Check completed vs missing topics
  assert.ok(profile.completedTopics.includes("Embeddings Explained"), "Completed topics should include passed missions");
  assert.ok(profile.missingTopics.includes("Monitoring, Logging & Observability"), "Missing topics should include skipped missions");

  // Check skill coverage
  assert.strictEqual(profile.skillCoverage.totalMissions, 10);
  assert.strictEqual(profile.skillCoverage.completedMissions, 9);
  assert.strictEqual(profile.skillCoverage.skippedMissions, 1);
  assert.strictEqual(profile.skillCoverage.completionRate, 90);

  // Check recommended focus areas
  assert.ok(Array.isArray(profile.recommendedFocusAreas), "Recommended focus areas must be an array");
  assert.ok(profile.recommendedFocusAreas.length > 0, "Should contain focus areas");
});

test("Candidate Analyzer - Deterministic output consistency", async () => {
  const candidates = await loadCandidates();
  const candidate = candidates[0];

  const profile1 = analyzeCandidateProfile(candidate);
  const profile2 = analyzeCandidateProfile(candidate);

  assert.deepStrictEqual(profile1, profile2, "Multiple runs with same input must return identical output");
});

test("Candidate Analyzer - Handles empty candidate missions gracefully", () => {
  const emptyCandidate: CandidateProfile = {
    member: {
      id: "CAND-EMPTY",
      name: "Empty Candidate",
      jobRole: "Junior Developer",
      yearsExperience: 1,
      education: "BS",
      status: "NEW",
    },
    missions: [],
    signals: { commitDays: 0, missionsCompleted: 0, missionsFirstTry: 0 },
  };

  const profile = analyzeCandidateProfile(emptyCandidate);

  assert.strictEqual(profile.candidateId, "CAND-EMPTY");
  assert.strictEqual(profile.completedTopics.length, 0);
  assert.strictEqual(profile.strengths.length, 0);
  assert.strictEqual(profile.weaknesses.length, 0);
  assert.strictEqual(profile.skillCoverage.totalMissions, 0);
  assert.strictEqual(profile.skillCoverage.completionRate, 0);
  assert.strictEqual(profile.expectedDepthFactor, 0.7);
  assert.ok(profile.recommendedFocusAreas.length > 0, "Should provide default focus areas for empty candidate");
});

test("Candidate Analyzer - Handles candidate with perfect score (no weaknesses)", () => {
  const perfectCandidate: CandidateProfile = {
    member: {
      id: "CAND-PERFECT",
      name: "Perfect User",
      jobRole: "AI Engineer",
      yearsExperience: 5,
      education: "MS",
      status: "COMPLETED",
    },
    missions: [
      { day: 1, title: "VS Code Setup", passed: true, attempts: 1 },
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
    ],
    signals: { commitDays: 31, missionsCompleted: 31, missionsFirstTry: 31 },
  };

  const profile = analyzeCandidateProfile(perfectCandidate);

  assert.strictEqual(profile.weaknesses.length, 0);
  assert.ok(profile.strengths.includes("VS Code Setup"));
  assert.ok(profile.strengths.includes("Embeddings Explained"));
  assert.ok(profile.recommendedFocusAreas.length > 0, "Perfect candidate should get role-appropriate advanced focus areas");
});

test("Candidate Analyzer - Depth factor calculations", () => {
  assert.strictEqual(calculateExpectedDepthFactor(0, "Junior Developer"), 0.7);
  assert.strictEqual(calculateExpectedDepthFactor(3, "Software Engineer"), 1.0);
  assert.strictEqual(calculateExpectedDepthFactor(6, "Senior AI Engineer"), 1.4); // 1.2 + 0.2
  assert.strictEqual(calculateExpectedDepthFactor(12, "Principal Architect"), 1.6); // 1.4 + 0.2
});
