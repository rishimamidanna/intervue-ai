"use client";

/**
 * components/analytics/AITelemetry.tsx
 *
 * Live AI Telemetry Panel Component.
 * Displays compact futuristic metric cards for:
 * - Evaluations Completed
 * - Average Response Analysis Time
 * - RAG Context Usage
 * - Retrieval Accuracy
 * - AI Decisions
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";

export interface AITelemetryProps {
  evaluationsCompleted?: number;
  avgResponseTimeMs?: number;
  ragContextUsage?: number;
  retrievalAccuracy?: number;
  aiDecisionsCount?: number;
}

export function AITelemetry({
  evaluationsCompleted = 4,
  avgResponseTimeMs = 1420,
  ragContextUsage = 94,
  retrievalAccuracy = 92,
  aiDecisionsCount = 11,
}: AITelemetryProps) {
  const cards = [
    { label: "Evaluations Completed", value: `${evaluationsCompleted}`, icon: "EVAL", color: "text-purple-300" },
    { label: "Avg Analysis Time", value: `${avgResponseTimeMs}ms`, icon: "TIME", color: "text-cyan-300" },
    { label: "RAG Context Usage", value: `${ragContextUsage}%`, icon: "RAG", color: "text-emerald-400" },
    { label: "Retrieval Accuracy", value: `${retrievalAccuracy}%`, icon: "ACC", color: "text-amber-300" },
    { label: "AI Decisions Logged", value: `${aiDecisionsCount}`, icon: "DEC", color: "text-cyan-400" },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              Live AI Infrastructure Telemetry
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Laboratory Performance Indicators
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
          HEALTHY
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/20 text-center space-y-1.5 hover:border-cyan-400/40 transition-colors"
          >
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">
              {card.label}
            </span>
            <span className={`text-lg font-bold font-mono ${card.color} block`}>
              {card.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
