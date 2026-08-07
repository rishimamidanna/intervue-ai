/**
 * components/report/ScoreOverview.tsx
 *
 * Displays the overall interview score and dimension breakdown.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Add animated score counter using Framer Motion.
 * TODO: Add radar chart visualising all 5 dimensions.
 */

import type { FinalFeedback } from "@/types/feedback";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { getScoringWeights } from "@/lib/scoring";

interface ScoreOverviewProps {
  feedback: FinalFeedback;
  /** Last evaluation's dimension scores for breakdown display */
  lastDimensions?: {
    correctness: number;
    reasoning: number;
    depth: number;
    communication: number;
    engineering: number;
  };
}

const weights = getScoringWeights();

const dimensionLabels = {
  correctness: "Technical Correctness",
  reasoning: "Reasoning",
  depth: "Depth",
  communication: "Communication",
  engineering: "Practical Engineering",
} as const;

export function ScoreOverview({ feedback, lastDimensions }: ScoreOverviewProps) {
  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/5 p-6"
      aria-labelledby="score-overview-heading"
    >
      <h2 id="score-overview-heading" className="text-xs text-neutral-500 uppercase tracking-wider mb-6">
        Overall Score
      </h2>

      {/* Big score */}
      <div className="flex items-end gap-2 mb-8">
        <span
          className="text-7xl font-bold text-white tabular-nums"
          aria-label={`Overall score: ${feedback.overallScore} out of 100`}
        >
          {feedback.overallScore}
        </span>
        <span className="text-2xl text-neutral-600 mb-2">/100</span>
      </div>

      {/* Dimension breakdown */}
      {lastDimensions && (
        <div className="flex flex-col gap-3">
          {(Object.entries(dimensionLabels) as [keyof typeof dimensionLabels, string][]).map(
            ([key, label]) => (
              <ProgressIndicator
                key={key}
                value={lastDimensions[key]}
                max={10}
                label={`${label} (${Math.round(weights[key] * 100)}%)`}
              />
            )
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-neutral-600">
        Questions: {feedback.totalQuestions} · Days covered: {feedback.daysCovered.join(", ")}
      </p>
    </section>
  );
}
