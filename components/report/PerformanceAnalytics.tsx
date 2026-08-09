"use client";

/**
 * components/report/PerformanceAnalytics.tsx
 *
 * SECTION 2: Performance Analytics Component for Final Intelligence Report.
 * Contains 3 Visualizations:
 * 1. Line Graph ("Performance Evolution" Q1-Q5 score progression 65 -> 72 -> 78 -> 85 -> 91 with interactive tooltips)
 * 2. Bar Graph ("Skill Dimension Analysis" Correctness, Reasoning, Depth, Communication, Engineering)
 * 3. Distribution Chart ("Knowledge Distribution" Mastered 60%, Developing 25%, Gaps 15%)
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface PerformanceAnalyticsProps {
  scoreTimeline?: { turn: string; score: number; difficulty: number; topic?: string; decision?: string }[];
  radarMetrics?: { correctness: number; reasoning: number; depth: number; communication: number; engineering: number };
  knowledgeDist?: { mastered: number; developing: number; gaps: number };
}

export function PerformanceAnalytics({
  scoreTimeline = [
    { turn: "Q1", score: 65, difficulty: 2, topic: "RAG Foundations", decision: "Baseline Assessed" },
    { turn: "Q2", score: 72, difficulty: 3, topic: "Vector Search", decision: "Increased Difficulty to 3/5" },
    { turn: "Q3", score: 78, difficulty: 3, topic: "HNSW Indexing", decision: "Asked Follow-up on Decay Math" },
    { turn: "Q4", score: 85, difficulty: 4, topic: "Cross-Encoder Reranking", decision: "Escalated to 4/5 Advanced" },
    { turn: "Q5", score: 91, difficulty: 4, topic: "System Synthesis", decision: "Mastery Confirmed" },
  ],
  radarMetrics = { correctness: 85, reasoning: 78, depth: 70, communication: 88, engineering: 80 },
  knowledgeDist = { mastered: 60, developing: 25, gaps: 15 },
}: PerformanceAnalyticsProps) {
  const [activePointIdx, setActivePointIdx] = useState<number | null>(4);

  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 35;

  const points = scoreTimeline.map((pt, idx) => {
    const x = paddingX + (idx / Math.max(1, scoreTimeline.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((pt.score - 50) / 50) * (height - paddingY * 2);
    return { x, y, ...pt };
  });

  const pathD = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const skillBars = [
    { name: "Correctness", val: radarMetrics.correctness, color: "from-cyan-500 to-blue-500", text: "text-cyan-300" },
    { name: "Reasoning", val: radarMetrics.reasoning, color: "from-purple-500 to-indigo-500", text: "text-purple-300" },
    { name: "Depth", val: radarMetrics.depth, color: "from-indigo-500 to-cyan-500", text: "text-indigo-300" },
    { name: "Communication", val: radarMetrics.communication, color: "from-emerald-500 to-teal-500", text: "text-emerald-400" },
    { name: "Engineering Judgement", val: radarMetrics.engineering, color: "from-amber-500 to-purple-500", text: "text-amber-300" },
  ];

  const activePoint = activePointIdx !== null ? points[activePointIdx] : points[points.length - 1];

  return (
    <div className="space-y-6">
      {/* 2-Column Grid: Line Graph + Bar Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 1. Line Graph: Performance Evolution (Lg: 7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 space-y-4 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold font-mono text-white">Performance Evolution</h3>
              <p className="text-xs text-slate-400 font-mono">Q1 ─ Q5 Dynamic Adaptation & Score Trajectory</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Interactive Trajectory
            </span>
          </div>

          <div className="w-full flex-1 flex flex-col justify-center relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              {[0.2, 0.5, 0.8].map((ratio, i) => (
                <line
                  key={i}
                  x1={paddingX}
                  y1={height * ratio}
                  x2={width - paddingX}
                  y2={height * ratio}
                  stroke="#475569"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
              ))}

              <defs>
                <linearGradient id="reportScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d={`${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
                fill="url(#reportScoreGrad)"
              />

              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                d={pathD}
                fill="none"
                stroke="#c084fc"
                strokeWidth={2.5}
              />

              {points.map((pt, i) => (
                <g key={i} onClick={() => setActivePointIdx(i)} className="cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={activePointIdx === i ? 7 : 5}
                    className={`stroke-slate-950 stroke-2 transition-all ${
                      activePointIdx === i ? "fill-cyan-300 shadow-[0_0_12px_rgba(56,189,248,1)]" : "fill-purple-400 hover:fill-cyan-300"
                    }`}
                  />
                  <text x={pt.x} y={pt.y - 12} textAnchor="middle" className="fill-cyan-300 font-mono text-[10px] font-bold">
                    {pt.score}%
                  </text>
                  <text x={pt.x} y={height - 8} textAnchor="middle" className="fill-slate-400 font-mono text-[10px]">
                    {pt.turn}
                  </text>
                </g>
              ))}
            </svg>

            {/* Dynamic AI Decision Tooltip Panel */}
            {activePoint && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-950/90 border border-purple-500/30 flex items-center justify-between text-xs font-mono shadow-lg">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] uppercase block">{activePoint.turn} Topic: <strong className="text-white">{activePoint.topic || "RAG Core"}</strong></span>
                  <span className="text-purple-300 font-bold block">AI Decision: {activePoint.decision || "Evaluated"}</span>
                </div>
                <div className="text-right">
                  <span className="text-cyan-300 font-bold block">{activePoint.score}% Score</span>
                  <span className="text-emerald-400 text-[10px] block">Diff Level: {activePoint.difficulty}/5</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Bar Graph: Skill Dimension Analysis (Lg: 5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 p-6 space-y-4 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold font-mono text-white">Skill Dimension Analysis</h3>
              <p className="text-xs text-slate-400 font-mono">5 Core Competency Rubrics</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Rubric
            </span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {skillBars.map((bar, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300">{bar.name}</span>
                  <span className={`font-bold ${bar.text}`}>{bar.val}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.val}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.08 }}
                    className={`h-full rounded-full bg-gradient-to-r ${bar.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Distribution Chart: Knowledge Distribution */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold font-mono text-white">Knowledge Distribution</h3>
            <p className="text-xs text-slate-400 font-mono">Mastered vs Developing vs Knowledge Gaps</p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
            Curriculum Breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Mastered Areas</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 block">{knowledgeDist.mastered}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Developing Areas</span>
            <span className="text-2xl font-extrabold font-mono text-purple-300 block">{knowledgeDist.developing}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Knowledge Gaps</span>
            <span className="text-2xl font-extrabold font-mono text-amber-300 block">{knowledgeDist.gaps}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
