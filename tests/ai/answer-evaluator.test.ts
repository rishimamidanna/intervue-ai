/**
 * tests/ai/answer-evaluator.test.ts
 *
 * Unit tests for the Answer Evaluation Engine.
 * Tests pre-LLM heuristic guardrails and fallback evaluation logic without calling Gemini API.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import { describe, it, expect } from "vitest";
import { evaluateAnswer } from "@/ai/answer-evaluator";
import type { InterviewQuestion, InterviewState } from "@/types/interview";
import type { RetrievedCurriculumContext } from "@/server/curriculum-service";

const mockQuestion: InterviewQuestion = {
  id: "test-q-1",
  text: "Explain how RAG differs from fine-tuning in context retrieval.",
  topic: "RAG & Hybrid Retrieval",
  curriculumDay: 1,
  difficulty: 2,
  reason: "Foundational RAG concept",
  expectedConcepts: ["retrieval", "vector similarity", "context window", "fine-tuning cost"],
};

const mockState: InterviewState = {
  sessionId: "test-session-123",
  candidateId: "alex_chen",
  questionCount: 1,
  daysCovered: [1],
  currentTopic: "RAG & Hybrid Retrieval",
  difficulty: 2,
  strengths: [],
  knowledgeGaps: [],
  misconceptions: [],
  candidateClaims: [],
  contradictions: [],
  knowledgeTwin: [],
  questionHistory: [],
};

const mockRetrievedContext: RetrievedCurriculumContext = {
  relevantTopic: "RAG & Hybrid Retrieval",
  learningObjectives: ["Understand vector retrieval and fine-tuning trade-offs"],
  keyConcepts: ["BM25", "Vector Search", "RRF"],
  relatedConcepts: ["Context Window Optimization"],
  difficultyContext: "Intermediate level difficulty",
  matchedDays: [
    {
      day: 1,
      module: "RAG Core",
      topic: "RAG & Hybrid Retrieval",
      learningObjectives: ["Understand hybrid search"],
      tools: ["chromadb"],
      concepts: ["BM25", "Vector Search"],
    },
  ],
};

describe("evaluateAnswer Guardrails & Heuristics", () => {
  it("should catch question repetition and penalize correctness to 0", async () => {
    const repeatedAnswer = mockQuestion.text;
    const result = await evaluateAnswer(mockQuestion, repeatedAnswer, mockState, mockRetrievedContext);

    expect(result.correctness).toBe(0);
    expect(result.nextAction).toBe("probe");
    expect(result.misconceptions).toContain("Copied or echoed the question text instead of answering");
  });

  it("should catch 'I don't know' / non-answers and return correctness 1", async () => {
    const nonAnswer = "idk";
    const result = await evaluateAnswer(mockQuestion, nonAnswer, mockState, mockRetrievedContext);

    expect(result.correctness).toBe(1);
    expect(result.nextAction).toBe("probe");
  });

  it("should catch shallow single-word answers and return correctness 2", async () => {
    const shallowAnswer = "vectors";
    const result = await evaluateAnswer(mockQuestion, shallowAnswer, mockState, mockRetrievedContext);

    expect(result.correctness).toBe(2);
    expect(result.nextAction).toBe("probe");
  });

  it("should evaluate a technical answer using heuristic fallback when Gemini API is unconfigured", async () => {
    const technicalAnswer = "RAG retrieves relevant passage embeddings using vector search and BM25 hybrid ranking to inject ground truth into the context window, whereas fine-tuning trains model weights.";
    const result = await evaluateAnswer(mockQuestion, technicalAnswer, mockState, mockRetrievedContext);

    expect(result.correctness).toBeGreaterThanOrEqual(4);
    expect(result.coveredConcepts.length).toBeGreaterThan(0);
    expect(["follow_up", "new_topic", "increase_difficulty", "decrease_difficulty", "probe"]).toContain(result.nextAction);
  });
});
