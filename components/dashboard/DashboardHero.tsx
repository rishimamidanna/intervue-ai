"use client";

/**
 * components/dashboard/DashboardHero.tsx
 *
 * Dashboard Header Hero Banner Component.
 * Features candidate profile status, active AI Knowledge Twin indicators,
 * readiness index (with Awaiting Intelligence Scan empty state), and CTA actions.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashboardHeroProps {
  candidateName?: string;
  roleTitle?: string;
  readinessScore?: number;
  hasSession?: boolean;
}

export function DashboardHero({
  candidateName = "Knowledge Twin",
  roleTitle = "Senior AI Engineer Cohort",
  readinessScore = 0,
  hasSession = false,
}: DashboardHeroProps) {
  const isEvaluated = hasSession && readinessScore > 0;

  const gradeBadge =
    readinessScore >= 90
      ? "A+"
      : readinessScore >= 80
      ? "A"
      : readinessScore >= 70
      ? "B"
      : "C";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-3xl bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 backdrop-blur-2xl border border-purple-500/30 p-6 md:p-8 shadow-2xl overflow-hidden mb-8"
    >
      {/* Glow Effects Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Profile Info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>AI KNOWLEDGE TWIN ACTIVE</span>
            </span>
            <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              LIVE SYNC
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-purple-100 to-cyan-300 font-sans tracking-tight">
            Welcome back, {candidateName}
          </h1>

          <p className="text-sm text-slate-300 font-mono flex items-center space-x-2">
            <span>{roleTitle}</span>
            <span className="text-purple-400">•</span>
            <span className="text-cyan-400">Curriculum Grounded</span>
          </p>
        </div>

        {/* Action Buttons & Readiness Snapshot */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Readiness Index Card */}
          <div className="px-5 py-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Readiness Index
              </div>
              {isEvaluated ? (
                <div className="text-2xl font-bold font-mono text-purple-300">
                  {readinessScore} <span className="text-xs text-slate-400">/ 100</span>
                </div>
              ) : (
                <div className="text-xs font-mono font-medium text-purple-300/90 mt-0.5">
                  Awaiting Intelligence Scan
                </div>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold font-mono text-sm">
              {isEvaluated ? gradeBadge : "--"}
            </div>
          </div>

          <Link
            href="/interview"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-semibold font-sans tracking-wide text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>{isEvaluated ? "Launch AI Interview" : "Complete AI Interview"}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
