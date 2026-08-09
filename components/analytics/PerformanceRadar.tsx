"use client";

/**
 * components/analytics/PerformanceRadar.tsx
 *
 * Premium 5-Axis Performance Radar Chart Component.
 * Visualizes candidate evaluation results across:
 * Correctness, Reasoning, Depth, Communication, Engineering Judgement.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";
import type { RadarMetrics } from "@/app/api/analytics/route";

export interface PerformanceRadarProps {
  metrics?: RadarMetrics;
}

export function PerformanceRadar({
  metrics = { correctness: 88, reasoning: 92, depth: 84, communication: 90, engineering: 86 },
}: PerformanceRadarProps) {
  const labels = ["Correctness", "Reasoning", "Depth", "Communication", "Engineering"];
  const values = [
    metrics.correctness,
    metrics.reasoning,
    metrics.depth,
    metrics.communication,
    metrics.engineering,
  ];

  const size = 260;
  const center = size / 2;
  const radius = size * 0.38;

  // Compute 5-axis polygon points
  const points = values.map((val, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const r = (val / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  const bgGridPoints = [0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
    return labels.map((_, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const r = level * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  });

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              5-Axis Performance Radar
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Evaluated Capability Matrix
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          Rubric Vector
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background Concentric Radar Grid */}
          {bgGridPoints.map((pts, idx) => (
            <polygon
              key={idx}
              points={pts}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={0.7}
              strokeOpacity={0.15 + idx * 0.05}
            />
          ))}

          {/* Axis Spoke Lines */}
          {labels.map((_, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#a855f7"
                strokeWidth={0.8}
                strokeOpacity={0.3}
              />
            );
          })}

          {/* Animated Value Polygon */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            points={points}
            fill="rgba(56, 189, 248, 0.25)"
            stroke="#38bdf8"
            strokeWidth={2}
          />
        </svg>

        {/* Labels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full pt-4">
          {labels.map((label, idx) => (
            <div key={idx} className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">{label}</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{values[idx]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
