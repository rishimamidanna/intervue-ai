"use client";

/**
 * components/knowledge-graph/RetrievedContextPanel.tsx
 *
 * Premium Glassmorphism "Retrieved Context Intelligence" Card Component.
 * Displays the Top-K knowledge chunks retrieved by the RAG pipeline with:
 * - Animated similarity progress bars
 * - Small retrieval confidence indicators
 * - Curriculum day sources
 * - Glass card subtle border hover interactions
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";
import type { RetrievedChunkItem } from "@/app/api/knowledge-graph/route";

export interface RetrievedContextPanelProps {
  retrievedChunks?: RetrievedChunkItem[];
}

export function RetrievedContextPanel({
  retrievedChunks = [
    { id: "01", title: "Vector Embeddings", similarity: 94, sourceDay: "Curriculum Day 12" },
    { id: "02", title: "HNSW Vector Search", similarity: 91, sourceDay: "Curriculum Day 18" },
    { id: "03", title: "Reranking Strategies", similarity: 87, sourceDay: "Curriculum Day 21" },
  ],
}: RetrievedContextPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 p-6 shadow-2xl space-y-5 hover:border-cyan-400/60 transition-all duration-300 group"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 group-hover:scale-105 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans tracking-wide">
              Retrieved Context Intelligence
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Top-K Knowledge Chunks
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          RAG Vector Match
        </span>
      </div>

      {/* Top-K Chunks List */}
      <div className="space-y-3">
        {retrievedChunks.map((chunk, idx) => {
          const confidenceBadge =
            chunk.similarity >= 90
              ? { text: "HIGH", color: "bg-cyan-500/10 text-cyan-300 border-cyan-400/30" }
              : { text: "MED", color: "bg-purple-500/10 text-purple-300 border-purple-400/30" };

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-2.5 hover:border-cyan-400/50 hover:bg-slate-950/90 transition-all group/item"
            >
              {/* Top Row: Index, Title, Confidence Badge & Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-xs font-bold text-cyan-300 group-hover/item:text-white group-hover/item:border-cyan-400">
                    {chunk.id}
                  </span>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-100 group-hover/item:text-cyan-300 transition-colors">
                      {chunk.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      Source: {chunk.sourceDay.startsWith("Curriculum") ? chunk.sourceDay : `Curriculum ${chunk.sourceDay}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded border ${confidenceBadge.color}`}>
                    {confidenceBadge.text}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {chunk.similarity}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated Similarity Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Similarity Score</span>
                  <span>{chunk.similarity}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${chunk.similarity}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
