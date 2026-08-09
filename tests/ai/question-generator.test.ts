/**
 * tests/ai/question-generator.test.ts
 *
 * Unit tests for the Adaptive Question Generator.
 *
 * Owner: Member 3 (AI / Prompt Engineering)
 */

import { describe, it, expect } from "vitest";
import { generateQuestion } from "@/ai/question-generator";
import type { InterviewState } from "@/types/interview";
import type { InterviewPlan } from "@/ai/interview-planner";
import type { CurriculumDay } from "@/types/curriculum";

const mockPlan: InterviewPlan = {
  targetDays: [1, 2, 3, 4],
  startingDifficulty: 2,
  topicOrder: ["VS Code & Python Environment Setup", "RAG & Hybrid Retrieval", "Vector DB & Indexing"],
  minimumQuestions: 8,
  deprioritisedTopics: [],
  rationale: "Comprehensive evaluation plan",
};

const mockState: InterviewState = {
  sessionId: "test-qgen-session",
  candidateId: "alex_chen",
  questionCount: 0,
  daysCovered: [],
  currentTopic: "VS Code & Python Environment Setup",
  difficulty: 2,
  strengths: [],
  knowledgeGaps: [],
  misconceptions: [],
  candidateClaims: [],
  contradictions: [],
  knowledgeTwin: [],
  questionHistory: [],
};

const mockCurriculum: CurriculumDay[] = [
  {
    day: 1,
    module: "Setup",
    topic: "VS Code & Python Environment Setup",
    concepts: ["venv", "pip", "python"],
    learningObjectives: ["Understand virtual environments"],
    tools: ["vscode", "python"],
  },
  {
    day: 2,
    module: "RAG Core",
    topic: "RAG & Hybrid Retrieval",
    concepts: ["BM25", "Vector Search", "RRF"],
    learningObjectives: ["Understand hybrid search"],
    tools: ["chromadb", "langchain"],
  },
];

describe("generateQuestion Engine", () => {
  it("should generate a question respecting state difficulty and topic", async () => {
    const question = await generateQuestion(mockState, mockPlan, mockCurriculum);

    expect(question).toBeDefined();
    expect(question.id).toBeTruthy();
    expect(question.text).toBeTruthy();
    expect(question.difficulty).toBe(mockState.difficulty);
    expect(question.expectedConcepts.length).toBeGreaterThan(0);
  });

  it("should avoid duplicate questions existing in questionHistory", async () => {
    const q1 = await generateQuestion(mockState, mockPlan, mockCurriculum);

    const stateWithHistory: InterviewState = {
      ...mockState,
      questionHistory: [
        {
          question: q1,
          answer: "Some answer",
          evaluation: {
            correctness: 5,
            reasoning: 5,
            depth: 5,
            communication: 5,
            engineering: 5,
            coveredConcepts: [],
            missingConcepts: [],
            misconceptions: [],
            nextAction: "follow_up",
          },
        },
      ],
    };

    const q2 = await generateQuestion(stateWithHistory, mockPlan, mockCurriculum);

    expect(q2).toBeDefined();
    expect(q2.id).not.toBe(q1.id);
  });
});
