/**
 * components/report/RecoveryPlan.tsx
 *
 * Personalised recovery plan — prioritised actionable study items.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Add links to relevant curriculum days or resources.
 */

import type { RecoveryItem } from "@/types/feedback";

interface RecoveryPlanProps {
  items: RecoveryItem[];
}

export function RecoveryPlan({ items }: RecoveryPlanProps) {
  return (
    <section
      className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6"
      aria-labelledby="recovery-heading"
    >
      <h2
        id="recovery-heading"
        className="text-xs text-violet-400 uppercase tracking-wider mb-4"
      >
        ↑ Personalised Recovery Plan
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-600">
          Recovery plan pending interview completion.
        </p>
      ) : (
        <ol className="flex flex-col gap-4" role="list">
          {items.map((item) => (
            <li
              key={item.priority}
              className="flex gap-4 items-start"
            >
              <span
                className="flex-shrink-0 h-6 w-6 rounded-full bg-violet-500/20 text-violet-400
                  text-xs font-bold flex items-center justify-center mt-0.5"
                aria-label={`Priority ${item.priority}`}
              >
                {item.priority}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-white">{item.topic}</span>
                <span className="text-sm text-neutral-400">{item.action}</span>
                {item.resources.length > 0 && (
                  <ul className="flex flex-wrap gap-1 mt-1">
                    {item.resources.map((res, i) => (
                      <li
                        key={i}
                        className="text-xs bg-white/5 text-neutral-500 px-2 py-0.5 rounded"
                      >
                        {res}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
