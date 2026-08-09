"use client";

/**
 * components/report/AIReasoningSummary.tsx
 *
 * "AI Interviewer Reasoning Summary & Trust Card" Component.
 * Placed immediately before the AI Final Verdict & Recommendation.
 *
 * Features:
 * 1. WHY CANDIDATE PASSED (✓ Strengths & Core Reasoning)
 * 2. IDENTIFIED RISKS (⚠ System Design Gaps & Nuance Limits)
 * 3. AI DECISION CONFIDENCE & HORIZONTAL TRUST METER (94% Confidence based on 4 grounding factors)
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";

export interface AIReasoningSummaryProps {
  passedReasons?: string[];
  identifiedRisks?: string[];
  confidenceScore?: number;
  evidenceFactors?: string[];
}

export function AIReasoningSummary({
  passedReasons = [
    "Strong technical reasoning across high-dimensional vector spaces",
    "Accurate architecture understanding of dense vs sparse embeddings",
    "Grounded RAG retrieval concepts with clear cosine similarity math",
    "Clear implementation thinking and modular code structure",
  ],
  identifiedRisks = [
    "Limited optimization depth in HNSW graph skip-list parameters",
    "Needs further exposure to production cross-encoder latency trade-offs",
    "Missing some GPU memory footprint edge-case considerations under high QPS",
  ],
  confidenceScore = 94,
  evidenceFactors = [
    "Evaluated technical candidate answers",
    "RAG retrieved curriculum vector sources",
    "5-axis weighted rubric dimension scores",
    "Knowledge Twin baseline-to-update delta",
  ],
}: AIReasoningSummaryProps) {
  return (
    <div className="rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-purple-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              EXECUTIVE AI DECISION AUDIT
            </span>
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              AGENT REASONING SUMMARY
            </span>
          </div>
          <h2 className="text-2xl font-extrabold font-sans text-white tracking-tight">
            AI Interviewer Reasoning Summary
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Synthesized reasoning model explaining passed criteria, identified risks, and decision confidence.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-purple-500/30 font-mono text-xs font-bold text-cyan-300 shadow-lg">
          Audited by INTERVUE Agent
        </div>
      </div>

      {/* 3 Executive Intelligence Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Card 1: WHY CANDIDATE PASSED */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3 shadow-xl hover:border-emerald-400/50 transition-colors flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                ✓ WHY CANDIDATE PASSED
              </h3>
              <span className="text-[10px] font-mono text-emerald-300">{passedReasons.length} Criteria Met</span>
            </div>

            <div className="space-y-2">
              {passedReasons.map((reason, idx) => (
                <div key={idx} className="text-xs font-mono text-emerald-300 flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block">Assessment: Technical Competency Confirmed</span>
          </div>
        </motion.div>

        {/* Card 2: IDENTIFIED RISKS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3 shadow-xl hover:border-amber-400/50 transition-colors flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                ⚠ IDENTIFIED RISKS
              </h3>
              <span className="text-[10px] font-mono text-amber-300">{identifiedRisks.length} Action Items</span>
            </div>

            <div className="space-y-2">
              {identifiedRisks.map((risk, idx) => (
                <div key={idx} className="text-xs font-mono text-amber-300 flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">⚠</span>
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block">Mitigation: Addressed in Recovery Plan</span>
          </div>
        </motion.div>

        {/* Card 3: AI DECISION CONFIDENCE & HORIZONTAL TRUST METER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3 shadow-xl hover:border-cyan-400/50 transition-colors flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                AI DECISION CONFIDENCE
              </h3>
              <span className="text-base font-extrabold font-mono text-cyan-300">{confidenceScore}%</span>
            </div>

            {/* Horizontal Trust Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Trust Meter</span>
                <span className="text-emerald-400 font-bold">High Grounding Index</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidenceScore}%` }}
                  transition={{ duration: 1.0 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.6)]"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Based On 4 Grounding Factors:</span>
              {evidenceFactors.map((factor, idx) => (
                <div key={idx} className="text-xs font-mono text-slate-300 flex items-center space-x-2">
                  <span className="text-cyan-400">•</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">Statistical Variance:</span>
            <span className="text-emerald-400 font-bold">&lt; 1.8% Low Variance</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
