/**
 * components/report/KnowledgeGapsPanel.tsx
 *
 * Displays identified knowledge gaps with evidence and curriculum references.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import type { GapEntry } from "@/types/feedback";

interface KnowledgeGapsPanelProps {
  gaps: GapEntry[];
}

export function KnowledgeGapsPanel({ gaps }: KnowledgeGapsPanelProps) {
  return (
    <section
      className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
      aria-labelledby="gaps-heading"
    >
      <h2
        id="gaps-heading"
        className="text-xs text-red-400 uppercase tracking-wider mb-4"
      >
        ✗ Knowledge Gaps
      </h2>
      {gaps.length === 0 ? (
        <p className="text-sm text-neutral-600">
          Gap analysis pending interview completion.
        </p>
      ) : (
        <ul className="flex flex-col gap-4" role="list">
          {gaps.map((g, i) => (
            <li key={i} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white">{g.topic}</span>
              <span className="text-sm text-neutral-400">{g.description}</span>
              {g.curriculumDays.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {g.curriculumDays.map((day) => (
                    <span
                      key={day}
                      className="text-xs font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded"
                    >
                      Day {day}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
