"use client";

/**
 * hooks/useInterview.ts
 *
 * Primary interview session hook — manages client-side interview state and
 * coordinates API calls with the official POST /api/interview endpoint.
 *
 * Uses the official hackathon API:
 * - Start: POST /api/interview { sessionId, candidate }
 * - Turn:  POST /api/interview { sessionId, message }
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import { useState, useCallback } from "react";
import type { InterviewQuestion, AnswerEvaluation } from "@/types/interview";
import type { InterviewProgress, InterviewStatus } from "@/types/api";
import type { CandidateProfile } from "@/types/candidate";

// Default candidate profile (CAND-001: Sarah Johnson from candidates.json)
const DEFAULT_CANDIDATE: CandidateProfile = {
  member: {
    id: "CAND-001",
    name: "Sarah Johnson",
    jobRole: "Senior Data Engineer",
    yearsExperience: 9,
    education: "MS Computer Science",
    status: "COMPLETED",
  },
  missions: [
    { day: 7,  title: "Embeddings Explained",              passed: true,  attempts: 1 },
    { day: 8,  title: "Vector Databases Overview",         passed: true,  attempts: 1 },
    { day: 10, title: "Retrieval & Matching Engine",       passed: true,  attempts: 2 },
    { day: 12, title: "Prompt Engineering Fundamentals",   passed: true,  attempts: 4 },
    { day: 16, title: "Chatbot Backend & API Integration", passed: true,  attempts: 1 },
    { day: 22, title: "Multi-Agent Orchestration",         passed: true,  attempts: 2 },
    { day: 23, title: "Model Context Protocol (MCP)",      passed: true,  attempts: 2 },
    { day: 28, title: "Docker & Kubernetes Deployment",    passed: true,  attempts: 3 },
    { day: 29, title: "Monitoring, Logging & Observability", skipped: true },
    { day: 31, title: "Capstone Project & Final Demo",     passed: true,  attempts: 1 },
  ],
  signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 },
};

const DEFAULT_QUESTION: InterviewQuestion = {
  id: "scaffold-q-1",
  text: "Welcome to INTERVUE. Initializing your adaptive AI interview session...",
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
  startInterview: (candidateId?: string, candidateProfile?: CandidateProfile) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
}

export function useInterview(): UseInterviewReturn {
  const [status, setStatus] = useState<InterviewStatus>("interviewing");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(DEFAULT_QUESTION);
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [progress, setProgress] = useState<InterviewProgress | null>({
    questionCount: 0,
    daysCovered: [],
    currentDifficulty: 2,
    minimumRequirementsMet: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInterview = useCallback(
    async (_candidateId?: string, candidateProfile?: CandidateProfile) => {
      setIsLoading(true);
      setError(null);

      // Generate a unique session ID
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      try {
        // Store session ID for dashboard / report pages
        if (typeof window !== "undefined") {
          localStorage.setItem("intervue_session_id", newSessionId);
        }

        const candidate = candidateProfile ?? DEFAULT_CANDIDATE;

        // Call the official hackathon API: POST /api/interview with candidate payload
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: newSessionId,
            candidate,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setSessionId(newSessionId);
          // API returns { reply: "question text", done: false }
          if (data.reply) {
            setCurrentQuestion({
              id: `q-${Date.now()}`,
              text: data.reply,
              topic: "AI Engineering",
              curriculumDay: 1,
              difficulty: 2,
              reason: "AI-generated opening question",
              expectedConcepts: [],
            });
          }
          setStatus("interviewing");
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error("[useInterview] Start failed:", errData);
          setError("Failed to start interview. Please refresh and try again.");
          setSessionId(newSessionId);
          setCurrentQuestion(DEFAULT_QUESTION);
        }
      } catch (err) {
        console.error("[useInterview] Network error on start:", err);
        setError("Network error. Is the server running?");
        setSessionId(newSessionId);
        setCurrentQuestion(DEFAULT_QUESTION);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!answer.trim()) return;
      setIsLoading(true);
      setError(null);

      const activeSessionId = sessionId ?? `session-${Date.now()}`;

      try {
        // Call the official hackathon API: POST /api/interview with message payload
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId,
            message: answer,
          }),
        });

        if (res.ok) {
          const data = await res.json();

          // API returns { reply, done, evaluation?, gaps?, concepts?, progress? }
          if (data.done === true) {
            // Interview complete — redirect to report
            setStatus("completed");
            if (data.feedback && typeof window !== "undefined") {
              localStorage.setItem(
                `intervue_feedback_${activeSessionId}`,
                JSON.stringify(data.feedback)
              );
            }
          } else if (data.reply) {
            // Store rich evaluation data for Knowledge Gap Detection panel
            if (data.evaluation) {
              setLastEvaluation({
                correctness: data.evaluation.correctness ?? 5,
                reasoning: data.evaluation.reasoning ?? 5,
                depth: data.evaluation.depth ?? 5,
                communication: data.evaluation.communication ?? 5,
                engineering: data.evaluation.engineering ?? 5,
                nextAction: data.evaluation.nextAction ?? "continue",
                coveredConcepts: data.evaluation.coveredConcepts ?? [],
                missingConcepts: data.evaluation.missingConcepts ?? [],
                misconceptions: data.evaluation.misconceptions ?? [],
              });
            }

            // Update progress if provided
            if (data.progress) {
              setProgress({
                questionCount: data.progress.questionCount ?? (progress?.questionCount ?? 0) + 1,
                daysCovered: data.progress.daysCovered ?? progress?.daysCovered ?? [],
                currentDifficulty: data.progress.currentDifficulty ?? progress?.currentDifficulty ?? 2,
                minimumRequirementsMet: data.progress.minimumRequirementsMet ?? false,
              });
            } else {
              setProgress((prev) => ({
                questionCount: (prev?.questionCount ?? 0) + 1,
                daysCovered: prev?.daysCovered ?? [],
                currentDifficulty: prev?.currentDifficulty ?? 2,
                minimumRequirementsMet: (prev?.questionCount ?? 0) + 1 >= 8,
              }));
            }

            // Set next question
            setCurrentQuestion((prev) => ({
              id: `q-${Date.now()}`,
              text: data.reply,
              topic: prev?.topic ?? "AI Engineering",
              curriculumDay: (prev?.curriculumDay ?? 1) + 1,
              difficulty: data.progress?.currentDifficulty ?? prev?.difficulty ?? 2,
              reason: "AI-generated follow-up",
              expectedConcepts: data.concepts ?? [],
            }));
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error("[useInterview] Answer submission failed:", errData);
          setError("Failed to process answer. Please try again.");
        }
      } catch (err) {
        console.error("[useInterview] Network error on answer:", err);
        setError("Network error while submitting answer.");
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
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
    submitAnswer,
  };
}
