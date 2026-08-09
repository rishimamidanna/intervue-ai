"use client";

/**
 * components/analytics/KnowledgeTwinMemoryView.tsx
 *
 * "Knowledge Twin Update" Live AI Memory View Component.
 * Visualizes RAG Knowledge baseline progression (Before: 62% -> After: 74%),
 * highlighting Newly Learned concepts and Remaining Knowledge Gaps.
 *
 * Design: Dark glassmorphism, purple/cyan neon accents, live memory state telemetry.
 * (NO SPHERES OR 3D OBJECTS).
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";

export interface KnowledgeTwinMemoryViewProps {
  beforeScore?: number;
  afterScore?: number;
  newlyLearned?: string[];
  remainingGaps?: string[];
}

export function KnowledgeTwinMemoryView({
  beforeScore = 62,
  afterScore = 74,
  newlyLearned = ["Vector Space Retrieval", "Cosine Similarity", "Bi-Encoder Ranking"],
  remainingGaps = ["HNSW Index Optimization", "Memory Footprint Scaling"],
}: KnowledgeTwinMemoryViewProps) {
  const delta = Math.max(0, afterScore - beforeScore);

  return (
    <div className="w-full rounded-3xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              LIVE AI MEMORY VIEW
            </span>
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              STATE PERSISTED
            </span>
          </div>
          <h2 className="text-2xl font-extrabold font-sans text-white tracking-tight">
            Knowledge Twin Memory Update
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Real-time candidate intelligence model updates stored in Redis memory (`knowledgeTwin`).
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center space-x-4 shadow-lg">
          <div className="text-center">
            <span className="text-[9px] font-mono text-slate-400 block uppercase">Before</span>
            <span className="text-base font-bold font-mono text-slate-300">{beforeScore}%</span>
          </div>
          <span className="text-cyan-400 font-mono text-xs font-bold">→</span>
          <div className="text-center">
            <span className="text-[9px] font-mono text-cyan-300 block uppercase">After</span>
            <span className="text-base font-bold font-mono text-cyan-300">{afterScore}%</span>
          </div>
          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-400/30">
            +{delta}% Delta
          </span>
        </div>
      </div>

      {/* Grid: Newly Learned vs Remaining Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Newly Learned Concepts Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-emerald-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                ✓ Newly Learned Concepts
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-300">+{newlyLearned.length} Validated</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {newlyLearned.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center space-x-1.5 shadow-md"
              >
                <span>+</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Remaining Knowledge Gaps Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-amber-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                ⚠ Remaining Knowledge Gaps
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-300">{remainingGaps.length} Target Areas</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {remainingGaps.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold flex items-center space-x-1.5 shadow-md"
              >
                <span>⚠</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
