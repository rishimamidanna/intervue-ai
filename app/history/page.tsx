"use client";

import React from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-black text-slate-100 p-4 md:p-8 font-sans">
      <DashboardHeader />

      <div className="max-w-md w-full mx-auto my-12 rounded-3xl bg-slate-900/80 border border-purple-500/30 p-8 text-center backdrop-blur-2xl shadow-2xl space-y-4">
        <h1 className="text-2xl font-bold font-mono text-purple-400 uppercase">Interview History</h1>
        <p className="text-xs text-slate-400 font-mono">Past candidate interview sessions & transcripts archive.</p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-lg shadow-purple-500/30"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
