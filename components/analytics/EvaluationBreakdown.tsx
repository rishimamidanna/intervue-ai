"use client";

/**
 * components/analytics/EvaluationBreakdown.tsx
 *
 * Enhanced RAG Intelligence Flow & Evaluation Pipeline Component.
 * Visual Flow:
 * Curriculum Source -> Chunk Selection -> Embedding Match -> Top-K Retrieval -> Context Assembly -> AI Evaluation
 *
 * Features: Animated data streams, connection lines, pipeline visualization (NO SPHERES).
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";

export function EvaluationBreakdown() {
  const steps = [
    { num: "01", name: "Curriculum Source", desc: "Day 12 Vector Search Specs", icon: "SRC" },
    { num: "02", name: "Chunk Selection", desc: "1000-Token Fixed Chunks", icon: "CHK" },
    { num: "03", name: "Embedding Match", desc: "Cosine Vector Distance", icon: "VEC" },
    { num: "04", name: "Top-K Retrieval", desc: "Top 3 Relevant Chunks", icon: "TOP" },
    { num: "05", name: "Context Assembly", desc: "Prompt Window Grounding", icon: "CTX" },
    { num: "06", name: "AI Evaluation", desc: "5-Dimension Rubric Scoring", icon: "EVL" },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 p-6 md:p-8 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              RAG Intelligence Dataflow Pipeline
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              6-Stage Grounded Vector Evaluation Architecture
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          6-Stage Flow
        </span>
      </div>

      {/* 6-Step Horizontal Pipeline with Data Stream Particles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative pt-1">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 flex flex-col justify-between space-y-2 relative group hover:border-cyan-400/50 transition-colors shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-[9px] font-bold text-cyan-300">
                {step.num}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                {step.name}
              </h4>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Animated Connector Line */}
      <div className="relative w-full h-1 bg-slate-950 overflow-hidden rounded-full mt-2">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
          className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(56,189,248,1)]"
        />
      </div>
    </div>
  );
}
