/**
 * tests/api/interview.test.ts
 *
 * Integration tests for the Interview Controller, Session Manager, and Persistent Storage.
 *
 * Owner: Member 2 (Backend / API)
 */

import { describe, it, expect } from "vitest";
import {
  initializeInternalInterview,
  processAnswer,
  getFinalReport,
} from "@/server/interview-controller";
import {
  createSession,
  requireSession,
  sessionExists,
  terminateSession,
} from "@/server/session-manager";

describe("Redis Session Manager Integration", () => {
  it("should create, save, retrieve, and delete session state reliably", async () => {
    const testSessionId = `test-sess-${Date.now()}`;
    const candidateId = "alex_chen";

    // 1. Create Session
    const createdId = await createSession({
      sessionId: testSessionId,
      candidateId,
      initialTopic: "RAG Core",
      initialDifficulty: 3,
    });
    expect(createdId).toBe(testSessionId);

    // 2. Check Existence
    const exists = await sessionExists(testSessionId);
    expect(exists).toBe(true);

    // 3. Require Session & Check Values
    const state = await requireSession(testSessionId);
    expect(state).toBeDefined();
    expect(state.sessionId).toBe(testSessionId);
    expect(state.candidateId).toBe(candidateId);
    expect(state.difficulty).toBe(3);

    // 4. Terminate Session
    await terminateSession(testSessionId);
    const existsAfterDelete = await sessionExists(testSessionId);
    expect(existsAfterDelete).toBe(false);
  });
});

describe("Interview Pipeline Controller End-to-End Flow", () => {
  it("should execute start, answer turn, progress update, and report generation", async () => {
    // 1. Initialize Interview
    const startData = await initializeInternalInterview("test_candidate_1");

    expect(startData).toBeDefined();
    expect(startData.status).toBe("interviewing");
    expect(startData.sessionId).toBeTruthy();
    expect(startData.question).toBeDefined();
    expect(startData.question.text).toBeTruthy();

    const sessionId = startData.sessionId;

    // 2. Process Answer Turn 1
    const answerResult = await processAnswer(
      sessionId,
      startData.question.id,
      "I would implement hybrid retrieval combining dense vector search and BM25 text search with Reciprocal Rank Fusion."
    );

    expect(answerResult).toBeDefined();
    expect(["interviewing", "completed"]).toContain(answerResult.status);
    expect(answerResult.evaluation).toBeDefined();
    expect(answerResult.progress.questionCount).toBeGreaterThanOrEqual(1);

    // 3. Fetch Final Report
    const reportData = await getFinalReport(sessionId);

    expect(reportData).toBeDefined();
    expect(reportData.feedback).toBeDefined();
    expect(reportData.feedback.overallScore).toBeGreaterThanOrEqual(0);
    expect(reportData.feedback.overallScore).toBeLessThanOrEqual(100);
    expect(reportData.questionHistory.length).toBeGreaterThanOrEqual(1);
  });
});
