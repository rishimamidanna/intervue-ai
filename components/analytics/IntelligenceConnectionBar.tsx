"use client";

/**
 * components/analytics/IntelligenceConnectionBar.tsx
 *
 * Subtle AI Intelligence Relationship Connection Bar Component.
 * Visually communicates the core thesis:
 * Performance Analysis → Knowledge Growth → Adaptive Decision Engine → Next Interview Strategy
 * with thin glowing neon connector lines and pulsing flow dots.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";

export function IntelligenceConnectionBar() {
  const steps = [
    { label: "Performance Analysis", desc: "5-Axis Vector Evaluation", color: "text-cyan-300", border: "border-cyan-500/30" },
    { label: "Knowledge Growth", desc: "Baseline vs Twin Update", color: "text-purple-300", border: "border-purple-500/30" },
    { label: "Adaptive Decision Engine", desc: "Real-time Difficulty Shift", color: "text-emerald-400", border: "border-emerald-500/30" },
    { label: "Next Interview Strategy", desc: "Targeted Curriculum Focus", color: "text-amber-300", border: "border-amber-500/30" },
  ];

  return (
    <div className="w-full rounded-2xl bg-slate-950/80 border border-purple-500/20 backdrop-blur-xl p-4 shadow-xl space-y-3 relative overflow-hidden my-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
          AI INTELLIGENCE CLOSED-LOOP FEEDBACK MATRIX
        </span>
        <span className="text-[10px] font-mono text-cyan-300 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>CONTINUOUS REASONING LOOP</span>
        </span>
      </div>

      {/* 4-Node Connected Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex flex-col items-center justify-center">
            <div className={`w-full p-3 rounded-xl bg-slate-900/80 border ${step.border} text-center space-y-0.5 relative z-10 hover:scale-[1.02] transition-transform`}>
              <span className={`text-xs font-mono font-bold ${step.color} block`}>
                {step.label}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block truncate">
                {step.desc}
              </span>
            </div>

            {/* Neon Flow Arrow for intermediate nodes */}
            {idx < steps.length - 1 && (
              <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-cyan-400 font-mono text-xs font-bold"
                >
                  →
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
