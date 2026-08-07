"use client";

/**
 * components/interview/InterviewChamber.tsx
 *
 * The primary interview UI container.
 * Composes QuestionPanel, AnswerInput, InterviewProgress,
 * DifficultyIndicator, and VoiceControls into the interview layout.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import { QuestionPanel } from "./QuestionPanel";
import { AnswerInput } from "./AnswerInput";
import { InterviewProgress } from "./InterviewProgress";
import { DifficultyIndicator } from "./DifficultyIndicator";
import { VoiceControls } from "./VoiceControls";
import { useInterview } from "@/hooks/useInterview";

export function InterviewChamber() {
  const {
    currentQuestion,
    progress,
    isLoading,
    error,
    submitAnswer,
  } = useInterview();

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-white">
            INTER<span className="text-violet-400">VUE</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono">
            Interview Chamber
          </span>
        </div>
        <DifficultyIndicator
          difficulty={currentQuestion?.difficulty || progress?.currentDifficulty || 2}
          className="hidden sm:flex"
        />
      </header>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <InterviewProgress
          questionCount={progress?.questionCount || 1}
          daysCovered={progress?.daysCovered || [1]}
          minimumRequirementsMet={progress?.minimumRequirementsMet || false}
        />
      </div>

      {/* Subtitle / Status */}
      <div className="px-6 pt-2 text-center">
        <span className="text-xs text-neutral-500 font-mono">
          Frontend scaffold ready.
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-6 pt-2 text-center">
          <span className="text-xs text-red-400 font-mono">{error}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-8 max-w-3xl mx-auto w-full">
        <QuestionPanel question={currentQuestion} isLoading={isLoading} />
        <AnswerInput
          onSubmit={submitAnswer}
          isSubmitting={isLoading}
          disabled={isLoading}
        />
        <VoiceControls />
      </main>
    </div>
  );
}
