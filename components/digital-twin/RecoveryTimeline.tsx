"use client";

/**
 * components/digital-twin/RecoveryTimeline.tsx
 *
 * Futuristic Learning Evolution Roadmap Timeline.
 * Maps: Current Level → Recommended Focus Area → Next Milestone Target.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

interface RecoveryTimelineProps {
  currentLevel?: string;
  recommendedFocus?: string;
  nextMilestone?: string;
}

export function RecoveryTimeline({
  currentLevel = "Senior AI Engineer (Score: 88)",
  recommendedFocus = "Master IVF Index Partitioning & Evaluation Metrics",
  nextMilestone = "Staff AI Engineer Target Band",
}: RecoveryTimelineProps) {
  const steps = [
    {
      title: "Current Evaluated Level",
      desc: currentLevel,
      status: "Completed",
      color: "border-cyan-500/40 bg-cyan-950/40 text-cyan-300",
      dot: "bg-cyan-400 shadow-[0_0_10px_#38bdf8]",
    },
    {
      title: "Recommended Focused Study",
      desc: recommendedFocus,
      status: "In Progress",
      color: "border-purple-500/40 bg-purple-950/40 text-purple-300",
      dot: "bg-purple-400 shadow-[0_0_10px_#c084fc] animate-ping",
    },
    {
      title: "Target Career Milestone",
      desc: nextMilestone,
      status: "Target",
      color: "border-emerald-500/40 bg-emerald-950/40 text-emerald-300",
      dot: "bg-emerald-400 shadow-[0_0_10px_#34d399]",
    },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 shadow-2xl space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-100 font-sans">
          Learning Evolution Roadmap
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          AI Twin Milestone Pathway
        </p>
      </div>

      <div className="relative pl-6 space-y-6 border-l-2 border-purple-500/20">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            className="relative"
          >
            {/* Timeline Node Bullet */}
            <div className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full ${step.dot}`} />

            <div className={`p-4 rounded-2xl border ${step.color} space-y-1`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  {step.title}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-current opacity-80">
                  {step.status}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-mono pt-1">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
