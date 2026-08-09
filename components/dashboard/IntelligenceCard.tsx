"use client";

/**
 * components/dashboard/IntelligenceCard.tsx
 *
 * Glassmorphic Sci-Fi Intelligence Card Component with 3D Tilt & Interactive Effects.
 * Features Framer Motion 3D tilt on hover, glowing neon borders, mini SVG sparklines,
 * skill badges, progress meters, and metrics.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface MetricItem {
  label: string;
  value: string | number;
  highlight?: boolean;
  color?: string;
}

export interface IntelligenceCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  metrics: MetricItem[];
  badgeText?: string;
  badgeColor?: "purple" | "cyan" | "emerald" | "amber";
  skills?: string[];
  showSparkline?: boolean;
  showProgressMeter?: boolean;
  meterValue?: number;
  children?: React.ReactNode;
  delay?: number;
}

export function IntelligenceCard({
  title,
  subtitle,
  icon,
  metrics,
  badgeText,
  badgeColor = "purple",
  skills,
  showSparkline = false,
  showProgressMeter = false,
  meterValue = 85,
  children,
  delay = 0,
}: IntelligenceCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX((-y / rect.height) * 12);
    setRotateY((x / rect.width) * 12);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const badgeColors = {
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative group h-full rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 p-5 shadow-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] transition-all duration-300 flex flex-col justify-between"
      >
        {/* Background Neon Accent Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/25 transition-all duration-500 pointer-events-none" />

        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-purple-500/30 text-purple-400 shadow-inner group-hover:text-purple-300 group-hover:border-purple-400/50 transition-colors">
                {icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100 tracking-wide font-sans">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-400 font-mono tracking-wider">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {badgeText && (
              <span
                className={`px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full border ${badgeColors[badgeColor]}`}
              >
                {badgeText}
              </span>
            )}
          </div>

          {/* Children (e.g. Radial Progress Orb) */}
          {children && <div className="my-3 flex justify-center">{children}</div>}

          {/* Skill Badges (Candidate Intelligence) */}
          {skills && skills.length > 0 && (
            <div className="my-3 flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Readiness Meter Bar */}
          {showProgressMeter && (
            <div className="my-3 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Readiness Barometer</span>
                <span className="text-amber-400 font-bold">{meterValue}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${meterValue}%` }}
                  transition={{ duration: 1, delay: delay + 0.2 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                />
              </div>
            </div>
          )}

          {/* Mini Sparkline Graph (AI Performance) */}
          {showSparkline && (
            <div className="my-3 p-2 rounded-xl bg-slate-950/60 border border-emerald-500/20">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Performance Trend</span>
                <span className="text-emerald-400 font-bold">+14.2%</span>
              </div>
              <svg className="w-full h-9 overflow-visible" viewBox="0 0 100 30">
                <defs>
                  <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,25 Q15,10 30,18 T60,8 T100,3 L100,30 L0,30 Z"
                  fill="url(#sparkline-grad)"
                />
                <path
                  d="M0,25 Q15,10 30,18 T60,8 T100,3"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          {/* Metric Rows */}
          <div className="space-y-2 mt-3">
            {metrics.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <span className="text-xs text-slate-400 font-mono">
                  {item.label}
                </span>
                <span
                  className={`text-sm font-semibold font-mono ${
                    item.color || (item.highlight ? "text-cyan-400" : "text-slate-200")
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Cyber Glow Line */}
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mt-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    </motion.div>
  );
}
