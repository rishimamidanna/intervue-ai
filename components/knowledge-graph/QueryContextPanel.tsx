"use client";

/**
 * components/knowledge-graph/QueryContextPanel.tsx
 *
 * Current RAG Query & Concept Match Panel Component.
 * Displays the active RAG query string, retrieved concept tags, and context confidence.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

export interface QueryContextProps {
  currentQuery?: string;
  retrievedConcepts?: string[];
  contextConfidence?: string;
}

export function QueryContextPanel({
  currentQuery = "Explain Retrieval-Augmented Generation (RAG)",
  retrievedConcepts = ["Embeddings", "Vector Search", "Chunking", "Reranking"],
  contextConfidence = "High",
}: QueryContextProps) {
  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 p-6 shadow-2xl space-y-4 hover:border-cyan-400/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">
              Current RAG Query
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Vector Context Alignment
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          Confidence: {contextConfidence}
        </span>
      </div>

      {/* Query Card */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 font-mono text-xs text-cyan-200 shadow-inner">
        &quot;{currentQuery}&quot;
      </div>

      {/* Retrieved Concepts List */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          Retrieved RAG Concepts
        </span>
        <div className="flex flex-wrap gap-2">
          {retrievedConcepts.map((concept, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="px-3 py-1 text-xs font-mono rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 flex items-center space-x-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{concept}</span>
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
