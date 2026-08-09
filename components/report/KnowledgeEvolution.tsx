"use client";

/**
 * components/report/KnowledgeEvolution.tsx
 *
 * SECTION 4: Knowledge Twin Evolution Component for Final Report.
 * Displays Before Interview (62%) vs After Interview (78%), Growth (+16%),
 * learned concepts, improved areas, and remaining gaps.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";

export interface KnowledgeEvolutionProps {
  beforeScore?: number;
  afterScore?: number;
  learnedConcepts?: string[];
  improvedAreas?: string[];
  remainingGaps?: string[];
}

export function KnowledgeEvolution({
  beforeScore = 62,
  afterScore = 78,
  learnedConcepts = ["Vector Space Retrieval", "Cosine Similarity", "Bi-Encoder Ranking"],
  improvedAreas = ["Dense Embeddings", "Evaluation Rubrics", "Prompt Grounding"],
  remainingGaps = ["HNSW Index Optimization", "Memory Footprint Scaling"],
}: KnowledgeEvolutionProps) {
  const delta = Math.max(0, afterScore - beforeScore);

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xl font-extrabold font-sans text-white">Knowledge Twin Evolution</h3>
          <p className="text-xs text-slate-400 font-mono">Before vs After Candidate Intelligence Baseline</p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-purple-500/30 flex items-center space-x-4 shadow-lg">
          <div className="text-center">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">Before</span>
            <span className="text-base font-bold font-mono text-slate-300">{beforeScore}%</span>
          </div>
          <span className="text-purple-400 font-mono text-xs font-bold">→</span>
          <div className="text-center">
            <span className="text-[9px] font-mono text-cyan-300 block uppercase">After</span>
            <span className="text-base font-bold font-mono text-cyan-300">{afterScore}%</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-400/30">
            +{delta}% Growth
          </span>
        </div>
      </div>

      {/* Comparison Progress Bar */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Before Interview Baseline</span>
            <span className="text-slate-300 font-bold">{beforeScore}%</span>
          </div>
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${beforeScore}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-slate-600"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-purple-300 font-bold">After Interview Knowledge Twin Update</span>
            <span className="text-cyan-300 font-bold">{afterScore}% (+{delta}%)</span>
          </div>
          <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${afterScore}%` }}
              transition={{ duration: 1.0, delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* 3-Column Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">✓ Learned Concepts</span>
          <div className="flex flex-wrap gap-1.5">
            {learnedConcepts.map((item, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-mono">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
          <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider block">↑ Improved Areas</span>
          <div className="flex flex-wrap gap-1.5">
            {improvedAreas.map((item, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-mono">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-2">
          <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">⚠ Remaining Gaps</span>
          <div className="flex flex-wrap gap-1.5">
            {remainingGaps.map((item, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-mono">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
