/**
 * components/report/EvidencePanel.tsx
 *
 * Displays question-answer-evaluation evidence from the interview session.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Add collapsible rows for long answers.
 */

import type { InterviewTurn } from "@/types/interview";

interface EvidencePanelProps {
  questionHistory: InterviewTurn[];
}

export function EvidencePanel({ questionHistory }: EvidencePanelProps) {
  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/5 p-6"
      aria-labelledby="evidence-heading"
    >
      <h2
        id="evidence-heading"
        className="text-xs text-neutral-500 uppercase tracking-wider mb-4"
      >
        Interview Evidence
      </h2>
      {questionHistory.length === 0 ? (
        <p className="text-sm text-neutral-600">No interview turns recorded yet.</p>
      ) : (
        <ol className="flex flex-col gap-6" role="list">
          {questionHistory.map((turn, i) => (
            <li key={turn.question.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-600">Q{i + 1}</span>
                <span className="text-xs text-violet-400">{turn.question.topic}</span>
              </div>
              <p className="text-sm text-white">{turn.question.text}</p>
              <blockquote className="text-sm text-neutral-400 border-l-2 border-white/10 pl-3 italic">
                {turn.answer || "(no answer recorded)"}
              </blockquote>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-neutral-600">
                  Score:{" "}
                  <span className="text-white font-mono">
                    {Math.round(turn.evaluation.correctness * 10)}%
                  </span>
                </span>
                <span className="text-neutral-600">
                  Next: <span className="text-violet-400">{turn.evaluation.nextAction}</span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
