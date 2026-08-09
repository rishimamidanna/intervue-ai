"use client";

/**
 * components/dashboard/ProgressOrb.tsx
 *
 * Neon Radial Progress Orb Component.
 * Displays a glowing circular progress indicator with animated SVG stroke,
 * gradient accents, and central score/percentage label.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

interface ProgressOrbProps {
  value: number; // 0 to 100
  label: string;
  sublabel?: string;
  size?: number;
  colorScheme?: "purple" | "cyan" | "emerald" | "amber";
}

export function ProgressOrb({
  value,
  label,
  sublabel,
  size = 140,
  colorScheme = "purple",
}: ProgressOrbProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const colorMap = {
    purple: {
      stroke: "url(#gradient-purple)",
      glow: "drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]",
      text: "text-purple-400",
      gradient: (
        <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
      ),
    },
    cyan: {
      stroke: "url(#gradient-cyan)",
      glow: "drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]",
      text: "text-cyan-400",
      gradient: (
        <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      ),
    },
    emerald: {
      stroke: "url(#gradient-emerald)",
      glow: "drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]",
      text: "text-emerald-400",
      gradient: (
        <linearGradient id="gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      ),
    },
    amber: {
      stroke: "url(#gradient-amber)",
      glow: "drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]",
      text: "text-amber-400",
      gradient: (
        <linearGradient id="gradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      ),
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className={`transform -rotate-90 ${scheme.glow}`}>
        <defs>{scheme.gradient}</defs>

        {/* Background Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scheme.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      {/* Central Percentage Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`text-2xl font-bold font-mono ${scheme.text}`}
        >
          {Math.round(normalizedValue)}%
        </motion.span>
        {sublabel && (
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">
            {sublabel}
          </span>
        )}
      </div>

      <span className="text-xs font-medium text-slate-300 mt-2 font-mono uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
