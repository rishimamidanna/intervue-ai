import type { Metadata } from "next";
import { InterviewChamber } from "@/components/interview/InterviewChamber";

export const metadata: Metadata = {
  title: "Interview Chamber",
  description: "Your adaptive AI technical interview is in progress.",
};

/**
 * Interview page — the active interview session view.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 *
 * TODO: Wire to useInterview() hook and interview API routes.
 * TODO: Read sessionId from URL params or cookie after session init.
 * TODO: Add KnowledgeCore 3D panel in a side-by-side layout.
 */
export default function InterviewPage() {
  return <InterviewChamber />;
}
