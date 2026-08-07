/**
 * components/report/StrengthsPanel.tsx
 *
 * Displays demonstrated strengths with evidence from the interview.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import type { StrengthEntry } from "@/types/feedback";

interface StrengthsPanelProps {
  strengths: StrengthEntry[];
}

export function StrengthsPanel({ strengths }: StrengthsPanelProps) {
  return (
    <section
      className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6"
      aria-labelledby="strengths-heading"
    >
      <h2
        id="strengths-heading"
        className="text-xs text-emerald-400 uppercase tracking-wider mb-4"
      >
        ✓ Demonstrated Strengths
      </h2>
      {strengths.length === 0 ? (
        <p className="text-sm text-neutral-600">
          Strength analysis pending interview completion.
        </p>
      ) : (
        <ul className="flex flex-col gap-4" role="list">
          {strengths.map((s, i) => (
            <li key={i} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white">{s.topic}</span>
              <span className="text-sm text-neutral-400">{s.description}</span>
              {s.evidence.length > 0 && (
                <ul className="mt-1 flex flex-col gap-0.5 pl-3 border-l border-emerald-500/20">
                  {s.evidence.map((ev, j) => (
                    <li key={j} className="text-xs text-neutral-600 italic">
                      &ldquo;{ev}&rdquo;
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
