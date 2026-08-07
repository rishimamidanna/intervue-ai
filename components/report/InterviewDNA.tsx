/**
 * components/report/InterviewDNA.tsx
 *
 * Top-level Interview DNA report container.
 * Composes all report sub-panels into a single cohesive view.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Add Framer Motion stagger entrance for each panel.
 * TODO: Add print/export functionality.
 * TODO: Integrate KnowledgeCore 3D visualization at the top of the report.
 */

import type { FinalFeedback } from "@/types/feedback";
import type { InterviewTurn } from "@/types/interview";
import { ScoreOverview } from "./ScoreOverview";
import { StrengthsPanel } from "./StrengthsPanel";
import { KnowledgeGapsPanel } from "./KnowledgeGapsPanel";
import { EvidencePanel } from "./EvidencePanel";
import { RecoveryPlan } from "./RecoveryPlan";

interface InterviewDNAProps {
  feedback: FinalFeedback;
  questionHistory: InterviewTurn[];
}

export function InterviewDNA({ feedback, questionHistory }: InterviewDNAProps) {
  return (
    <div
      className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-6"
      aria-label="Interview DNA Report"
    >
      {/* Summary */}
      {feedback.summary && (
        <p className="text-neutral-400 text-base leading-relaxed border-l-2 border-violet-500/40 pl-4">
          {feedback.summary}
        </p>
      )}

      {/* Score */}
      <ScoreOverview feedback={feedback} />

      {/* Strengths and Gaps side by side on larger screens */}
      <div className="grid sm:grid-cols-2 gap-6">
        <StrengthsPanel strengths={feedback.strengths} />
        <KnowledgeGapsPanel gaps={feedback.gaps} />
      </div>

      {/* Recovery Plan */}
      <RecoveryPlan items={feedback.recoveryPlan} />

      {/* Evidence */}
      <EvidencePanel questionHistory={questionHistory} />
    </div>
  );
}
