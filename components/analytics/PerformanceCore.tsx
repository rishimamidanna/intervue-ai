"use client";

/**
 * components/analytics/PerformanceCore.tsx
 *
 * Holographic AI Evaluation Laboratory Telemetry Panel.
 * Visualizes candidate reasoning and capability across 5 dimensions:
 * Correctness, Reasoning, Depth, Communication, and Engineering Judgement.
 *
 * Features:
 * - Counter-rotating holographic concentric telemetry rings
 * - Animated SVG AI evaluation waveform with pulsing frequency bars
 * - Live top-to-bottom scanning laser beam & grid effect
 * - Flowing neon data connection streams linking metrics to core
 * - Real-time telemetry pulse indicators
 * (NO 3D SPHERES, PLANETS, OR FLOATING BALLS).
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";
import type { RadarMetrics } from "@/app/api/analytics/route";

export interface PerformanceCoreProps {
  metrics?: RadarMetrics;
}

export function PerformanceCore({
  metrics = { correctness: 88, reasoning: 92, depth: 84, communication: 90, engineering: 86 },
}: PerformanceCoreProps) {
  const items = [
    { label: "Correctness", val: metrics.correctness, color: "from-cyan-500 to-blue-500", text: "text-cyan-400", border: "border-cyan-500/30" },
    { label: "Reasoning", val: metrics.reasoning, color: "from-purple-500 to-indigo-500", text: "text-purple-300", border: "border-purple-500/30" },
    { label: "Depth", val: metrics.depth, color: "from-indigo-500 to-cyan-500", text: "text-indigo-400", border: "border-indigo-500/30" },
    { label: "Communication", val: metrics.communication, color: "from-emerald-500 to-teal-500", text: "text-emerald-400", border: "border-emerald-500/30" },
    { label: "Engineering", val: metrics.engineering, color: "from-amber-500 to-purple-500", text: "text-amber-300", border: "border-amber-500/30" },
  ];

  return (
    <div className="relative w-full rounded-3xl bg-slate-950/90 border border-purple-500/30 backdrop-blur-2xl p-6 md:p-8 overflow-hidden shadow-2xl space-y-6">
      {/* Background Radial Glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar with Live Telemetry Indicators */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 relative" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-sans tracking-tight">
              Holographic AI Performance Telemetry
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              AI Evaluation Laboratory • Human Intelligence Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 flex items-center space-x-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>NEURAL MATRIX: 100% ONLINE</span>
          </span>
          <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 hidden sm:inline-block">
            MISSION CONTROL CORE
          </span>
        </div>
      </div>

      {/* Main Holographic Centerpiece & Waveform Display */}
      <div className="relative h-72 w-full rounded-2xl bg-slate-900/50 border border-purple-500/20 overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Animated Scanning Grid Laser Beam */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
        <motion.div
          animate={{ y: [0, 288, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.9)] z-20 pointer-events-none"
        />

        {/* Outer Counter-Rotating Holographic Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-64 h-64 rounded-full border border-dashed border-cyan-500/40 pointer-events-none"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute w-52 h-52 rounded-full border border-purple-500/50 pointer-events-none"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-40 h-40 rounded-full border border-dashed border-indigo-400/30 pointer-events-none"
        />

        {/* Central Waveform & Core Readiness Telemetry */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2 text-center">
          {/* Animated Waveform Bars */}
          <div className="flex items-center space-x-1.5 h-12 mb-1">
            {[40, 75, 95, 60, 100, 85, 90, 65, 80, 50, 88, 92, 70].map((h, idx) => (
              <motion.div
                key={idx}
                animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.5}%`] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: idx * 0.08,
                  ease: "easeInOut",
                }}
                className="w-1.5 rounded-full bg-gradient-to-t from-purple-600 via-indigo-400 to-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]"
              />
            ))}
          </div>

          <div className="space-y-0.5">
            <div className="text-4xl font-extrabold font-mono text-cyan-300 tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              {metrics.reasoning}%
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Peak Reasoning & Logic Score
            </div>
          </div>

          <div className="w-24 h-0.5 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
        </div>

        {/* Animated Connector Wave SVG Line across the background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <motion.path
            animate={{
              d: [
                "M 0 144 Q 120 80, 240 144 T 480 144 T 720 144 T 960 144",
                "M 0 144 Q 120 208, 240 144 T 480 144 T 720 144 T 960 144",
                "M 0 144 Q 120 80, 240 144 T 480 144 T 720 144 T 960 144",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            fill="none"
            stroke="url(#waveformGrad)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="waveformGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Flowing Data Connection Lines & 5 Metric Cards */}
      <div className="relative space-y-3">
        {/* Animated Connection Stream Line */}
        <div className="relative w-full h-1 bg-slate-900 overflow-hidden rounded-full">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(56,189,248,1)]"
          />
        </div>

        {/* 5-Dimension Metric Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`p-3.5 rounded-2xl bg-slate-950/80 border ${item.border} text-center space-y-2 relative group hover:border-cyan-400/60 transition-colors shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {item.label}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>

              <span className={`text-xl font-extrabold font-mono ${item.text} block`}>
                {item.val}%
              </span>

              {/* Progress Bar with Animated Pulse */}
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.val}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`h-full rounded-full bg-gradient-to-r ${item.color} shadow-[0_0_6px_rgba(56,189,248,0.5)]`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
