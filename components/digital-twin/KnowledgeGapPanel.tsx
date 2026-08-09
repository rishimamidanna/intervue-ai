"use client";

/**
 * components/digital-twin/KnowledgeGapPanel.tsx
 *
 * Knowledge Gap Detection Panel Component.
 * Displays detected weak concepts and severity risk indicators.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

interface KnowledgeGapPanelProps {
  gaps?: string[];
}

export function KnowledgeGapPanel({
  gaps = [
    "IVF Partitioning & Clustering",
    "Evaluation Benchmark Metrics (NDCG / MAP)",
    "LLM Fine-Tuning Hyperparameters",
  ],
}: KnowledgeGapPanelProps) {
  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              Knowledge Gap Detection
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Targeted Focus Areas
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
          Action Needed
        </span>
      </div>

      {/* Gaps List */}
      <div className="space-y-2.5">
        {gaps.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-950/60 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
          >
            <span className="text-xs font-mono text-slate-200 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{item}</span>
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30">
              Needs Review
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
