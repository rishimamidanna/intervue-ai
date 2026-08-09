"use client";

/**
 * components/analytics/ScoreTimeline.tsx
 *
 * Score & Difficulty Evolution Graph Component (Row 1 Right Panel).
 * Visualizes Q1, Q2, Q3, Q4 progression points with difficulty transitions:
 * - Q1: Easy → Medium
 * - Q2: Medium → Medium+
 * - Q3: Medium+ → Advanced
 * - Q4: Advanced
 *
 * Features:
 * - Smooth SVG line graph
 * - Difficulty markers & confidence indicators
 * - AI adaptation labels
 * - Tight graph bounds (removes unused space)
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";
import type { ScorePoint } from "@/app/api/analytics/route";

export interface EnhancedScorePoint extends ScorePoint {
  difficultyShift?: string;
  confidence?: string;
  adaptationLabel?: string;
}

export interface ScoreTimelineProps {
  timeline?: EnhancedScorePoint[];
}

export function ScoreTimeline({
  timeline = [
    { turn: "Q1", score: 78, difficulty: 2, topic: "RAG Foundations", difficultyShift: "Easy → Medium", confidence: "94.2%", adaptationLabel: "Baseline Established" },
    { turn: "Q2", score: 85, difficulty: 3, topic: "Vector Search", difficultyShift: "Medium → Medium+", confidence: "95.8%", adaptationLabel: "Escalated Complexity" },
    { turn: "Q3", score: 91, difficulty: 4, topic: "HNSW Indexing", difficultyShift: "Medium+ → Advanced", confidence: "96.4%", adaptationLabel: "Gap Detected & Probed" },
    { turn: "Q4", score: 94, difficulty: 5, topic: "Cross-Encoders", difficultyShift: "Advanced (Master)", confidence: "97.6%", adaptationLabel: "Mastery Confirmed" },
  ],
}: ScoreTimelineProps) {
  const width = 520;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const points = timeline.map((pt, idx) => {
    const x = paddingX + (idx / Math.max(1, timeline.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((pt.score - 50) / 50) * (height - paddingY * 2);
    return { x, y, ...pt };
  });

  const pathD = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  return (
    <div className="w-full h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 shadow-2xl space-y-4 flex flex-col justify-between relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              Score & Difficulty Evolution
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Q1 ─ Q4 Progression & AI Adaptation
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
          Adaptive Trajectory
        </span>
      </div>

      {/* SVG Line Graph Container */}
      <div className="w-full flex-1 flex flex-col justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Background Grid Lines */}
          {[0.25, 0.55, 0.85].map((ratio, i) => (
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

          {/* Area Fill Gradient */}
          <defs>
            <linearGradient id="scoreTimelineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
            fill="url(#scoreTimelineGrad)"
          />

          {/* Smooth Score Line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            d={pathD}
            fill="none"
            stroke="#c084fc"
            strokeWidth={2.5}
          />

          {/* Point Markers with Labels */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={5}
                className="fill-cyan-300 stroke-slate-950 stroke-2 hover:scale-125 transition-transform"
              />
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                className="fill-cyan-300 font-mono text-[10px] font-bold"
              >
                {pt.score}%
              </text>
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[10px] font-bold"
              >
                {pt.turn}
              </text>
            </g>
          ))}
        </svg>

        {/* Q1-Q4 Difficulty Transition Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-2">
          {points.map((pt, i) => (
            <div key={i} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-0.5">
              <div className="flex items-center justify-between text-[9px] font-mono text-purple-300 font-bold">
                <span>{pt.turn}</span>
                <span className="text-emerald-400">{pt.confidence}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-300 block truncate">
                {pt.difficultyShift}
              </span>
              <span className="text-[9px] font-mono text-slate-400 block truncate">
                {pt.adaptationLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
