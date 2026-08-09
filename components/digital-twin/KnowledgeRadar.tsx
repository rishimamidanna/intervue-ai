"use client";

/**
 * components/digital-twin/KnowledgeRadar.tsx
 *
 * 5-Axis Knowledge Radar Visualization Component.
 * Plots candidate technical capability across 5 key dimensions:
 * Correctness, Reasoning, Depth, Communication, and Engineering Judgement.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

interface KnowledgeRadarProps {
  scores?: {
    correctness: number;
    reasoning: number;
    depth: number;
    communication: number;
    engineering: number;
  };
}

export function KnowledgeRadar({
  scores = {
    correctness: 88,
    reasoning: 92,
    depth: 85,
    communication: 90,
    engineering: 86,
  },
}: KnowledgeRadarProps) {
  const axes = [
    { label: "Correctness", value: scores.correctness },
    { label: "Reasoning", value: scores.reasoning },
    { label: "Depth", value: scores.depth },
    { label: "Communication", value: scores.communication },
    { label: "Engineering", value: scores.engineering },
  ];

  // Radar polygon math setup
  const center = 110;
  const radius = 80;
  const totalAxes = axes.length;

  const points = axes.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
    const r = (axis.value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  });

  const polygonPath = points.join(" ");

  const gridCircles = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 shadow-2xl flex flex-col items-center justify-between">
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-slate-100 font-sans">
            Capability Radar
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            5-Dimension Engineering Topology
          </p>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
          Evaluated
        </span>
      </div>

      {/* SVG Radar Polygon Graph */}
      <div className="relative w-[220px] h-[220px]">
        <svg width="220" height="220" className="overflow-visible">
          <defs>
            <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Grid Concentric Rings */}
          {gridCircles.map((fraction, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * fraction}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray="3 3"
            />
          ))}

          {/* Axes Lines */}
          {axes.map((_, i) => {
            const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.12)"
              />
            );
          })}

          {/* Animated Filled Radar Polygon */}
          <motion.polygon
            points={polygonPath}
            fill="url(#radarGrad)"
            stroke="#38bdf8"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />

          {/* Axis Data Points */}
          {axes.map((axis, i) => {
            const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
            const r = (axis.value / 100) * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#c084fc"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Axis Metric Badges */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-purple-500/20 text-[11px] font-mono">
        {axes.map((axis, idx) => (
          <div key={idx} className="flex justify-between px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400">{axis.label}</span>
            <span className="text-cyan-400 font-bold">{axis.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
