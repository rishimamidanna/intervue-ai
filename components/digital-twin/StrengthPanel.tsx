"use client";

/**
 * components/digital-twin/StrengthPanel.tsx
 *
 * Candidate Strength Matrix Panel Component.
 * Displays validated candidate strengths with evidence badges and green neon highlights.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

interface StrengthPanelProps {
  strengths?: string[];
}

export function StrengthPanel({
  strengths = [
    "Retrieval-Augmented Generation (RAG)",
    "Vector Database Indexing (HNSW / IVF)",
    "ReAct Agent Reasoning Loops",
    "Python AI Engineering",
  ],
}: StrengthPanelProps) {
  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              Strength Matrix
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Validated Technical Mastery
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          Verified
        </span>
      </div>

      {/* Strengths List */}
      <div className="space-y-2.5">
        {strengths.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
          >
            <span className="text-xs font-mono text-slate-200 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{item}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
              High Mastery
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
