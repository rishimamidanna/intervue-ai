"use client";

/**
 * components/interview/AnalysisBar.tsx
 *
 * Bottom AI Real-Time Analysis Bar for INTERVUE AI Live Interview Room.
 * Displays title header "AI is actively analyzing your response" and 5 live intelligence metrics:
 * 1. Understanding (Analyzing your answer)
 * 2. Relevance (Checking concept coverage)
 * 3. Depth (Evaluating explanation level)
 * 4. Structure (Assessing clarity & flow)
 * 5. Accuracy (Verifying technical correctness)
 * Features an animated purple energy waveform SVG line in the background.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { Sparkles, Brain, Target, Layers, AlignLeft, CheckCircle2 } from "lucide-react";

export function AnalysisBar() {
  const metrics = [
    {
      title: "Understanding",
      subtext: "Analyzing your answer",
      icon: Brain,
    },
    {
      title: "Relevance",
      subtext: "Checking concept coverage",
      icon: Target,
    },
    {
      title: "Depth",
      subtext: "Evaluating explanation level",
      icon: Layers,
    },
    {
      title: "Structure",
      subtext: "Assessing clarity & flow",
      icon: AlignLeft,
    },
    {
      title: "Accuracy",
      subtext: "Verifying technical correctness",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="relative overflow-hidden bg-[#090512]/90 border border-purple-900/30 backdrop-blur-2xl rounded-2xl p-4 space-y-3 shadow-[0_4px_25px_rgba(0,0,0,0.6)] select-none">
      {/* Background Animated Energy Waveform SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center">
        <svg
          className="w-full h-full text-purple-500"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 Q150,10 300,70 T600,40 T900,80 T1200,50"
            fill="none"
            stroke="url(#purpleGradient)"
            strokeWidth="3"
            className="animate-pulse"
          />
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
        </span>
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-semibold text-white tracking-wide">
          AI is actively analyzing your response
        </span>
      </div>

      {/* 5 Live Intelligence Metrics Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-purple-900/20 backdrop-blur-md hover:border-purple-500/40 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4 text-purple-300" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {m.title}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {m.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
