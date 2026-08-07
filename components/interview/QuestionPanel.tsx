/**
 * components/interview/QuestionPanel.tsx
 *
 * Displays the current interview question.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Add entrance animation when a new question is displayed.
 * TODO: Show curriculumDay badge and difficulty indicator inline.
 */

import type { InterviewQuestion } from "@/types/interview";
import { LoadingState } from "@/components/ui/LoadingState";

interface QuestionPanelProps {
  question: InterviewQuestion | null;
  isLoading: boolean;
}

export function QuestionPanel({ question, isLoading }: QuestionPanelProps) {
  if (isLoading) {
    return <LoadingState message="Preparing your question…" className="py-8" />;
  }

  if (!question) {
    return (
      <div className="text-center text-neutral-500 py-8">
        No question available.
      </div>
    );
  }

  return (
    <article
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-violet-400 font-mono tracking-wider uppercase">
          Day {question.curriculumDay}
        </span>
        <span className="text-white/20">·</span>
        <span className="text-xs text-neutral-500 truncate">{question.topic}</span>
      </div>
      <p
        id="current-question-text"
        className="text-lg sm:text-xl text-white leading-relaxed"
      >
        {question.text}
      </p>
    </article>
  );
}
