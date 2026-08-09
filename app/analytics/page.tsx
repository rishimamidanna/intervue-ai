"use client";

import React from "react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-black text-slate-100 p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full rounded-2xl bg-slate-900/80 border border-emerald-500/30 p-8 text-center backdrop-blur-xl shadow-2xl space-y-4">
        <h1 className="text-2xl font-bold font-mono text-emerald-400 uppercase">Analytics</h1>
        <p className="text-xs text-slate-400 font-mono">Cohort benchmark telemetry & evaluation accuracy analytics.</p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-lg shadow-emerald-500/30"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
