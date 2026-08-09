"use client";

/**
 * components/report/EvaluationBreakdown.tsx
 *
 * SECTION 3: AI Evaluation Breakdown Component for Final Report.
 * Displays question-by-question analysis cards showing:
 * Question #, Topic, Candidate Answer Summary, AI Score (e.g. 82/100), AI Reasoning,
 * Positive Evidence (✓), Missing Evidence (⚠), RAG Source & Similarity, and
 * Expandable Retrieved Context Preview drawer.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface QuestionBreakdownItem {
  qNum: string;
  topic: string;
  answerSummary?: string;
  score: number;
  reasoning: any[];
  missing: any[];
  ragSource: string;
  similarity: number;
  retrievedContext?: string;
}

export interface EvaluationBreakdownProps {
  items?: QuestionBreakdownItem[];
}

function safeText(val: any): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    if (val.topic && val.description) return `${val.topic}: ${val.description}`;
    if (val.topic) return String(val.topic);
    if (val.description) return String(val.description);
    return JSON.stringify(val);
  }
  return String(val);
}

export function EvaluationBreakdown({
  items = [
    {
      qNum: "Question 1",
      topic: "RAG Foundations & Dense Embeddings",
      answerSummary: "Described dense vector space embeddings, mathematical distance calculations, and cosine similarity.",
      score: 88,
      reasoning: ["Explained dense vector embeddings", "Calculated cosine similarity accurately"],
      missing: ["Omitted HNSW graph partitioning"],
      ragSource: "Day 12: Vector Retrieval",
      similarity: 94,
      retrievedContext: "Vector embeddings represent text as high-dimensional floating-point arrays. Cosine distance measures vector direction alignment independent of magnitude: cos(theta) = (A dot B) / (||A||*||B||).",
    },
    {
      qNum: "Question 2",
      topic: "Vector Search & Indexing",
      answerSummary: "Covered multi-layer skip lists for nearest neighbor search, but missed probability scale decay parameters.",
      score: 82,
      reasoning: ["Described multi-layer skip lists", "Understood entry point nearest neighbor routing"],
      missing: ["No discussion of reranking latency"],
      ragSource: "Day 18: Vector Search",
      similarity: 92,
      retrievedContext: "Hierarchical Navigable Small World (HNSW) constructs multi-layer proximity graphs. Upper layers perform greedy long-range routing while lower layers refine local nearest neighbors.",
    },
    {
      qNum: "Question 3",
      topic: "Cross-Encoder Reranking",
      answerSummary: "Provided robust trade-off analysis comparing bi-encoder speed vs cross-encoder attention precision.",
      score: 95,
      reasoning: ["Flawless comparison of bi-encoder speed vs cross-encoder attention precision", "GPU batching intuition"],
      missing: [],
      ragSource: "Day 21: Reranking Strategies",
      similarity: 96,
      retrievedContext: "Two-stage retrieval pairs bi-encoders for fast top-K candidate retrieval with cross-encoders for full query-document attention reranking.",
    },
  ],
}: EvaluationBreakdownProps) {
  const [expandedContextIdx, setExpandedContextIdx] = useState<number | null>(null);

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xl font-extrabold font-sans text-white">AI Evaluation Breakdown</h3>
          <p className="text-xs text-slate-400 font-mono">Question-by-Question Evidence & Grounding Audit</p>
        </div>
        <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
          Turn Analysis
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.1 }}
            className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 shadow-lg hover:border-purple-400/40 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-400/40 font-mono text-xs font-bold text-purple-300">
                  {safeText(item.qNum)}
                </span>
                <h4 className="text-sm font-bold font-mono text-cyan-300">
                  Topic: {safeText(item.topic)}
                </h4>
              </div>

              <div className="px-3 py-1 rounded-xl bg-slate-900 border border-purple-500/30 font-mono text-xs font-bold text-cyan-300">
                Score: {item.score} / 100
              </div>
            </div>

            {/* Candidate Answer Summary */}
            {item.answerSummary && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Candidate Answer Summary</span>
                <p className="text-xs text-slate-300 font-sans">{safeText(item.answerSummary)}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Positive Reasoning */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  ✓ Positive Evidence Identified
                </span>
                <div className="space-y-1">
                  {item.reasoning.map((r, i) => (
                    <div key={i} className="text-xs font-mono text-emerald-300 flex items-center space-x-1.5">
                      <span>✓</span>
                      <span>{safeText(r)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Concepts */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                  ⚠ Missing Evidence & Gaps
                </span>
                {item.missing.length > 0 ? (
                  <div className="space-y-1">
                    {item.missing.map((m, i) => (
                      <div key={i} className="text-xs font-mono text-amber-300 flex items-center space-x-1.5">
                        <span>⚠</span>
                        <span>{safeText(m)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-mono text-slate-400 italic">No missing concepts detected in this response.</span>
                )}
              </div>
            </div>

            {/* RAG Source Citation Footer & Expandable Context Toggle */}
            <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">RAG Source: <strong className="text-slate-200">{safeText(item.ragSource)}</strong></span>
                <div className="flex items-center space-x-3">
                  <span className="text-cyan-300 font-bold">Similarity: {item.similarity}%</span>
                  <button
                    onClick={() => setExpandedContextIdx(expandedContextIdx === idx ? null : idx)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 text-[10px] font-mono transition-colors"
                  >
                    {expandedContextIdx === idx ? "Hide Context ▲" : "View Context ▼"}
                  </button>
                </div>
              </div>

              {/* Expandable Retrieved Context Preview Drawer */}
              <AnimatePresence>
                {expandedContextIdx === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300 bg-slate-950/80 p-3 rounded-lg overflow-hidden space-y-1"
                  >
                    <span className="text-[9px] font-mono text-purple-300 uppercase tracking-widest block">Retrieved Curriculum Context Snippet:</span>
                    <p className="italic text-slate-300">
                      &quot;{safeText(item.retrievedContext) || `Curriculum node ${item.ragSource} retrieved top-K chunks with ${item.similarity}% cosine similarity match.`}&quot;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
