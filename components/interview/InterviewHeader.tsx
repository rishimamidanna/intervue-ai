"use client";

/**
 * components/interview/InterviewHeader.tsx
 *
 * Top Interview Header Bar for INTERVUE AI Command Center.
 * Displays Live Interview status badge, timer, and question progress bar.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { Clock } from "lucide-react";

interface InterviewHeaderProps {
  currentQuestion?: number;
  totalQuestions?: number;
  timerFormatted?: string;
}

export function InterviewHeader({
  currentQuestion = 8,
  totalQuestions = 15,
  timerFormatted = "00:24:38",
}: InterviewHeaderProps) {
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentQuestion / totalQuestions) * 100)
  );

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#0d0915]/60 backdrop-blur-xl border border-purple-900/30 rounded-2xl mb-4 text-xs select-none">
      {/* Left: Live Interview + AI Badge */}
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500 shadow-[0_0_8px_#c084fc]" />
        </span>
        <span className="text-sm font-semibold text-white tracking-wide">
          Live Interview
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] uppercase tracking-wider">
          AI
        </span>
      </div>

      {/* Right: Timer & Progress */}
      <div className="flex items-center gap-6">
        {/* Timer Card */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-purple-900/30 text-zinc-300 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>{timerFormatted}</span>
        </div>

        {/* Progress Section */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-zinc-300">
            {currentQuestion} <span className="text-zinc-600">/</span> {totalQuestions}
          </span>
          <div className="w-40 h-2 bg-zinc-950 rounded-full border border-purple-900/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-400 rounded-full shadow-[0_0_10px_#a855f7] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
