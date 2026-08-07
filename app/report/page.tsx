import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Interview Intelligence Report",
  description: "Your INTERVUE Interview DNA report — personalised feedback and recovery plan.",
};

/**
 * Report page — displays the final Interview DNA feedback report.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 *
 * TODO: Fetch the FinalFeedback from GET /api/interview/report?sessionId=<id>
 *   using the sessionId from URL searchParams or cookie.
 * TODO: Render <InterviewDNA> with the fetched feedback.
 * TODO: Add KnowledgeCore 3D visualization at the top of the report.
 */
export default function ReportPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center px-6 py-4 border-b border-white/5">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          INTER<span className="text-violet-400">VUE</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full text-center flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-white">
            Interview Intelligence Report
          </h1>
          <p className="text-neutral-500">
            Report scaffold ready.
          </p>
          <p className="text-xs text-neutral-700 mt-4">
            TODO: Fetch FinalFeedback and render &lt;InterviewDNA&gt;
          </p>
        </div>
      </main>
    </div>
  );
}
