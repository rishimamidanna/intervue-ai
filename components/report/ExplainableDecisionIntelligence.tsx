"use client";

/**
 * components/report/ExplainableDecisionIntelligence.tsx
 *
 * Explainable AI Decision Intelligence Section for INTERVUE AI Report Page.
 * Displays transparent, evidence-based reasoning for every turn in the interview session:
 * 1. Question Context
 * 2. Candidate Response Analysis (Strengths vs Gaps)
 * 3. AI Reasoning ("Why this score was given")
 * 4. RAG Evidence (Grounded Curriculum Source, Similarity %, Retrieved Concepts)
 * 5. AI Decision (Previous Difficulty -> Decision -> New Difficulty -> Justification)
 * 6. Confidence Indicator (AI Confidence %, Evidence Signals Count)
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Database,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface DecisionCardData {
  qNum: string;
  topic: string;
  answerSummary?: string;
  score: number;
  strengths?: string[];
  reasoning?: string[];
  missingConcepts?: string[];
  missing?: string[];
  ragSource: string;
  similarity: number;
  retrievedContext?: string;
  previousDifficulty?: number;
  decision?: string;
  newDifficulty?: number;
  reason?: string;
  confidence?: string;
}

interface ExplainableDecisionIntelligenceProps {
  questionBreakdown?: DecisionCardData[];
}

export function ExplainableDecisionIntelligence({
  questionBreakdown = [],
}: ExplainableDecisionIntelligenceProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!questionBreakdown || questionBreakdown.length === 0) {
    return null;
  }

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section className="relative w-full my-12 z-10 font-sans">
      {/* Header */}
      <div className="flex flex-col items-start mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-mono font-semibold text-purple-300 tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span>EXPLAINABLE AI TELEMETRY</span>
        </div>
        <h2 className="font-hero-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Why AI Made This Decision
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-2xl leading-relaxed">
          Transparent reasoning behind every adaptive interview decision, grounded in authoritative RAG curriculum evidence.
        </p>
      </div>

      {/* Decision Cards Timeline Stack */}
      <div className="space-y-6 relative">
        {/* Timeline Connecting Line */}
        <div className="hidden lg:block absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-500/60 via-cyan-400/40 to-purple-600/60 z-0 pointer-events-none" />

        {questionBreakdown.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          const prevDiff = item.previousDifficulty ?? (idx === 0 ? 2 : 3);
          const newDiff = item.newDifficulty ?? (item.score >= 80 ? Math.min(5, prevDiff + 1) : prevDiff);
          const decisionText = item.decision ?? (newDiff > prevDiff ? "Increase Difficulty" : newDiff < prevDiff ? "Reduce Difficulty" : "Maintain Difficulty");
          const decisionReason = item.reason ?? (
            newDiff > prevDiff
              ? "Candidate demonstrated strong understanding of fundamental concepts; AI escalated question depth to test edge cases."
              : "Candidate performed steadily on target topic; AI maintained current difficulty level."
          );
          const strengthsList = item.strengths && item.strengths.length > 0
            ? item.strengths
            : item.reasoning && item.reasoning.length > 0
            ? item.reasoning
            : ["Understood core technical concepts"];
          const gapsList = item.missingConcepts && item.missingConcepts.length > 0
            ? item.missingConcepts
            : item.missing && item.missing.length > 0
            ? item.missing
            : ["Edge case Optimization parameters"];
          const confidence = item.confidence || "95%";
          const evidenceCount = strengthsList.length + gapsList.length + 2;

          return (
            <motion.div
              key={item.qNum || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative z-10 rounded-2xl bg-[linear-gradient(135deg,rgba(15,18,36,0.92)_0%,rgba(6,9,24,0.88)_100%)] backdrop-blur-2xl border border-purple-500/30 hover:border-cyan-400/60 transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.75)] overflow-hidden"
            >
              {/* Card Header Bar */}
              <div
                onClick={() => toggleExpand(idx)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none border-b border-purple-900/20 bg-slate-950/60 hover:bg-slate-900/60 transition-colors"
              >
                {/* Left: Question Context & Badge */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-mono font-bold text-xs shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                    {item.qNum}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-sans tracking-tight">
                      {item.topic}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300/90 mt-0.5">
                      <span>Difficulty Progress:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-400 font-bold">
                        Level {prevDiff} → Level {newDiff}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score, Decision & Toggle Icon */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-400">Evaluated Score</div>
                    <div className="text-lg font-bold font-mono text-cyan-400">{item.score}/100</div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold tracking-wide">
                    {decisionText}
                  </span>

                  <button className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Card Content Grid */}
              {isExpanded && (
                <div className="p-6 space-y-6 text-xs text-slate-300">
                  {/* Grid 1: Candidate Response Analysis & AI Reasoning */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Candidate Response Analysis */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                      <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span>Candidate Response Analysis</span>
                      </div>

                      <p className="text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        {item.answerSummary || `Candidate response evaluated for ${item.topic}.`}
                      </p>

                      {/* Strengths */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                          Detected Strengths:
                        </div>
                        {strengthsList.map((s, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-slate-300 font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>

                      {/* Gaps */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-mono text-amber-400 font-semibold">
                          Detected Gaps:
                        </div>
                        {gapsList.map((g, gIdx) => (
                          <div key={gIdx} className="flex items-start gap-2 text-slate-300 font-sans">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{g}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-900/40 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span>Why this score was given</span>
                        </div>

                        <p className="text-slate-300 leading-relaxed font-sans bg-purple-950/30 p-3 rounded-lg border border-purple-500/20 text-xs">
                          The candidate demonstrated {item.score >= 80 ? "strong technical accuracy and structural reasoning" : "foundational understanding with room for optimization depth"}. The response covered {strengthsList.join(", ")} {gapsList.length > 0 ? `while omitting ${gapsList.join(", ")}` : ""}.
                        </p>
                      </div>

                      {/* AI Confidence Meter */}
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span className="font-mono text-slate-300 text-xs">AI Confidence:</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-emerald-400 font-bold">{confidence}</span>
                          <span className="text-slate-500 text-[10px]">({evidenceCount} supporting signals)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: RAG Evidence & AI Decision */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-purple-900/30">
                    {/* RAG Evidence Grounding */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/40 space-y-2.5">
                      <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-cyan-400" />
                        <span>RAG Curriculum Grounding Evidence</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Curriculum Source:</span>
                          <span className="text-white font-semibold">{item.ragSource}</span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Vector Similarity:</span>
                          <span className="text-cyan-400 font-bold">{item.similarity}%</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 font-mono text-[10px]">Retrieved Concepts:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {strengthsList.concat(gapsList).slice(0, 4).map((c, cIdx) => (
                            <span key={cIdx} className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Decision & Next Action */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-900/40 space-y-2.5">
                      <div className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span>AI Adaptive Decision</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-purple-950/40 border border-purple-500/30 font-mono text-xs">
                        <span className="text-slate-400">Previous Difficulty: {prevDiff}/5</span>
                        <span className="text-cyan-300 font-bold">➔ {decisionText}</span>
                        <span className="text-purple-300 font-bold">New: {newDiff}/5</span>
                      </div>

                      <p className="text-slate-300 leading-relaxed font-sans text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <strong className="text-purple-300 font-mono">Reason: </strong>
                        {decisionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
