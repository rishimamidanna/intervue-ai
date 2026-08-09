"use client";

/**
 * components/knowledge-graph/RAGPipelineStep.tsx
 *
 * 7-Node RAG Pipeline Step Progress Bar Component.
 * Visualizes data flow across the 7 internal RAG processing stages:
 * 1. Curriculum Knowledge Base
 * 2. Chunking Engine
 * 3. Embedding Space
 * 4. Vector Retrieval
 * 5. Reranking Engine
 * 6. LLM Context Window
 * 7. Evaluation Engine
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

export function RAGPipelineStep() {
  const steps = [
    { num: 1, name: "Curriculum DB", icon: "DB" },
    { num: 2, name: "Chunking", icon: "DOC" },
    { num: 3, name: "Embeddings", icon: "VEC" },
    { num: 4, name: "Vector Retrieval", icon: "SEARCH" },
    { num: 5, name: "Reranking", icon: "RANK" },
    { num: 6, name: "LLM Context", icon: "CTX" },
    { num: 7, name: "Evaluation", icon: "SCORE" },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100 font-sans">
            Internal RAG Processing Pipeline
          </h3>
          <p className="text-xs text-purple-300/80 font-mono">
            7-Stage Vector Dataflow Architecture
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
          ACTIVE DATA STREAM
        </span>
      </div>

      {/* Pipeline 7-Node Horizontal Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex flex-col items-center justify-between text-center space-y-2 group hover:border-cyan-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center font-mono text-xs font-bold text-purple-300 group-hover:text-cyan-300 group-hover:border-cyan-400">
              0{step.num}
            </div>
            <span className="text-xs font-mono font-semibold text-slate-200">
              {step.name}
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
