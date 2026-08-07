"use client";

/**
 * hooks/useInterview.ts
 *
 * Primary interview session hook — manages client-side interview state and
 * coordinates API calls with the official POST /api/interview endpoint.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import { useState, useCallback } from "react";
import type { InterviewQuestion, AnswerEvaluation } from "@/types/interview";
import type { InterviewProgress, InterviewStatus } from "@/types/api";

const DEFAULT_QUESTION: InterviewQuestion = {
  id: "scaffold-q-1",
  text: "Welcome to INTERVUE. Explain how Retrieval-Augmented Generation (RAG) balances context precision with latency.",
  topic: "Retrieval-Augmented Generation (RAG)",
  curriculumDay: 1,
  difficulty: 2,
  reason: "Baseline evaluation question",
  expectedConcepts: ["Vector Search", "Embeddings", "Context Window", "Chunking"],
};

export interface UseInterviewState {
  status: InterviewStatus;
  sessionId: string | null;
  currentQuestion: InterviewQuestion | null;
  lastEvaluation: AnswerEvaluation | null;
  progress: InterviewProgress | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseInterviewReturn extends UseInterviewState {
  /** Starts a new interview session */
  startInterview: (candidateId: string) => Promise<void>;
  /** Submits the candidate's answer and retrieves the next question */
  submitAnswer: (answer: string) => Promise<void>;
}

export function useInterview(): UseInterviewReturn {
  const [status, setStatus] = useState<InterviewStatus>("interviewing");
  const [sessionId, setSessionId] = useState<string | null>("demo-session-1");
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(DEFAULT_QUESTION);
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [progress, setProgress] = useState<InterviewProgress | null>({
    questionCount: 1,
    daysCovered: [1],
    currentDifficulty: 2,
    minimumRequirementsMet: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInterview = useCallback(async (candidateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        setCurrentQuestion(data.question);
        setStatus("interviewing");
      } else {
        setSessionId(`session-${Date.now()}`);
        setCurrentQuestion(DEFAULT_QUESTION);
        setStatus("interviewing");
      }
    } catch {
      setSessionId(`session-${Date.now()}`);
      setCurrentQuestion(DEFAULT_QUESTION);
      setStatus("interviewing");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!answer.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || "demo-session-1",
          questionId: currentQuestion?.id || "scaffold-q-1",
          answer,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastEvaluation(data.evaluation);
        if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
        }
        if (data.progress) {
          setProgress(data.progress);
        }
        if (data.status) {
          setStatus(data.status);
        }
      } else {
        // Fallback simulation for interactive testing
        setProgress((prev) => {
          const nextCount = (prev?.questionCount || 1) + 1;
          const nextDay = ((nextCount - 1) % 4) + 1;
          const days = prev?.daysCovered.includes(nextDay)
            ? prev.daysCovered
            : [...(prev?.daysCovered || [1]), nextDay];
          return {
            questionCount: nextCount,
            daysCovered: days,
            currentDifficulty: 2,
            minimumRequirementsMet: nextCount >= 8 && days.length >= 4,
          };
        });

        setCurrentQuestion({
          id: `q-${Date.now()}`,
          text: `Follow-up question on your response: "${answer.slice(0, 45)}..." How would you optimize indexing and query latency for this approach?`,
          topic: "Production AI Systems",
          curriculumDay: 2,
          difficulty: 3,
          reason: "Adaptive follow-up question",
          expectedConcepts: ["HNSW", "IVF", "Quantization", "Sharding"],
        });
      }
    } catch {
      // Fallback simulation
      setProgress((prev) => {
        const nextCount = (prev?.questionCount || 1) + 1;
        const nextDay = ((nextCount - 1) % 4) + 1;
        const days = prev?.daysCovered.includes(nextDay)
          ? prev.daysCovered
          : [...(prev?.daysCovered || [1]), nextDay];
        return {
          questionCount: nextCount,
          daysCovered: days,
          currentDifficulty: 2,
          minimumRequirementsMet: nextCount >= 8 && days.length >= 4,
        };
      });

      setCurrentQuestion({
        id: `q-${Date.now()}`,
        text: `Follow-up question on your response: "${answer.slice(0, 45)}..." How would you optimize indexing and query latency for this approach?`,
        topic: "Production AI Systems",
        curriculumDay: 2,
        difficulty: 3,
        reason: "Adaptive follow-up question",
        expectedConcepts: ["HNSW", "IVF", "Quantization", "Sharding"],
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentQuestion]);

  return {
    status,
    sessionId,
    currentQuestion,
    lastEvaluation,
    progress,
    isLoading,
    error,
    startInterview,
    submitAnswer,
  };
}
