"use client";

/**
 * components/analytics/KnowledgeGrowth.tsx
 *
 * Knowledge Growth Analysis Component (Row 2 Left Panel).
 * Compares Before Interview (Knowledge Baseline) vs After Interview (Knowledge Twin Update)
 * using comparison bars and growth trend indicators.
 * Height aligned with DifficultyAnalytics in a balanced 2-column grid.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";

export interface KnowledgeGrowthProps {
  baseline?: number;
  current?: number;
  masteredCount?: number;
  gapCount?: number;
}

export function KnowledgeGrowth({
  baseline = 65,
  current = 88,
  masteredCount = 5,
  gapCount = 2,
}: KnowledgeGrowthProps) {
  const delta = Math.max(0, current - baseline);

  return (
    <div className="w-full h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 shadow-2xl space-y-4 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              Knowledge Growth Analysis
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Baseline vs Evaluation Twin Update
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
          +{delta}% Growth
        </span>
      </div>

      {/* Comparison Progress Bars */}
      <div className="space-y-4 pt-1 flex-1 flex flex-col justify-center">
        {/* Baseline Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Before Interview (Knowledge Baseline)</span>
            <span className="text-slate-300 font-bold">{baseline}%</span>
          </div>
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${baseline}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-slate-600"
            />
          </div>
        </div>

        {/* Current Twin Update Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-purple-300 font-bold">After Interview (Knowledge Twin Update)</span>
            <span className="text-cyan-300 font-bold">{current}% (+{delta}%)</span>
          </div>
          <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${current}%` }}
              transition={{ duration: 1.0, delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Mastered Concepts
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400 block">
            {masteredCount} Topics
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Identified Knowledge Gaps
          </span>
          <span className="text-xl font-bold font-mono text-amber-300 block">
            {gapCount} Targeted
          </span>
        </div>
      </div>
    </div>
  );
}
