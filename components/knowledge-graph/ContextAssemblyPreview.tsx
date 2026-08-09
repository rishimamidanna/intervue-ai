"use client";

/**
 * components/knowledge-graph/ContextAssemblyPreview.tsx
 *
 * Premium Glassmorphism "Context Assembly Preview" Card Component.
 * Visualizes how retrieved RAG chunks are assembled into the LLM Context Window:
 * - Retrieved Chunks count
 * - Context Token budget bar (e.g. 1842 / 8192)
 * - Prompt Grounding percentage
 * - Context Compression status
 * - Generation Status glowing indicator
 * - Animated token flow particle streams
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

export interface ContextAssemblyProps {
  retrievedChunksCount?: number;
  contextTokens?: number;
  maxContextTokens?: number;
  promptGrounding?: number;
  contextCompression?: string;
  generationStatus?: string;
}

export function ContextAssemblyPreview({
  retrievedChunksCount = 3,
  contextTokens = 1842,
  maxContextTokens = 8192,
  promptGrounding = 92,
  contextCompression = "Optimized",
  generationStatus = "READY FOR GENERATION",
}: ContextAssemblyProps) {
  const tokenPercentage = Math.min(100, Math.round((contextTokens / maxContextTokens) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 shadow-2xl space-y-5 hover:border-purple-400/60 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 group-hover:border-purple-400 group-hover:scale-105 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.602 15.13a2 2 0 00-1.228.175l-.946.473L3 16.5m16.428-1.072l1.072 2.144A2 2 0 0118.683 20H5.317a2 2 0 01-1.817-1.428l1.072-2.144m14.856 0L21 16.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans tracking-wide">
              Context Assembly Preview
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              LLM Context Window Synthesis
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
          LLM CONTEXT WINDOW
        </span>
      </div>

      {/* Generation Status Banner */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">Generation Status</span>
        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{generationStatus}</span>
        </span>
      </div>

      {/* Context Tokens Progress Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/20 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Context Tokens</span>
          <span className="font-bold text-purple-300">
            {contextTokens} <span className="text-slate-500">/ {maxContextTokens}</span>
          </span>
        </div>

        <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tokenPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Retrieved Chunks
          </span>
          <span className="text-base font-bold font-mono text-cyan-300 mt-1 block">
            {retrievedChunksCount}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Prompt Grounding
          </span>
          <span className="text-base font-bold font-mono text-purple-300 mt-1 block">
            {promptGrounding}%
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Compression
          </span>
          <span className="text-xs font-bold font-mono text-emerald-400 mt-1 block">
            {contextCompression}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
