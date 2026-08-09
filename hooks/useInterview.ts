"use client";

/**
 * hooks/useInterview.ts
 *
 * Primary interview session hook — manages client-side interview state and
 * coordinates API calls with the official POST /api/interview endpoint.
 *
 * Supports session persistence & restoration across page refreshes.
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
  /** Starts a new interview session or restores an active session */
  startInterview: (
    candidateId?: string,
    existingSessionId?: string | null,
    options?: { forceNew?: boolean }
  ) => Promise<void>;
  /** Restores an active interview session from the backend without calling startInterview */
  restoreSession: (targetSessionId: string) => Promise<boolean>;
  /** Resets session state and starts a completely fresh interview starting at Q1 */
  startNewInterview: (candidateId?: string) => Promise<void>;
  /** Submits the candidate's answer and retrieves the next question */
  submitAnswer: (answer: string) => Promise<void>;
}

export function useInterview(): UseInterviewReturn {
  const [status, setStatus] = useState<InterviewStatus>("interviewing");
  const [sessionId, setSessionId] = useState<string | null>(null);
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

  /** Restores active session from backend GET /api/interview/session */
  const restoreSession = useCallback(async (targetSessionId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/interview/session?sessionId=${encodeURIComponent(targetSessionId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hasSession && data.currentQuestion) {
          setSessionId(data.sessionId);
          if (typeof window !== "undefined") {
            localStorage.setItem("intervue_session_id", data.sessionId);
          }
          setCurrentQuestion(data.currentQuestion);
          if (data.lastEvaluation !== undefined) setLastEvaluation(data.lastEvaluation);
          if (data.progress) setProgress(data.progress);
          if (data.status) setStatus(data.status);
          return true;
        }
      }
    } catch (err) {
      console.error("[useInterview] Session restore error:", err);
    } finally {
      setIsLoading(false);
    }
    return false;
  }, []);

  const startInterview = useCallback(
    async (
      candidateId: string = "candidate_1",
      existingSessionId?: string | null,
      options?: { forceNew?: boolean }
    ) => {
      setIsLoading(true);
      setError(null);

      // Check active sessionId in localStorage or URL search params if not provided
      let activeSessionId = existingSessionId ?? sessionId;
      if (!activeSessionId && typeof window !== "undefined" && !options?.forceNew) {
        const urlParams = new URLSearchParams(window.location.search);
        activeSessionId = urlParams.get("sessionId") || localStorage.getItem("intervue_session_id");
      }

      try {
        const res = await fetch("/api/interview/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId,
            sessionId: options?.forceNew ? null : activeSessionId,
            forceNew: options?.forceNew,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.sessionId) {
            setSessionId(data.sessionId);
            if (typeof window !== "undefined") {
              localStorage.setItem("intervue_session_id", data.sessionId);
            }
          }
          if (data.question) setCurrentQuestion(data.question);
          if (data.lastEvaluation !== undefined) setLastEvaluation(data.lastEvaluation);
          if (data.progress) setProgress(data.progress);
          if (data.status) setStatus(data.status);
        } else {
          const fallbackSessionId = activeSessionId || `session-${Date.now()}`;
          setSessionId(fallbackSessionId);
          setCurrentQuestion(DEFAULT_QUESTION);
          setStatus("interviewing");
        }
      } catch {
        const fallbackSessionId = activeSessionId || `session-${Date.now()}`;
        setSessionId(fallbackSessionId);
        setCurrentQuestion(DEFAULT_QUESTION);
        setStatus("interviewing");
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!answer.trim()) return;
      setIsLoading(true);
      setError(null);

      let activeSessionId = sessionId;
      if (!activeSessionId && typeof window !== "undefined") {
        activeSessionId = localStorage.getItem("intervue_session_id");
      }
      if (!activeSessionId) {
        activeSessionId = `session-${Date.now()}`;
        setSessionId(activeSessionId);
        if (typeof window !== "undefined") {
          localStorage.setItem("intervue_session_id", activeSessionId);
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch("/api/interview/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            questionId: currentQuestion?.id || "q-1",
            answer,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          console.log("API RESPONSE", data);
          console.log("LOCAL RESPONSE", data);
          console.log("ANSWER RESPONSE", data);
          console.log("NEXT QUESTION", data.nextQuestion);
          if (data.evaluation) {
            setLastEvaluation(data.evaluation);
          }
          if (data.nextQuestion) {
            setCurrentQuestion(data.nextQuestion);
          }
          if (data.progress) {
            setProgress(data.progress);
          }
          if (data.done === true || data.status === "completed") {
            setStatus("completed");
          } else if (data.status) {
            setStatus(data.status);
          }
        } else {
          console.warn("[useInterview] Answer API non-200 response, invoking adaptive turn fallback");
          // Local simulation fallback for handled state
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
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err?.name === "AbortError") {
          console.warn("[useInterview] Answer submission timed out after 15s. Invoking adaptive fallback.");
        } else {
          console.error("[useInterview] submitAnswer error:", err);
        }
        // Local simulation fallback for handled error states
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
    },
    [sessionId, currentQuestion]
  );

  const startNewInterview = useCallback(
    async (candidateId: string = "candidate_1") => {
      setIsLoading(true);
      setError(null);

      if (typeof window !== "undefined") {
        localStorage.removeItem("intervue_session_id");
      }

      setSessionId(null);
      setLastEvaluation(null);
      setCurrentQuestion(null);
      setStatus("interviewing");
      setProgress({
        questionCount: 1,
        daysCovered: [1],
        currentDifficulty: 2,
        minimumRequirementsMet: false,
      });

      try {
        const res = await fetch("/api/interview/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.sessionId) {
            setSessionId(data.sessionId);
            if (typeof window !== "undefined") {
              localStorage.setItem("intervue_session_id", data.sessionId);
            }
          }
          if (data.question) setCurrentQuestion(data.question);
          if (data.progress) setProgress(data.progress);
          setStatus("interviewing");
        } else {
          const newSessionId = `session-${Date.now()}`;
          setSessionId(newSessionId);
          if (typeof window !== "undefined") {
            localStorage.setItem("intervue_session_id", newSessionId);
          }
          setCurrentQuestion(DEFAULT_QUESTION);
          setStatus("interviewing");
        }
      } catch {
        const newSessionId = `session-${Date.now()}`;
        setSessionId(newSessionId);
        if (typeof window !== "undefined") {
          localStorage.setItem("intervue_session_id", newSessionId);
        }
        setCurrentQuestion(DEFAULT_QUESTION);
        setStatus("interviewing");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    status,
    sessionId,
    currentQuestion,
    lastEvaluation,
    progress,
    isLoading,
    error,
    startInterview,
    restoreSession,
    startNewInterview,
    submitAnswer,
  };
}
