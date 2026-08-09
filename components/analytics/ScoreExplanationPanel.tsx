"use client";

/**
 * components/analytics/ScoreExplanationPanel.tsx
 *
 * "Why This Score?" Explanation Panel Component.
 * Explains how each dimension (Correctness 35%, Reasoning 25%, Depth 20%, Communication 10%, Engineering 10%)
 * impacts the candidate's overall composite score (e.g. 85%).
 *
 * Design: Dark glassmorphism, purple/cyan neon accents, transparent rubric formula breakdown.
 * (NO SPHERES OR 3D OBJECTS).
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";
import type { RadarMetrics } from "@/app/api/analytics/route";

export interface ScoreExplanationPanelProps {
  overallScore?: number;
  metrics?: RadarMetrics;
}

export function ScoreExplanationPanel({
  overallScore = 85,
  metrics = { correctness: 90, reasoning: 82, depth: 78, communication: 88, engineering: 80 },
}: ScoreExplanationPanelProps) {
  const dimensions = [
    { name: "Technical Correctness", weight: "35%", score: metrics.correctness, contrib: Math.round(metrics.correctness * 0.35), color: "text-cyan-300", bar: "from-cyan-500 to-blue-500", desc: "Accuracy of domain knowledge & core syntax." },
    { name: "Reasoning Quality", weight: "25%", score: metrics.reasoning, contrib: Math.round(metrics.reasoning * 0.25), color: "text-purple-300", bar: "from-purple-500 to-indigo-500", desc: "Logical structure & problem decomposition." },
    { name: "Depth of Knowledge", weight: "20%", score: metrics.depth, contrib: Math.round(metrics.depth * 0.20), color: "text-indigo-300", bar: "from-indigo-500 to-cyan-500", desc: "Nuance beyond surface-level recall." },
    { name: "Communication Clarity", weight: "10%", score: metrics.communication, contrib: Math.round(metrics.communication * 0.10), color: "text-emerald-400", bar: "from-emerald-500 to-teal-500", desc: "Articulation of trade-offs & clarity." },
    { name: "Engineering Judgement", weight: "10%", score: metrics.engineering, contrib: Math.round(metrics.engineering * 0.10), color: "text-amber-300", bar: "from-amber-500 to-purple-500", desc: "Real-world system applicability." },
  ];

  return (
    <div className="w-full rounded-3xl bg-slate-950/90 border border-purple-500/30 backdrop-blur-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-purple-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              TRANSPARENT EVALUATION RUBRIC
            </span>
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              EXPLAINABLE AI
            </span>
          </div>
          <h2 className="text-2xl font-extrabold font-sans text-white tracking-tight">
            Why This Score? ({overallScore} / 100)
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Mathematical breakdown of 5 weighted rubric dimensions determining candidate rating.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-purple-500/30 text-right shadow-lg">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">Composite Formula</span>
          <span className="text-sm font-bold font-mono text-cyan-300">
            35% C + 25% R + 20% D + 10% Cm + 10% E
          </span>
        </div>
      </div>

      {/* 5-Dimension Weight Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative z-10">
        {dimensions.map((dim, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5 flex flex-col justify-between hover:border-purple-400/40 transition-colors shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Weight: {dim.weight}
                </span>
                <span className="text-[10px] font-mono text-purple-300 font-bold">
                  +{dim.contrib} pts
                </span>
              </div>

              <h3 className="text-xs font-mono font-bold text-slate-100 mt-1">
                {dim.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-2">
                {dim.desc}
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Raw Score:</span>
                <span className={`font-bold ${dim.color}`}>{dim.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dim.score}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`h-full rounded-full bg-gradient-to-r ${dim.bar}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
