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

export interface Concept {
  name: string;
  score: string;
}

export interface Gap {
  name: string;
  severity: string;
  color: string;
}

interface IntelligencePanelProps {
  difficulty?: number;
  difficultyTrend?: string;
  confidence?: number;
  concepts?: Concept[];
  gaps?: Gap[];
}

export function IntelligencePanel({
  difficulty = 7,
  difficultyTrend = "Increasing",
  confidence = 88,
  concepts = [
    { name: "Reciprocal Rank Fusion (RRF)", score: "98%" },
    { name: "Hybrid Retrieval", score: "94%" },
    { name: "BM25", score: "91%" },
    { name: "Vector Embeddings", score: "89%" },
    { name: "Query Intent Modeling", score: "87%" },
  ],
  gaps = [
    { name: "Dynamic Weight Optimization", severity: "Medium", color: "text-amber-400" },
    { name: "Evaluation Metrics for RAG", severity: "Low", color: "text-rose-400" },
  ],
}: IntelligencePanelProps) {
  return (
    <aside className="w-80 shrink-0 space-y-2 select-none">
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
            <span>Level {difficulty}</span>
            <span className="text-emerald-400 font-mono">{difficultyTrend}</span>
          </div>
        </div>

        {/* Animated Bar Chart */}
        <div className="flex items-end justify-between gap-1.5 h-12 pt-2 px-1">
          {[35, 45, 60, 50, 75, 65, Math.min(100, difficulty * 10)].map((h, i) => (
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
              <defs>
                <linearGradient id="confidence-ring-gradient" x1="4" y1="30" x2="31" y2="5" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#6d28d9" />
                  <stop offset="0.5" stopColor="#a855f7" />
                  <stop offset="0.8" stopColor="#d8b4fe" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
                <filter id="confidence-ring-glow" x="-55%" y="-55%" width="210%" height="210%">
                  <feGaussianBlur stdDeviation="1.05" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                className="text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeDasharray={`${Math.round(confidence * 0.9)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="url(#confidence-ring-gradient)"
                fill="none"
                filter="url(#confidence-ring-glow)"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="4;0;-1;0;4"
                  dur="4.8s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;0.35;0.55;0.72;1"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
                />
                <animate attributeName="opacity" values="0.82;1;0.88;1;0.82" dur="4.8s" repeatCount="indefinite" />
              </path>
            </svg>
            <span className="absolute font-mono text-sm font-bold text-white">
              {confidence}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-purple-300">
              {confidence >= 90 ? "Very High Confidence" : confidence >= 80 ? "High Confidence" : "Moderate Confidence"}
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              The AI is {confidence}% confident in its understanding of your current knowledge.
            </p>
          </div>
        </div>

        {/* Confidence Trend Graph */}
        <div className="pt-1 border-t border-purple-900/20">
          <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1">
            <span>Confidence Trend</span>
          </div>
          <svg
            aria-hidden="true"
            className="h-7 w-full overflow-visible"
            viewBox="0 0 260 40"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="confidence-trend-stroke"
                x1="4"
                y1="30"
                x2="256"
                y2="10"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#6d28d9" />
                <stop offset="0.5" stopColor="#a855f7" />
                <stop offset="1" stopColor="#e9d5ff" />
              </linearGradient>
              <linearGradient
                id="confidence-trend-area"
                x1="0"
                y1="5"
                x2="0"
                y2="40"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#a855f7" stopOpacity="0.18" />
                <stop offset="1" stopColor="#6d28d9" stopOpacity="0" />
              </linearGradient>
              <filter
                id="confidence-trend-glow"
                x="-20%"
                y="-80%"
                width="140%"
                height="260%"
              >
                <feGaussianBlur stdDeviation="1.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect
              x="1"
              y="1"
              width="258"
              height="38"
              rx="5"
              fill="#020208"
              fillOpacity="0.34"
              stroke="#8b5cf6"
              strokeOpacity="0.08"
              strokeWidth="0.5"
            />

            <g stroke="#a78bfa" strokeWidth="0.35" opacity="0.1">
              <path d="M0 12 H260" />
              <path d="M0 24 H260" />
              <path d="M0 36 H260" />
              <path d="M52 0 V40" />
              <path d="M104 0 V40" />
              <path d="M156 0 V40" />
              <path d="M208 0 V40" />
            </g>

            <path
              d="M4 31 C20 27 28 16 45 21 C62 28 76 32 92 23 C108 13 120 16 136 19 C154 23 162 31 179 25 C198 18 204 7 222 13 C238 20 245 5 256 9 L256 40 L4 40 Z"
              fill="url(#confidence-trend-area)"
            />
            <path
              d="M4 31 C20 27 28 16 45 21 C62 28 76 32 92 23 C108 13 120 16 136 19 C154 23 162 31 179 25 C198 18 204 7 222 13 C238 20 245 5 256 9"
              fill="none"
              stroke="#a855f7"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.12"
              filter="url(#confidence-trend-glow)"
            />
            <path
              d="M4 31 C20 27 28 16 45 21 C62 28 76 32 92 23 C108 13 120 16 136 19 C154 23 162 31 179 25 C198 18 204 7 222 13 C238 20 245 5 256 9"
              pathLength="1"
              fill="none"
              stroke="url(#confidence-trend-stroke)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              filter="url(#confidence-trend-glow)"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="1"
                to="0"
                dur="1.6s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.16 1 0.3 1"
              />
            </path>

            <g fill="#c084fc" filter="url(#confidence-trend-glow)">
              <circle cx="45" cy="21" r="0.95">
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.8s" repeatCount="indefinite" />
                <animate attributeName="r" values="0.8;1.25;0.8" dur="2.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="136" cy="19" r="0.95">
                <animate attributeName="opacity" values="0.25;0.85;0.25" dur="3.2s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="r" values="0.8;1.25;0.8" dur="3.2s" begin="0.7s" repeatCount="indefinite" />
              </circle>
              <circle cx="222" cy="13" r="0.95">
                <animate attributeName="opacity" values="0.25;0.9;0.25" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="r" values="0.8;1.3;0.8" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
              </circle>
            </g>

            <circle r="3.4" fill="#a855f7" opacity="0.16" filter="url(#confidence-trend-glow)">
              <animateMotion
                dur="5.8s"
                repeatCount="indefinite"
                path="M4 31 C20 27 28 16 45 21 C62 28 76 32 92 23 C108 13 120 16 136 19 C154 23 162 31 179 25 C198 18 204 7 222 13 C238 20 245 5 256 9"
              />
            </circle>
            <circle r="1.25" fill="#f5f3ff" filter="url(#confidence-trend-glow)">
              <animateMotion
                dur="5.8s"
                repeatCount="indefinite"
                path="M4 31 C20 27 28 16 45 21 C62 28 76 32 92 23 C108 13 120 16 136 19 C154 23 162 31 179 25 C198 18 204 7 222 13 C238 20 245 5 256 9"
              />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="1.4s" repeatCount="indefinite" />
            </circle>

            <circle cx="256" cy="9" r="1.7" fill="#f5f3ff" filter="url(#confidence-trend-glow)">
              <animate
                attributeName="opacity"
                values="0.65;1;0.65"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="256" cy="9" r="2" fill="none" stroke="#c084fc" strokeWidth="0.8">
              <animate
                attributeName="r"
                values="2;5.5;2"
                dur="2.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.75;0;0.75"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      </div>

      {/* CARD 3: Knowledge Retrieval */}
      <div className="bg-[#0e0a1b]/80 border border-purple-900/30 backdrop-blur-xl rounded-2xl p-3 space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white">
              Knowledge Retrieval
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 text-[9px] font-mono border border-purple-500/30">
            {concepts.length} Concepts
          </span>
        </div>

        <p className="text-[10px] text-zinc-400">
          Relevant concepts retrieved for this question.
        </p>

        {/* Concept Items */}
        <div className="space-y-1 pt-0.5">
          {concepts.map((c) => (
            <div
              key={c.name}
              className="group flex items-center justify-between rounded-lg border border-purple-900/20 bg-zinc-950/40 px-2 py-0.5 text-[10px] transition-all hover:border-purple-500/30"
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

        <div className="text-right pt-0.5">
          <button className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 ml-auto">
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* CARD 4: Knowledge Gap Detection */}
      <div className="bg-[#0e0a1b]/80 border border-purple-900/30 backdrop-blur-xl rounded-2xl p-3.5 space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-white">
              Knowledge Gap Detection
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/30">
            {gaps.length} {gaps.length === 1 ? "Gap" : "Gaps"} Identified
          </span>
        </div>

        <p className="text-[10px] text-zinc-400">
          Areas to strengthen based on your response.
        </p>

        {/* Gap Items */}
        <div className="space-y-1 pt-0.5">
          {gaps.length > 0 ? (
            gaps.map((g) => (
              <div
                key={g.name}
                className="flex items-center justify-between rounded-lg border border-purple-900/20 bg-zinc-950/40 px-2 py-0.5 text-[10px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-zinc-300 truncate">{g.name}</span>
                </div>
                <span className={`text-[10px] font-mono font-medium ${g.color}`}>
                  {g.severity}
                </span>
              </div>
            ))
          ) : (
            <div className="py-2 text-center text-[10px] text-emerald-400 font-mono">
              ✓ No gaps detected for this topic
            </div>
          )}
        </div>

        <div className="text-right pt-0.5">
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
