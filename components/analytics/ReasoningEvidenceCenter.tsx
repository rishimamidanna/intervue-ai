"use client";

/**
 * components/analytics/ReasoningEvidenceCenter.tsx
 *
 * Enhanced AI Reasoning Evidence Center Component (Hackathon Differentiator).
 * Explains why the AI gave scores and how RAG context influenced evaluation.
 *
 * Displays:
 * 1. Evaluation Decision Card: Question Asked, Candidate Answer Summary, AI Score Given,
 *    Why Score Was Given, Positive Evidence (✓), Missing Evidence (⚠), RAG Grounding Source & Similarity.
 * 2. RAG Grounding Evidence Panel (Retrieved curriculum sources, Similarity scores, Context chunks, Token usage)
 * 3. AI Decision Explanation Card (Previous difficulty, AI decision, Reason for decision, Next interview strategy)
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface EvidenceItem {
  qNum: string;
  questionText: string;
  topic: string;
  answerSummary: string;
  scoreGiven: number;
  whyScore: string;
  positiveEvidence: string[];
  missingEvidence: string[];
  ragSources: { title: string; score: number; day: string }[];
  prevDifficulty: number;
  newDifficulty: number;
  decision: string;
  decisionReason: string;
  nextStrategy: string;
}

export function ReasoningEvidenceCenter() {
  const [selectedTurnIdx, setSelectedTurnIdx] = useState<number>(0);

  const turns: EvidenceItem[] = [
    {
      qNum: "Q1",
      questionText: "Explain Vector Databases & Dense Retrieval",
      topic: "RAG Architecture & Embeddings",
      answerSummary: "Candidate described vector space math, dense embeddings, and cosine similarity calculation.",
      scoreGiven: 82,
      whyScore: "Demonstrated accurate understanding of embeddings and distance metrics, but omitted indexing algorithms.",
      positiveEvidence: ["Explained dense vector embeddings", "Mentioned cosine similarity search", "Understood high-dimensional vector spaces"],
      missingEvidence: ["No discussion of graph/IVF indexing", "No latency optimization concepts"],
      ragSources: [
        { title: "Curriculum Day 12 - Vector Retrieval", score: 94, day: "Day 12" },
        { title: "Dense vs Sparse Retrieval Models", score: 91, day: "Day 14" },
      ],
      prevDifficulty: 2,
      newDifficulty: 3,
      decision: "Increased Difficulty to 3/5",
      decisionReason: "Candidate mastered fundamentals; escalating to graph indexing algorithms.",
      nextStrategy: "Probe HNSW graph partitioning and query latency bounds.",
    },
    {
      qNum: "Q2",
      questionText: "How does HNSW graph partitioning optimize nearest neighbor search?",
      topic: "HNSW Vector Graph Indexing",
      answerSummary: "Described multi-layer graph skip lists, but missed layer probability decay parameters.",
      scoreGiven: 79,
      whyScore: "Solid grasp of multi-layer graph traversal, but omitted mathematical scale factor formula.",
      positiveEvidence: ["Explained multi-layer skip list structure", "Described entry point nearest neighbor routing"],
      missingEvidence: ["Missed mL probability scaling factor", "Omitted memory footprint trade-off"],
      ragSources: [
        { title: "Curriculum Day 18 - HNSW Graph Partitioning", score: 92, day: "Day 18" },
        { title: "Inverted File Index (IVF) Comparison", score: 88, day: "Day 19" },
      ],
      prevDifficulty: 3,
      newDifficulty: 3,
      decision: "Maintained Level 3/5 & Asked Follow-up",
      decisionReason: "Probed parameter tuning nuance before escalating difficulty further.",
      nextStrategy: "Target cross-encoder reranking and context compression.",
    },
    {
      qNum: "Q3",
      questionText: "Compare Bi-Encoder vs Cross-Encoder reranking trade-offs",
      topic: "Cross-Encoder Reranking & Latency",
      answerSummary: "Flawless trade-off analysis comparing bi-encoder speed vs cross-encoder attention precision.",
      scoreGiven: 94,
      whyScore: "Exceptional system design judgement balancing top-K candidate reduction with GPU batching.",
      positiveEvidence: ["Bi-encoder speed vs Cross-encoder precision", "Top-K candidate reduction strategy", "GPU batching and latency bounds"],
      missingEvidence: [],
      ragSources: [
        { title: "Curriculum Day 21 - Two-Stage RAG Reranking", score: 96, day: "Day 21" },
        { title: "Cross-Encoder Attention Mechanisms", score: 93, day: "Day 22" },
      ],
      prevDifficulty: 3,
      newDifficulty: 4,
      decision: "Escalated to Level 4/5 Advanced",
      decisionReason: "Mastery confirmed across all 7 RAG nodes; testing systemic failure modes.",
      nextStrategy: "Evaluate production fault tolerance and cache invalidation under high load.",
    },
  ];

  const currentTurn = turns[selectedTurnIdx];

  return (
    <div className="rounded-3xl bg-slate-950/90 border border-purple-500/30 backdrop-blur-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              AI REASONING EVIDENCE CENTER
            </span>
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              EXPLAINABLE DECISION CARDS
            </span>
          </div>
          <h2 className="text-2xl font-extrabold font-sans text-white tracking-tight">
            Evaluation Decision Audit
          </h2>
          <p className="text-xs font-mono text-slate-400">
            &quot;This AI does not only score candidates. It retrieves knowledge, reasons over evidence, and explains decisions.&quot;
          </p>
        </div>

        {/* Turn Selector Buttons */}
        <div className="flex items-center space-x-1.5 rounded-xl bg-slate-900 p-1 border border-purple-500/30">
          {turns.map((turn, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTurnIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedTurnIdx === idx
                  ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {turn.qNum}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: Evaluation Decision Card */}
      <motion.div
        key={selectedTurnIdx}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-slate-900/60 border border-purple-500/30 p-6 space-y-4 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">Question Asked</span>
            <h3 className="text-base font-bold font-mono text-white">
              &quot;{currentTurn.questionText}&quot;
            </h3>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-purple-500/30 text-right shadow-lg">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">AI Score Given</span>
            <span className="text-xl font-bold font-mono text-cyan-300">{currentTurn.scoreGiven} / 100</span>
          </div>
        </div>

        {/* Candidate Answer Summary & Why Score Was Given */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block">Candidate Answer Summary</span>
            <p className="text-xs text-slate-300 font-sans">{currentTurn.answerSummary}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">Why This Score Was Given</span>
            <p className="text-xs text-slate-300 font-sans">{currentTurn.whyScore}</p>
          </div>
        </div>

        {/* Positive vs Missing Evidence Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              ✓ Positive Evidence Identified
            </span>
            <div className="space-y-1">
              {currentTurn.positiveEvidence.map((pos, i) => (
                <div key={i} className="text-xs font-mono text-emerald-300 flex items-center space-x-1.5">
                  <span>✓</span>
                  <span>{pos}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
              ⚠ Missing Evidence & Gaps
            </span>
            {currentTurn.missingEvidence.length > 0 ? (
              <div className="space-y-1">
                {currentTurn.missingEvidence.map((gap, i) => (
                  <div key={i} className="text-xs font-mono text-amber-300 flex items-center space-x-1.5">
                    <span>⚠</span>
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs font-mono text-slate-400 italic">No missing concepts detected in this response.</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Grid: RAG Grounding & AI Decision Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/60 border border-cyan-500/30 p-5 space-y-3 shadow-xl">
          <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider block">
            RAG Grounding Evidence
          </span>
          <div className="space-y-2">
            {currentTurn.ragSources.map((src, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-semibold text-slate-200 block">{src.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">Curriculum Source: {src.day}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-300 block">{src.score}% Similarity</span>
                  <span className="text-[9px] font-mono text-emerald-400">Grounded</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl bg-slate-900/60 border border-purple-500/30 p-5 space-y-3 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
            AI Strategy Adjustment
          </span>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Decision Rationale</span>
            <p className="text-xs text-slate-200 font-sans">{currentTurn.decisionReason}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Next Strategy: <strong className="text-purple-300">{currentTurn.nextStrategy}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
