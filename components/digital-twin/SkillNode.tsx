"use client";

/**
 * components/digital-twin/SkillNode.tsx
 *
 * Glassmorphic Skill Node Badge Component.
 * Displays a single candidate knowledge topic with mastery score, confidence level,
 * and dynamic glowing border based on mastery level.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

export interface SkillNodeData {
  topic: string;
  score: number; // 0 - 100
  confidence: "low" | "medium" | "high";
  evidenceCount?: number;
}

interface SkillNodeProps {
  skill: SkillNodeData;
  index?: number;
}

export function SkillNode({ skill, index = 0 }: SkillNodeProps) {
  const isHighMastery = skill.score >= 70;
  const isMediumMastery = skill.score >= 50 && skill.score < 70;

  const glowColor = isHighMastery
    ? "border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:border-cyan-400"
    : isMediumMastery
    ? "border-purple-500/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:border-purple-400"
    : "border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:border-amber-400";

  const badgeBg = isHighMastery
    ? "bg-cyan-500/10"
    : isMediumMastery
    ? "bg-purple-500/10"
    : "bg-amber-500/10";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3, scale: 1.03 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`rounded-2xl bg-slate-900/70 backdrop-blur-xl border ${glowColor} p-4 flex items-center justify-between transition-all`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${isHighMastery ? "bg-cyan-400 shadow-[0_0_8px_#38bdf8]" : isMediumMastery ? "bg-purple-400 shadow-[0_0_8px_#c084fc]" : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"}`} />
        <div>
          <h4 className="text-sm font-semibold font-sans text-slate-100">{skill.topic}</h4>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            {skill.confidence} Confidence {skill.evidenceCount ? `• ${skill.evidenceCount} Evidence` : ""}
          </span>
        </div>
      </div>

      <div className={`px-3 py-1 rounded-xl ${badgeBg} border ${glowColor} font-mono text-xs font-bold`}>
        {Math.round(skill.score)}%
      </div>
    </motion.div>
  );
}
