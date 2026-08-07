/**
 * components/interview/InterviewProgress.tsx
 *
 * Shows interview progress: question count, curriculum days covered,
 * and whether minimum requirements are met.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Animate day badges when a new day is added.
 */

import { ProgressIndicator } from "@/components/ui/ProgressIndicator";

interface InterviewProgressProps {
  questionCount: number;
  daysCovered: number[];
  minimumRequirementsMet: boolean;
  /** Minimum questions required (default: 8) */
  minimumQuestions?: number;
  /** Minimum days required (default: 4) */
  minimumDays?: number;
}

export function InterviewProgress({
  questionCount,
  daysCovered,
  minimumRequirementsMet,
  minimumQuestions = 8,
  minimumDays = 4,
}: InterviewProgressProps) {
  return (
    <div className="flex flex-col gap-3 w-full" aria-label="Interview progress">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          Questions:{" "}
          <span className="text-white font-mono">{questionCount}</span>
          <span className="text-neutral-700"> / {minimumQuestions} min</span>
        </span>
        <div className="flex items-center gap-2">
          {minimumRequirementsMet && (
            <span className="text-emerald-400 text-xs">✓ Requirements met</span>
          )}
          <span>
            Days:{" "}
            <span className="text-white font-mono">{daysCovered.length}</span>
            <span className="text-neutral-700"> / {minimumDays} min</span>
          </span>
        </div>
      </div>
      <ProgressIndicator
        value={questionCount}
        max={minimumQuestions}
        label="Questions"
      />
      {/* Day badges */}
      {daysCovered.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1" aria-label="Curriculum days covered">
          {daysCovered.map((day) => (
            <span
              key={day}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-xs font-mono"
            >
              D{day}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
