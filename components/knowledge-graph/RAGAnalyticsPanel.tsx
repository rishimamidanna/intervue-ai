"use client";

/**
 * components/knowledge-graph/RAGAnalyticsPanel.tsx
 *
 * RAG System Status & Telemetry Observability Glass Panel Component.
 * Displays enterprise RAG telemetry: Semantic Retrieval Score, Top-K Retrieved Chunks,
 * Knowledge Nodes Activated, Context Alignment Score, and Grounding Score.
 * Includes live AI processing status indicators (Embedding Engine, Vector Index, Latency).
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

export interface RAGAnalyticsProps {
  semanticRetrievalScore: number;
  topKRetrievedChunksCount: number;
  knowledgeNodesActivatedCount: number;
  contextAlignmentScore: number;
  groundingScore: number;
  systemStatus?: {
    embeddingEngine: string;
    vectorIndex: string;
    retrieverLatency: string;
    contextWindow: string;
  };
}

export function RAGAnalyticsPanel({
  semanticRetrievalScore = 94,
  topKRetrievedChunksCount = 24,
  knowledgeNodesActivatedCount = 18,
  contextAlignmentScore = 87,
  groundingScore = 85,
  systemStatus = {
    embeddingEngine: "Active",
    vectorIndex: "Healthy",
    retrieverLatency: "8ms",
    contextWindow: "Optimized",
  },
}: RAGAnalyticsProps) {
  const metrics = [
    { label: "Semantic Retrieval Score", value: `${semanticRetrievalScore}%`, color: "text-cyan-400" },
    { label: "Top-K Retrieved Chunks", value: `${topKRetrievedChunksCount}`, color: "text-purple-300" },
    { label: "Knowledge Nodes Activated", value: `${knowledgeNodesActivatedCount}`, color: "text-emerald-400" },
    { label: "Context Alignment Score", value: `${contextAlignmentScore}%`, color: "text-cyan-300" },
    { label: "Grounding Score", value: `${groundingScore}%`, color: "text-amber-400" },
  ];

  const statusList = [
    { label: "Embedding Engine", status: systemStatus.embeddingEngine, color: "text-emerald-400" },
    { label: "Vector Index", status: systemStatus.vectorIndex, color: "text-cyan-300" },
    { label: "Retriever Latency", status: systemStatus.retrieverLatency, color: "text-purple-300" },
    { label: "Context Window", status: systemStatus.contextWindow, color: "text-amber-300" },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              RAG System Status
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Vector Pipeline Observability
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          Live Backend
        </span>
      </div>

      {/* Metrics List */}
      <div className="space-y-2.5">
        {metrics.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition-colors"
          >
            <span className="text-xs text-slate-400 font-mono">{item.label}</span>
            <span className={`text-sm font-bold font-mono ${item.color}`}>
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Live Processing System Indicators */}
      <div className="pt-2 border-t border-purple-500/20 space-y-3">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          Live System Health
        </span>
        <div className="grid grid-cols-2 gap-2">
          {statusList.map((st, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
            >
              <span className="text-[11px] font-mono text-slate-400">{st.label}</span>
              <span className={`text-xs font-mono font-semibold ${st.color} flex items-center space-x-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{st.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
