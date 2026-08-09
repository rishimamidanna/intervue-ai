"use client";

/**
 * components/analytics/DecisionIntelligenceLayer.tsx
 *
 * AI Decision Intelligence Layer Component.
 * Visual bridge showing how the AI moves from candidate answer -> reasoning -> decision -> next action.
 *
 * Contains 4 Sub-Components:
 * 1. Decision Flow Visualization (6-Node Horizontal RAG Pipeline with animated data streams)
 * 2. AI Reasoning Metrics Panel (Reasoning Depth 82%, Context Alignment 91%, Evaluation Conf 94%, Reliability 89%)
 * 3. Adaptive Strategy Graph (Easy -> Medium -> Advanced line chart with rationale)
 * 4. Evidence Connection Map (Candidate Answer | Retrieved RAG Context | Evaluation Criteria | Final AI Decision)
 *
 * Design: Dark glassmorphism, purple/cyan neon accents, laboratory dashboard aesthetic.
 * (NO SPHERES, PLANETS, OR RANDOM 3D OBJECTS).
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";

export function DecisionIntelligenceLayer() {
  const pipelineNodes = [
    { title: "Candidate Answer", status: "Processed", latency: "120ms", conf: "99%", icon: "ANS" },
    { title: "Semantic Analysis", status: "Parsed", latency: "210ms", conf: "96%", icon: "SEM" },
    { title: "RAG Retrieval", status: "Retrieved", latency: "340ms", conf: "94%", icon: "RAG" },
    { title: "Rubric Evaluation", status: "Scored", latency: "480ms", conf: "92%", icon: "RUB" },
    { title: "AI Decision", status: "Escalated", latency: "150ms", conf: "95%", icon: "DEC" },
    { title: "Twin Update", status: "Persisted", latency: "120ms", conf: "98%", icon: "TWN" },
  ];

  const reasoningMetrics = [
    { label: "Reasoning Depth", val: 82, color: "text-purple-300", stroke: "stroke-purple-400" },
    { label: "Context Alignment", val: 91, color: "text-cyan-300", stroke: "stroke-cyan-400" },
    { label: "Evaluation Confidence", val: 94, color: "text-emerald-400", stroke: "stroke-emerald-400" },
    { label: "Decision Reliability", val: 89, color: "text-amber-300", stroke: "stroke-amber-400" },
  ];

  return (
    <div className="rounded-3xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-2xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-cyan-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              AI DECISION INTELLIGENCE LAYER
            </span>
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              REASONING & ADAPTATION BRIDGE
            </span>
          </div>
          <h2 className="text-2xl font-bold font-sans text-white tracking-tight">
            AI Decision & Adaptation Pipeline
          </h2>
          <p className="text-xs font-mono text-slate-400">
            &quot;The AI does not only score answers. It understands, retrieves evidence, explains decisions, and adapts.&quot;
          </p>
        </div>

        <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-widest rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 shadow-md">
          REAL-TIME ADAPTATION
        </span>
      </div>

      {/* 1. DECISION FLOW VISUALIZATION (6-Node Pipeline with Animated Data Stream) */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            1. Decision Flow Data Pipeline
          </h3>
          <span className="text-[10px] font-mono text-cyan-300">Total Latency: 1.42s</span>
        </div>

        {/* 6-Node Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
          {pipelineNodes.map((node, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="p-3.5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 space-y-2 relative group hover:border-cyan-400/50 transition-colors shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-[9px] font-bold text-cyan-300">
                  {node.icon}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {node.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>{node.latency}</span>
                  <span className="text-cyan-300">{node.conf}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated Connector Line Below Pipeline */}
        <div className="relative w-full h-1 bg-slate-900 overflow-hidden rounded-full mt-2">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
            className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(56,189,248,1)]"
          />
        </div>
      </div>

      {/* Grid: 2. AI Reasoning Metrics + 3. Adaptive Strategy Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        {/* 2. AI REASONING METRICS PANEL (Lg: 6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/60 border border-purple-500/30 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              2. AI Reasoning Metrics Panel
            </h3>
            <span className="text-[10px] font-mono text-purple-300">Telemetry Audit</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {reasoningMetrics.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {m.label}
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-extrabold font-mono ${m.color}`}>
                    {m.val}%
                  </span>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.val}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. ADAPTIVE STRATEGY GRAPH (Lg: 6 cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/60 border border-cyan-500/30 p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              3. Adaptive Strategy Difficulty Trajectory
            </h3>
            <span className="text-[10px] font-mono text-cyan-300">Easy → Advanced</span>
          </div>

          {/* Difficulty Line Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Previous: <strong className="text-cyan-300">Easy (2/5)</strong></span>
              <span className="text-slate-400">Current: <strong className="text-purple-300">Medium (3/5)</strong></span>
              <span className="text-slate-400">Next: <strong className="text-emerald-400">Advanced (4/5)</strong></span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Escalation Rationale</span>
                <span className="text-emerald-400 font-bold">96% Confident</span>
              </div>
              <p className="text-xs text-slate-200 font-sans">
                Candidate demonstrated 94% vector retrieval correctness on turn Q1. Elevating next topic to advanced graph partitioning.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">Q1: Easy</div>
            <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/30 text-purple-300">Q2: Medium</div>
            <div className="p-2 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 font-bold">Q3: Advanced</div>
          </div>
        </div>
      </div>

      {/* 4. EVIDENCE CONNECTION MAP */}
      <div className="rounded-2xl bg-slate-900/60 border border-purple-500/30 p-5 space-y-4 shadow-xl relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            4. Evidence Connection Map
          </h3>
          <span className="text-[10px] font-mono text-purple-300">Connected Grounding</span>
        </div>

        {/* 4-Node Vertical/Horizontal Connector Tree */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">Input Node</span>
            <span className="text-xs font-mono font-bold text-slate-200 block">Candidate Answer</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-center space-y-1">
            <span className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest block">Evidence Node</span>
            <span className="text-xs font-mono font-bold text-cyan-300 block">Retrieved RAG Context</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 text-center space-y-1">
            <span className="text-[9px] font-mono text-purple-300 uppercase tracking-widest block">Evaluation Node</span>
            <span className="text-xs font-mono font-bold text-purple-300 block">Evaluation Criteria</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-center space-y-1">
            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block">Action Node</span>
            <span className="text-xs font-mono font-bold text-emerald-400 block">Final AI Decision</span>
          </div>
        </div>
      </div>
    </div>
  );
}
