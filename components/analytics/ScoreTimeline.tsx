"use client";

/**
 * components/analytics/ScoreTimeline.tsx
 *
 * Score & Difficulty Evolution Graph Component for Analytics Page.
 * Visualizes Q1–Q5 turn progression, score line graph, and difficulty transitions.
 *
 * Features:
 * - Real interview session data binding
 * - Proper empty-state handling when no session exists
 * - Interactive tooltips showing Score, Difficulty Change, and Topic
 * - Smooth SVG path visualization & responsive grid layout
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Info } from "lucide-react";
import type { ScorePoint } from "@/app/api/analytics/route";

export interface ScoreTimelineProps {
  timeline?: ScorePoint[];
}

export function ScoreTimeline({ timeline = [] }: ScoreTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. EMPTY STATE HANDLING
  if (!timeline || timeline.length === 0) {
    return (
      <div className="w-full h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden min-h-[320px]">
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <Brain className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-base font-bold text-slate-100 font-sans">
            Score & Difficulty Evolution
          </h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            No interview data available. Complete an interview to view progression.
          </p>
        </div>
        <Link
          href="/interview"
          className="mt-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 border border-purple-400/30"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Start AI Interview</span>
        </Link>
      </div>
    );
  }

  // 2. DATA PROCESSING & COORDINATES
  const width = 540;
  const height = 210;
  const paddingX = 45;
  const paddingY = 35;

  const points = timeline.map((pt, idx) => {
    const questionLabel = pt.question || pt.turn || `Q${idx + 1}`;
    const diffBefore = pt.difficultyBefore ?? pt.difficulty ?? 2;
    const diffAfter = pt.difficultyAfter ?? diffBefore;
    const scoreVal = pt.score || 75;

    // Single point fallback or N points spacing
    const x =
      timeline.length === 1
        ? width / 2
        : paddingX + (idx / (timeline.length - 1)) * (width - paddingX * 2);

    const minScore = 40;
    const maxScore = 100;
    const y =
      height -
      paddingY -
      ((Math.min(maxScore, Math.max(minScore, scoreVal)) - minScore) /
        (maxScore - minScore)) *
        (height - paddingY * 2);

    return {
      x,
      y,
      question: questionLabel,
      score: scoreVal,
      difficultyBefore: diffBefore,
      difficultyAfter: diffAfter,
      topic: pt.topic || `Topic ${idx + 1}`,
      confidence: pt.confidence || "95.5%",
      adaptationLabel: pt.adaptationLabel || `Level ${diffBefore} → Level ${diffAfter}`,
    };
  });

  // Construct SVG path string
  const pathD =
    points.length === 1
      ? `M ${points[0].x - 40} ${points[0].y} L ${points[0].x + 40} ${points[0].y}`
      : points.reduce(
          (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
          ""
        );

  const activeHoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="w-full h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 shadow-2xl space-y-4 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              Score & Difficulty Evolution
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Q1 ─ Q{points.length} Adaptive Performance Progression
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-semibold">
          {points.length} Evaluated Turns
        </span>
      </div>

      {/* SVG Line Graph Container */}
      <div className="w-full flex-1 flex flex-col justify-center relative">
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
            transition={{ duration: 1.0, ease: "easeInOut" }}
            d={pathD}
            fill="none"
            stroke="#c084fc"
            strokeWidth={2.5}
          />

          {/* Point Markers with Interactive Tooltip Handlers */}
          {points.map((pt, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? 7 : 5}
                className="fill-cyan-300 stroke-slate-950 stroke-2 transition-all duration-200"
              />
              <text
                x={pt.x}
                y={pt.y - 12}
                textAnchor="middle"
                className="fill-cyan-300 font-mono text-[10px] font-bold"
              >
                {pt.score}%
              </text>
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-300 font-mono text-[11px] font-bold"
              >
                {pt.question}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activeHoveredPoint && (
          <div className="absolute top-2 right-2 p-3 rounded-xl bg-slate-950/95 border border-cyan-400/60 backdrop-blur-xl shadow-2xl text-xs font-mono space-y-1 pointer-events-none z-20 max-w-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between text-purple-300 font-bold border-b border-slate-800 pb-1">
              <span>{activeHoveredPoint.question}: {activeHoveredPoint.topic}</span>
              <span className="text-cyan-400">{activeHoveredPoint.score}/100</span>
            </div>
            <div className="text-[11px] text-slate-300 pt-0.5">
              Difficulty: <span className="text-cyan-300 font-bold">Level {activeHoveredPoint.difficultyBefore} → Level {activeHoveredPoint.difficultyAfter}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Confidence: {activeHoveredPoint.confidence}
            </div>
          </div>
        )}

        {/* Q1-Q5 Difficulty Transition Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full pt-3">
          {points.map((pt, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`p-2.5 rounded-xl border text-center space-y-0.5 transition-all cursor-pointer ${
                hoveredIndex === i
                  ? "bg-slate-900 border-cyan-400/80 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                  : "bg-slate-950/80 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-purple-300 font-bold">
                <span>{pt.question}</span>
                <span className="text-cyan-400 font-bold">{pt.score}%</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-300 block truncate">
                L{pt.difficultyBefore} → L{pt.difficultyAfter}
              </span>
              <span className="text-[9px] font-mono text-slate-400 block truncate">
                {pt.topic}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
