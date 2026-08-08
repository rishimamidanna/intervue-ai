"use client";

/**
 * components/interview/IntelligencePanel.tsx
 *
 * Right Intelligence Stack Panel for INTERVUE AI Live Interview Room.
 * Features 5 real-time glass cards:
 * 1. Adaptive Difficulty Card
 * 2. AI Confidence Card
 * 3. Knowledge Retrieval Card
 * 4. Knowledge Gap Detection Card
 * 5. Digital Twin Snapshot Card
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import {
  TrendingUp,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Database,
  Cpu,
} from "lucide-react";

export function IntelligencePanel() {
  const concepts = [
    { name: "Reciprocal Rank Fusion (RRF)", score: "98%" },
    { name: "Hybrid Retrieval", score: "94%" },
    { name: "BM25", score: "91%" },
    { name: "Vector Embeddings", score: "89%" },
    { name: "Query Intent Modeling", score: "87%" },
  ];

  const gaps = [
    { name: "Dynamic Weight Optimization", severity: "Medium", color: "text-amber-400" },
    { name: "Evaluation Metrics for RAG", severity: "Low", color: "text-rose-400" },
  ];

  return (
    <aside className="w-80 shrink-0 space-y-3 select-none">
      {/* CARD 1: Adaptive Difficulty */}
      <div className="bg-[#0e0a1b]/80 border border-purple-900/30 backdrop-blur-xl rounded-2xl p-4 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white">
              Adaptive Difficulty
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-[10px] font-semibold text-purple-300">
            <span>Level 7</span>
            <span className="text-emerald-400 font-mono">Increasing</span>
          </div>
        </div>

        {/* Animated Bar Chart */}
        <div className="flex items-end justify-between gap-1.5 h-12 pt-2 px-1">
          {[35, 45, 60, 50, 75, 65, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-purple-900/40 via-purple-600 to-indigo-400 rounded-t-sm shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all duration-500 hover:brightness-125"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <p className="text-[10px] text-zinc-400 leading-tight">
          This question adapts based on your answer quality and confidence.
        </p>
      </div>

      {/* CARD 2: AI Confidence */}
      <div className="bg-[#0e0a1b]/80 border border-purple-900/30 backdrop-blur-xl rounded-2xl p-4 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-white">AI Confidence</span>
        </div>

        <div className="flex items-center gap-4 py-1">
          {/* Circular Donut Gauge */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-500 stroke-purple-400 drop-shadow-[0_0_6px_#c084fc]"
                strokeDasharray="88, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-sm font-bold text-white">
              88%
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-purple-300">
              High Confidence
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              The AI is 88% confident in its understanding of your current knowledge.
            </p>
          </div>
        </div>

        {/* Mini Wave Graph */}
        <div className="pt-1 border-t border-purple-900/20">
          <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1">
            <span>Confidence Trend</span>
          </div>
          <svg className="w-full h-6 text-purple-400" viewBox="0 0 100 20">
            <path
              d="M0,15 Q20,5 40,12 T80,4 T100,10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="drop-shadow-[0_0_6px_#c084fc]"
            />
          </svg>
        </div>
      </div>

      {/* CARD 3: Knowledge Retrieval */}
      <div className="bg-[#0e0a1b]/80 border border-purple-900/30 backdrop-blur-xl rounded-2xl p-4 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white">
              Knowledge Retrieval
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 text-[9px] font-mono border border-purple-500/30">
            5 New Concepts
          </span>
        </div>

        <p className="text-[10px] text-zinc-400">
          Relevant concepts retrieved for this question.
        </p>

        {/* Concept Items */}
        <div className="space-y-1.5 pt-1">
          {concepts.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-zinc-950/40 border border-purple-900/20 hover:border-purple-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-zinc-300 truncate group-hover:text-white">
                  {c.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] text-zinc-400">
                <span>{c.score}</span>
                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-purple-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-right pt-1">
          <button className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 ml-auto">
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* CARD 4: Knowledge Gap Detection */}
      <div className="bg-[#0e0a1b]/80 border border-purple-900/30 backdrop-blur-xl rounded-2xl p-4 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-white">
              Knowledge Gap Detection
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/30">
            2 Gaps Identified
          </span>
        </div>

        <p className="text-[10px] text-zinc-400">
          Areas to strengthen based on your response.
        </p>

        {/* Gap Items */}
        <div className="space-y-1.5 pt-1">
          {gaps.map((g) => (
            <div
              key={g.name}
              className="flex items-center justify-between text-[11px] py-1.5 px-2 rounded-lg bg-zinc-950/40 border border-purple-900/20"
            >
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-zinc-300 truncate">{g.name}</span>
              </div>
              <span className={`text-[10px] font-mono font-medium ${g.color}`}>
                {g.severity}
              </span>
            </div>
          ))}
        </div>

        <div className="text-right pt-1">
          <button className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 ml-auto">
            <span>View Recommendations</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* CARD 5: Digital Twin Snapshot */}
      <div className="bg-[#0e0a1b]/80 border border-purple-900/30 backdrop-blur-xl rounded-2xl p-4 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-white">
            Digital Twin Snapshot
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Wireframe Neural Avatar Head SVG */}
          <div className="w-14 h-14 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <svg viewBox="0 0 100 100" className="w-10 h-10 text-purple-400">
              <circle cx="50" cy="40" r="22" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
              <path d="M 25,85 C 25,65 75,65 75,85" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="50" cy="35" r="4" fill="#c084fc" />
              <circle cx="42" cy="45" r="3" fill="#a855f7" />
              <circle cx="58" cy="45" r="3" fill="#a855f7" />
            </svg>
          </div>

          <div className="space-y-1 text-[10px]">
            <div>
              <span className="text-emerald-400 font-semibold">Strengths: </span>
              <span className="text-zinc-300">System Design, RAG, Python</span>
            </div>
            <div>
              <span className="text-amber-400 font-semibold">Focus Areas: </span>
              <span className="text-zinc-300">Ranking Models, Evaluation</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-1 pt-1 border-t border-purple-900/20">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-zinc-400">Overall Progress</span>
            <span className="text-purple-300 font-bold">72%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-950 rounded-full border border-purple-900/30 overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full shadow-[0_0_8px_#a855f7]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
