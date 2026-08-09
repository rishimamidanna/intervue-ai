"use client";

/**
 * components/interview/InterviewRoom.tsx
 *
 * Full-screen INTERVUE AI Live Interview Command Center Dashboard.
 * Integrates Sidebar, InterviewHeader, QuestionCard, AnswerCard, RobotViewer,
 * IntelligencePanel, and AnalysisBar into a desktop AI command center interface.
 *
 * Milestone 2.2: Interactive Adaptive Interview Flow & Mock Evaluation Engine.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { InterviewHeader } from "./InterviewHeader";
import { QuestionCard } from "./QuestionCard";
import { AnswerCard } from "./AnswerCard";
import { RobotViewer } from "./RobotViewer";
import { IntelligencePanel, Concept, Gap } from "./IntelligencePanel";
import { AnalysisBar } from "./AnalysisBar";

import { useInterview } from "@/hooks/useInterview";

export function InterviewRoom() {
  const router = useRouter();
  const {
    status,
    sessionId,
    currentQuestion,
    lastEvaluation,
    progress,
    isLoading: isApiLoading,
    startInterview,
    submitAnswer,
  } = useInterview();

  const [submittedAnswer, setSubmittedAnswer] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Initialize session via backend API on mount
  useEffect(() => {
    startInterview("candidate_1");
  }, [startInterview]);

  // Redirect to report page when interview status changes to completed
  useEffect(() => {
    if (status === "completed" && sessionId) {
      router.push(`/report?sessionId=${encodeURIComponent(sessionId)}`);
    }
  }, [status, sessionId, router]);

  // Live timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendAnswer = async (answer: string) => {
    setSubmittedAnswer(answer);
    setIsAnalyzing(true);
    try {
      await submitAnswer(answer);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Derive intelligence metrics from real API evaluation
  const questionNumber = progress?.questionCount ?? 1;
  const totalQuestions = Math.max(8, progress?.questionCount ?? 1);
  const currentDifficulty = progress?.currentDifficulty ?? currentQuestion?.difficulty ?? 2;

  const currentDifficultyTrend: "Increasing" | "Stable" | "Decreasing" | "Mastered" =
    lastEvaluation?.nextAction === "increase_difficulty"
      ? "Increasing"
      : lastEvaluation?.nextAction === "decrease_difficulty"
      ? "Decreasing"
      : lastEvaluation?.nextAction === "new_topic"
      ? "Mastered"
      : "Stable";

  const currentConfidence = lastEvaluation
    ? Math.min(
        99,
        Math.max(
          20,
          Math.round(
            (lastEvaluation.correctness * 3.5 +
              lastEvaluation.reasoning * 2.5 +
              lastEvaluation.depth * 2.0 +
              lastEvaluation.communication * 1.0 +
              lastEvaluation.engineering * 1.0) *
              10
          )
        )
      )
    : 85;

  const currentConcepts: Concept[] =
    lastEvaluation?.coveredConcepts && lastEvaluation.coveredConcepts.length > 0
      ? lastEvaluation.coveredConcepts.map((c, i) => ({
          name: c,
          score: `${Math.max(80, 98 - i * 3)}%`,
        }))
      : (currentQuestion?.expectedConcepts || ["Core Fundamentals", "System Design"]).map((c, i) => ({
          name: c,
          score: `${Math.max(75, 92 - i * 4)}%`,
        }));

  const currentGaps: Gap[] =
    lastEvaluation?.missingConcepts && lastEvaluation.missingConcepts.length > 0
      ? lastEvaluation.missingConcepts.map((g) => ({
          name: g,
          severity: "Medium" as const,
          color: "text-amber-400",
        }))
      : [];

  const questionText = currentQuestion?.text || "Initializing your adaptive technical interview question...";
  const topic = currentQuestion?.topic || "Technical Interview";
  const tags = currentQuestion?.expectedConcepts || [topic, "AI Architecture"];

  return (
    <div className="h-dvh overflow-hidden bg-[#030106] p-3 font-sans text-white selection:bg-purple-500/30">
      <div className="flex h-full min-h-0 gap-3">
        {/* Fixed glass navigation rail */}
        <div className="hidden w-[216px] shrink-0 lg:block [&>aside]:h-full [&>aside]:min-h-0 [&>aside]:w-full [&>aside]:rounded-2xl [&>aside]:border [&>aside]:border-purple-900/30">
          <Sidebar />
        </div>

        {/* Center interview surface and independent intelligence rail */}
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 min-[1360px]:grid-cols-[minmax(0,1fr)_minmax(340px,360px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(380px,420px)]">
          <main className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden [&>header]:mb-0">
            <InterviewHeader
              currentQuestion={questionNumber}
              totalQuestions={totalQuestions}
              timerFormatted={formatTimer(timerSeconds)}
            />

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.92fr)]">
              <section className="flex min-h-0 flex-col justify-start gap-3 overflow-y-auto pr-1">
                <QuestionCard
                  questionText={questionText}
                  tags={tags}
                  topic={topic}
                  difficulty={currentDifficulty}
                  questionNumber={questionNumber}
                  totalQuestions={totalQuestions}
                />
                <AnswerCard
                  submittedAnswer={submittedAnswer}
                  onSendAnswer={handleSendAnswer}
                  isAnalyzing={isAnalyzing || isApiLoading}
                />
              </section>

              <section className="flex min-h-[460px] min-w-0">
                <RobotViewer />
              </section>
            </div>

            <AnalysisBar isAnalyzing={isAnalyzing || isApiLoading} />
          </main>

          <div className="hidden min-h-0 overflow-y-auto pr-1 min-[1360px]:block [&>aside]:w-full">
            <IntelligencePanel
              difficulty={currentDifficulty}
              difficultyTrend={currentDifficultyTrend}
              confidence={currentConfidence}
              concepts={currentConcepts}
              gaps={currentGaps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
