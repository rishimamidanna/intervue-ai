"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { InterviewDNA } from "@/components/report/InterviewDNA";
import type { FinalFeedback } from "@/types/feedback";
import type { InterviewTurn } from "@/types/interview";

interface ReportResponse {
  status: string;
  feedback: FinalFeedback;
  questionHistory: InterviewTurn[];
  error?: string;
  message?: string;
}

function ReportContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [data, setData] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided. Please complete an interview session first.");
      setIsLoading(false);
      return;
    }

    async function fetchReport() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/interview/report?sessionId=${encodeURIComponent(sessionId!)}`);
        const json = await res.json();

        if (!res.ok || json.status === "error") {
          setError(json.error || json.message || "Failed to load report for this session.");
        } else {
          setData(json);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error fetching interview report.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-4" />
        <h2 className="text-lg font-medium text-white mb-1">Generating Intelligence Report</h2>
        <p className="text-sm text-neutral-400">Synthesizing interview transcript & Knowledge Twin scores...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col gap-4">
          <div className="text-xs font-mono uppercase tracking-wider text-red-400">Report Fetch Error</div>
          <h2 className="text-xl font-bold text-white">Session Report Unavailable</h2>
          <p className="text-sm text-neutral-400">{error || "Could not retrieve session feedback."}</p>
          <div className="pt-2">
            <Link
              href="/interview"
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
            >
              Start New Interview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InterviewDNA
      feedback={data.feedback}
      questionHistory={data.questionHistory || []}
    />
  );
}

/**
 * Report page — displays the final Interview DNA feedback report.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */
export default function ReportPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          INTER<span className="text-violet-400">VUE</span>
        </Link>
        <div className="text-xs text-neutral-500 font-mono">
          INTERVIEW INTELLIGENCE REPORT
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          }
        >
          <ReportContent />
        </Suspense>
      </main>
    </div>
  );
}

