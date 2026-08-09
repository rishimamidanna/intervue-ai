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
import { getState } from "@/server/interview-state";

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

  it("should restore existing session when sessionId is provided on re-initialization (page refresh)", async () => {
    // 1. Start Initial Interview
    const startData = await initializeInternalInterview("test_candidate_restore");
    const sessionId = startData.sessionId;
    const firstQId = startData.question.id;

    // 2. Submit Answer for Turn 1
    const answerResult = await processAnswer(
      sessionId,
      firstQId,
      "Dense embeddings represent semantic vectors while HNSW graph performs approximate nearest neighbor search."
    );

    // 3. Simulate Page Refresh by calling initializeInternalInterview with existing sessionId
    const restoredData = await initializeInternalInterview("test_candidate_restore", sessionId);

    expect(restoredData.sessionId).toBe(sessionId);
    expect(restoredData.status).toBe("interviewing");
    expect(restoredData.progress?.questionCount).toBeGreaterThanOrEqual(1);
    expect(restoredData.question).toBeDefined();
  });

  it("should complete interview and enforce 8-question limit (reject Q9 generation)", async () => {
    // 1. Start Interview
    let sessionData = await initializeInternalInterview("test_candidate_max8");
    const sessionId = sessionData.sessionId;

    // 2. Answer 8 Questions consecutively
    for (let i = 1; i <= 8; i++) {
      const qId = sessionData.question.id;
      const res = await processAnswer(
        sessionId,
        qId,
        `Answer turn ${i}: Explaining technical system architecture, vector search, and latency trade-offs.`
      );
      if (i < 8) {
        expect(res.status).toBe("interviewing");
        expect(res.nextQuestion).not.toBeNull();
        sessionData.question = res.nextQuestion!;
      } else {
        // On Turn 8 submission
        expect(res.status).toBe("completed");
        expect(res.nextQuestion).toBeNull();
        expect(res.progress.questionCount).toBe(8);
      }
    }

    // 3. Attempt Turn 9 submission -> Should be rejected / return completed state
    const turn9Res = await processAnswer(
      sessionId,
      "dummy-q-9",
      "Attempting turn 9 after completion."
    );

    expect(turn9Res.status).toBe("completed");
    expect(turn9Res.nextQuestion).toBeNull();
    expect(turn9Res.progress.questionCount).toBe(8);
  });

  it("should create a fresh interview session when forceNew / reset is triggered", async () => {
    const session1 = await initializeInternalInterview("candidate_test_reset");
    expect(session1.sessionId).toBeDefined();

    // Force create new session
    const session2 = await initializeInternalInterview("candidate_test_reset", undefined, true);
    expect(session2.sessionId).toBeDefined();
    expect(session2.sessionId).not.toBe(session1.sessionId);
    expect(session2.status).toBe("interviewing");
    expect(session2.progress?.questionCount).toBe(1);
  });

  it("should calculate final score once on completion and yield identical scores across endpoints", async () => {
    let sessionData = await initializeInternalInterview("test_score_consistency");
    const sessionId = sessionData.sessionId;

    for (let i = 1; i <= 8; i++) {
      const qId = sessionData.question.id;
      const res = await processAnswer(
        sessionId,
        qId,
        `Turn ${i} answer: Systematic explanation of model architecture, vector embeddings, and indexing.`
      );
      if (res.nextQuestion) sessionData.question = res.nextQuestion;
    }

    const state = await getState(sessionId);
    expect(state?.finalScore).toBeDefined();
    const expectedScore = state!.finalScore!.overallScore;
    expect(expectedScore).toBeGreaterThan(0);

    const reportRes = await getFinalReport(sessionId);
    expect(reportRes.feedback.overallScore).toBe(expectedScore);
  });

  it("should process answers reliably and handle invalid session errors cleanly", async () => {
    await expect(
      processAnswer("non_existent_session_xyz", "q-1", "Test answer text")
    ).rejects.toThrow();
  });

  it("should verify complete end-to-end session state data pipeline integrity across turns", async () => {
    const sessionData = await initializeInternalInterview("candidate_e2e_audit");
    const sessionId = sessionData.sessionId;

    const turn1 = await processAnswer(
      sessionId,
      sessionData.question.id,
      "RAG reduces hallucinations by grounding responses in dense vector space search results."
    );

    expect(turn1.evaluation).toBeDefined();
    expect(turn1.evaluation.correctness).toBeGreaterThanOrEqual(0);
    expect(turn1.progress.questionCount).toBe(2);

    const state = await getState(sessionId);
    expect(state).not.toBeNull();
    expect(state?.questionHistory.length).toBe(1);
    expect(state?.knowledgeTwin).toBeDefined();
  });
});
