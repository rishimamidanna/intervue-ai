/**
 * tests/loaders/loaders.test.ts
 *
 * Unit tests for Milestone 1.1 — Data Loading Layer.
 * Verifies candidate loader, curriculum loader, schema validation, and error handling.
 *
 * Owner: Shared (Data & Testing)
 */

import test from "node:test";
import assert from "node:assert";

import {
  loadCandidates,
  loadCandidateById,
  validateCandidatesData,
  parseCandidatesData,
  parseSingleCandidate,
} from "@/lib/loaders/candidate-loader";

import {
  loadCurriculum,
  getCurriculumIndex,
  getCurriculumDay,
  validateCurriculumData,
  parseCurriculumData,
} from "@/lib/loaders/curriculum-loader";

// ---------------------------------------------------------------------------
// Candidate Loader Tests
// ---------------------------------------------------------------------------

test("Candidate Loader - Loads candidates.json successfully", async () => {
  const candidates = await loadCandidates();
  assert.ok(Array.isArray(candidates), "Candidates must be an array");
  assert.strictEqual(candidates.length, 20, "Should load 20 candidates from candidates.json");

  const firstCandidate = candidates[0];
  assert.strictEqual(firstCandidate.member.id, "CAND-001");
  assert.strictEqual(firstCandidate.member.name, "Sarah Johnson");
  assert.strictEqual(firstCandidate.member.jobRole, "Senior Data Engineer");
  assert.strictEqual(typeof firstCandidate.member.yearsExperience, "number");
  assert.ok(Array.isArray(firstCandidate.missions), "Missions must be an array");
  assert.ok(firstCandidate.signals.commitDays > 0, "Signals should have commitDays");
});

test("Candidate Loader - Lookup candidate by ID", async () => {
  const candidate = await loadCandidateById("CAND-003");
  assert.ok(candidate !== null, "Candidate CAND-003 should exist");
  assert.strictEqual(candidate?.member.name, "Emily Chen");
  assert.strictEqual(candidate?.member.jobRole, "AI Engineer");

  const nonExistent = await loadCandidateById("CAND-999");
  assert.strictEqual(nonExistent, null, "Non-existent candidate should return null");
});

test("Candidate Loader - Rejects invalid candidate data with clear errors", () => {
  // Invalid schema: missing required 'name' and invalid yearsExperience string
  const invalidData = {
    candidates: [
      {
        member: {
          id: "CAND-999",
          jobRole: "Developer",
          yearsExperience: "five", // string instead of number
          education: "BS",
          status: "ACTIVE",
        },
        missions: [],
        signals: { commitDays: 5, missionsCompleted: 2, missionsFirstTry: 1 },
      },
    ],
  };

  const validation = validateCandidatesData(invalidData);
  assert.strictEqual(validation.success, false, "Validation should fail for invalid candidate data");

  if (!validation.success) {
    assert.ok(validation.errors.length > 0, "Errors array should contain details");
    const errorText = validation.errors.join("\n");
    assert.ok(errorText.includes("name") || errorText.includes("yearsExperience"), "Error text should detail missing/invalid fields");
  }

  assert.throws(
    () => parseCandidatesData(invalidData),
    (err: Error) => {
      return err.message.includes("Failed to load candidates");
    },
    "parseCandidatesData should throw descriptive error on invalid data"
  );
});

test("Candidate Loader - Parses single candidate profile string", () => {
  const validJsonString = JSON.stringify({
    member: {
      id: "CAND-100",
      name: "Test User",
      jobRole: "Backend Engineer",
      yearsExperience: 3,
      education: "BS Computer Science",
      status: "COMPLETED",
    },
    missions: [{ day: 1, title: "Setup", passed: true, attempts: 1 }],
    signals: { commitDays: 5, missionsCompleted: 1, missionsFirstTry: 1 },
  });

  const profile = parseSingleCandidate(validJsonString);
  assert.strictEqual(profile.member.id, "CAND-100");
  assert.strictEqual(profile.member.name, "Test User");
});

// ---------------------------------------------------------------------------
// Curriculum Loader Tests
// ---------------------------------------------------------------------------

test("Curriculum Loader - Loads curriculum.json successfully", async () => {
  const curriculum = await loadCurriculum();
  assert.ok(curriculum.cohort.length > 0, "Cohort string should be present");
  assert.strictEqual(curriculum.modules.length, 8, "Curriculum should contain 8 modules");
  assert.strictEqual(curriculum.days.length, 31, "Curriculum should contain 31 days");

  const firstDay = curriculum.days[0];
  assert.strictEqual(firstDay.day, 1);
  assert.strictEqual(firstDay.title, "VS Code & Python Environment Setup");
  assert.strictEqual(firstDay.type, "SETUP");
  assert.ok(firstDay.tools.length > 0, "Day 1 should list tools");
  assert.ok(firstDay.objectives.length > 0, "Day 1 should list objectives");
  assert.strictEqual(firstDay.module, "Environment & Tooling", "Day 1 should map to module title");
});

test("Curriculum Loader - Index and day lookup", async () => {
  const index = await getCurriculumIndex();
  assert.strictEqual(Object.keys(index).length, 31, "Index should contain 31 days");

  const day10 = await getCurriculumDay(10);
  assert.ok(day10 !== null, "Day 10 should exist");
  assert.strictEqual(day10?.day, 10);

  const invalidDay = await getCurriculumDay(99);
  assert.strictEqual(invalidDay, null, "Invalid day number should return null");
});

test("Curriculum Loader - Rejects invalid curriculum data with clear errors", () => {
  const invalidCurriculum = {
    cohort: "Invalid Cohort",
    modules: [], // empty modules array violating min(1)
    days: [
      {
        day: "one", // string instead of number
        title: "", // empty title
        type: "SETUP",
      },
    ],
  };

  const validation = validateCurriculumData(invalidCurriculum);
  assert.strictEqual(validation.success, false, "Validation should fail for invalid curriculum data");

  if (!validation.success) {
    assert.ok(validation.errors.length > 0, "Validation failure should return error list");
  }

  assert.throws(
    () => parseCurriculumData(invalidCurriculum),
    (err: Error) => {
      return err.message.includes("Failed to load curriculum");
    },
    "parseCurriculumData should throw descriptive error on invalid data"
  );
});
