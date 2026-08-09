"use client";

/**
 * components/analytics/DifficultyAnalytics.tsx
 *
 * Adaptive AI Decision Timeline Component (Row 2 Right Panel).
 * Displays compact connected glass cards detailing real-time AI reasoning across Q1, Q2, Q3, Q4:
 * - Q1: Topic, Evaluation, Decision, Reason
 * - Q2: Follow-up strategy & Difficulty adjustment
 * - Q3: Knowledge gap detected & Recovery action
 * - Q4: Final interview direction & Mastery confirmation
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";
import type { DecisionItem } from "@/app/api/analytics/route";

export interface EnhancedTimelineEvent extends DecisionItem {
  scoreGrade?: string;
  prevDiff?: number;
  newDiff?: number;
  confidence?: string;
  nextStrategy?: string;
  gapOrRecovery?: string;
}

export interface DifficultyAnalyticsProps {
  decisions?: EnhancedTimelineEvent[];
}

export function DifficultyAnalytics({
  decisions = [
    {
      id: "DEC-1",
      turn: "Q1",
      decision: "Increased Difficulty",
      topic: "RAG Architecture & Embeddings",
      detail: "High accuracy on vector space math; escalated to graph indexing.",
      timestamp: "2m elapsed",
      scoreGrade: "88/100 (Grade A)",
      prevDiff: 2,
      newDiff: 3,
      confidence: "95.4%",
      nextStrategy: "Probe HNSW graph partitioning.",
      gapOrRecovery: "Baseline vector math verified.",
    },
    {
      id: "DEC-2",
      turn: "Q2",
      decision: "Asked Follow-up",
      topic: "HNSW Graph Indexing & Skip Lists",
      detail: "Probed multi-layer routing logic; followed up on decay parameters.",
      timestamp: "5m elapsed",
      scoreGrade: "82/100 (Grade B+)",
      prevDiff: 3,
      newDiff: 3,
      confidence: "94.1%",
      nextStrategy: "Target cross-encoder latency trade-offs.",
      gapOrRecovery: "Follow-up triggered on parameter scaling.",
    },
    {
      id: "DEC-3",
      turn: "Q3",
      decision: "Detected Knowledge Gap",
      topic: "Cross-Encoder Latency Bounds",
      detail: "Flagged GPU memory footprint nuance; triggered recovery probe.",
      timestamp: "8m elapsed",
      scoreGrade: "76/100 (Grade B)",
      prevDiff: 3,
      newDiff: 3,
      confidence: "92.6%",
      nextStrategy: "Recovery Action: Offer prompt context compression alternative.",
      gapOrRecovery: "Gap Detected: Memory footprint tradeoff.",
    },
    {
      id: "DEC-4",
      turn: "Q4",
      decision: "Mastery Confirmed",
      topic: "System Architecture & Synthesis",
      detail: "Synthesized production fault tolerance and RAG cache invalidation.",
      timestamp: "12m elapsed",
      scoreGrade: "95/100 (Grade A+)",
      prevDiff: 3,
      newDiff: 4,
      confidence: "97.8%",
      nextStrategy: "Final Direction: Recommend Senior System Architect Track.",
      gapOrRecovery: "Mastery Validated across all 7 nodes.",
    },
  ],
}: DifficultyAnalyticsProps) {
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "Increased Difficulty":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      case "Detected Knowledge Gap":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "Asked Follow-up":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <div className="w-full h-full rounded-3xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-xl p-6 shadow-2xl space-y-4 flex flex-col justify-between relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              Adaptive AI Decision Timeline
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Q1 ─ Q4 Reasoning & Strategy Adaptation
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          Adaptive Engine
        </span>
      </div>

      {/* Vertical Timeline with Q1-Q4 Cards */}
      <div className="relative pl-6 space-y-3 border-l-2 border-cyan-500/40 ml-3 pt-1 flex-1 flex flex-col justify-between">
        {/* Glowing Animated Stream Line */}
        <div className="absolute -left-[1px] top-0 bottom-0 w-0.5 bg-cyan-500/30">
          <motion.div
            animate={{ y: ["0%", "100%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="w-full h-12 bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,1)]"
          />
        </div>

        {decisions.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="relative p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 hover:border-cyan-400/40 transition-colors shadow-lg"
          >
            {/* Timeline Node */}
            <span className="absolute -left-[29px] top-3.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-slate-200">{item.turn}</span>
                <span className={`px-2 py-0.5 text-[9px] font-mono rounded border uppercase ${getBadgeStyle(item.decision)}`}>
                  {item.decision}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">{item.scoreGrade || "88/100"}</span>
            </div>

            <h4 className="text-xs font-mono font-bold text-cyan-300 truncate">
              {item.topic}
            </h4>

            <p className="text-[11px] text-slate-300 font-sans line-clamp-1">
              {item.detail}
            </p>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="text-emerald-400 truncate max-w-[160px]">{item.gapOrRecovery || "Strategy Verified"}</span>
              <span className="text-purple-300 truncate max-w-[180px]">Next: {item.nextStrategy || "Escalate topic"}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
