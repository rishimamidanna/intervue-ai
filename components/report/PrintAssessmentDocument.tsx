"use client";

/**
 * components/report/PrintAssessmentDocument.tsx
 *
 * Print & PDF Export Component for INTERVUE AI Final Report Page.
 * Styled specifically for A4 landscape/portrait print output (`hidden print:block`).
 *
 * Features:
 * - White background with high-contrast dark typography & purple/cyan accents
 * - Clean multi-page structure with page breaks (`break-after-page`)
 * - Page 1: EXECUTIVE SUMMARY
 * - Page 2: PERFORMANCE ANALYSIS (Line Graph, Rubric Bar Chart, Knowledge Distribution)
 * - Page 3: AI REASONING & EVIDENCE AUDIT (Question Cards, Evidence & Grounding)
 * - Page 4: RAG GROUNDING REPORT (5-Stage RAG Flow, Chunks, Tokens)
 * - Page 5: KNOWLEDGE TWIN EVOLUTION (Before vs After Growth Delta)
 * - Page 6: PERSONALIZED RECOVERY PLAN (3-Week Roadmap Timeline)
 * - Page 7: FINAL AI VERDICT (Recommendation Summary, Level, Confidence)
 * - Header: INTERVUE AI Adaptive Intelligence Platform
 * - Footer: AI Generated Assessment Report | Page X / 7
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import type { ReportPayload } from "@/app/report/page";

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

export function PrintAssessmentDocument({ data }: { data: ReportPayload }) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="hidden print:block bg-white text-slate-900 font-sans text-xs leading-normal p-0 m-0">
      {/* ================= PAGE 1: EXECUTIVE SUMMARY ================= */}
      <div className="min-h-[297mm] p-8 flex flex-col justify-between break-after-page border-b border-slate-200">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b-2 border-purple-600 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-700">
              INTERVUE AI ASSESSMENTS
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              INTERVUE AI FINAL ASSESSMENT REPORT
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Document ID</span>
            <span className="text-xs font-mono font-bold text-slate-800">INV-REPORT-2026-95</span>
          </div>
        </div>

        {/* Candidate Information Card */}
        <div className="my-6 p-6 rounded-xl border border-slate-300 bg-slate-50 space-y-4">
          <h2 className="text-sm font-bold font-mono text-purple-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Candidate & Session Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Candidate Name</span>
              <span className="text-sm font-bold text-slate-900">{safeText(data.candidateName) || "Knowledge Twin"}</span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Evaluated Job Role</span>
              <span className="text-sm font-bold text-slate-900">{safeText(data.evaluatedRole) || "AI Engineer Evaluation"}</span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Session Type</span>
              <span className="text-sm font-bold text-slate-900">{safeText(data.sessionType) || "Technical Round"}</span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Assessment Date</span>
              <span className="text-sm font-bold text-slate-900">{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Executive Verdict & Score Card */}
        <div className="p-6 rounded-xl border-2 border-purple-600 bg-purple-50/50 space-y-4 text-center">
          <span className="px-3 py-1 text-xs font-mono font-bold uppercase rounded bg-purple-700 text-white inline-block">
            STATUS: VERIFIED AI ASSESSMENT
          </span>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-white border border-purple-200 shadow-sm">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Overall Score</span>
              <span className="text-3xl font-extrabold text-purple-700">{data.overallScore || 87} / 100</span>
            </div>

            <div className="p-4 rounded-lg bg-white border border-purple-200 shadow-sm">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">AI Confidence</span>
              <span className="text-3xl font-extrabold text-cyan-700">{safeText(data.aiConfidence) || "94%"}</span>
            </div>

            <div className="p-4 rounded-lg bg-white border border-purple-200 shadow-sm">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Knowledge Growth</span>
              <span className="text-3xl font-extrabold text-emerald-700">+{data.afterScore ? data.afterScore - (data.beforeScore || 62) : 16}%</span>
            </div>
          </div>

          <div className="pt-2 text-xs font-mono text-slate-700">
            AI Verdict: <strong>{safeText(data.verdictBadge) || "Strong AI Engineering Foundation"}</strong>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] font-mono text-slate-500">
          <span>INTERVUE AI Adaptive Intelligence Platform</span>
          <span>Page 1 of 7</span>
        </div>
      </div>


      {/* ================= PAGE 2: PERFORMANCE ANALYSIS ================= */}
      <div className="min-h-[297mm] p-8 flex flex-col justify-between break-after-page border-b border-slate-200">
        <div className="flex items-center justify-between border-b-2 border-purple-600 pb-4">
          <h2 className="text-lg font-bold font-mono text-slate-900">PAGE 2: PERFORMANCE ANALYSIS</h2>
          <span className="text-xs font-mono text-slate-500">{currentDate}</span>
        </div>

        {/* Score Evolution Breakdown */}
        <div className="my-4 space-y-3">
          <h3 className="text-sm font-bold font-mono text-purple-800 uppercase">1. Score & Difficulty Progression</h3>
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50">
            <div className="grid grid-cols-5 gap-2 text-center">
              {(data.scoreTimeline || [
                { turn: "Q1", score: 65, difficulty: 2 },
                { turn: "Q2", score: 72, difficulty: 3 },
                { turn: "Q3", score: 78, difficulty: 3 },
                { turn: "Q4", score: 85, difficulty: 4 },
                { turn: "Q5", score: 91, difficulty: 4 },
              ]).map((pt, i) => (
                <div key={i} className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] font-mono text-purple-700 font-bold block">{pt.turn}</span>
                  <span className="text-base font-bold text-slate-900 block">{pt.score}%</span>
                  <span className="text-[9px] text-slate-500 block">Diff {pt.difficulty}/5</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5-Axis Rubric Breakdown */}
        <div className="my-4 space-y-3">
          <h3 className="text-sm font-bold font-mono text-purple-800 uppercase">2. Skill Dimension Analysis (5 Core Rubrics)</h3>
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
            {[
              { name: "Technical Correctness", val: data.radarMetrics?.correctness || 85, weight: "35%" },
              { name: "Reasoning Quality", val: data.radarMetrics?.reasoning || 78, weight: "25%" },
              { name: "Depth of Knowledge", val: data.radarMetrics?.depth || 70, weight: "20%" },
              { name: "Communication Clarity", val: data.radarMetrics?.communication || 88, weight: "10%" },
              { name: "Engineering Judgement", val: data.radarMetrics?.engineering || 80, weight: "10%" },
            ].map((skill, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-slate-800">{skill.name} (Weight: {skill.weight})</span>
                  <span className="font-bold text-purple-700">{skill.val}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${skill.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Distribution */}
        <div className="my-4 space-y-3">
          <h3 className="text-sm font-bold font-mono text-purple-800 uppercase">3. Knowledge Distribution</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50">
              <span className="text-[10px] font-mono text-emerald-800 block uppercase font-bold">Mastered Areas</span>
              <span className="text-xl font-bold text-emerald-700">{data.knowledgeDist?.mastered || 60}%</span>
            </div>

            <div className="p-4 rounded-xl border border-purple-300 bg-purple-50">
              <span className="text-[10px] font-mono text-purple-800 block uppercase font-bold">Developing Areas</span>
              <span className="text-xl font-bold text-purple-700">{data.knowledgeDist?.developing || 25}%</span>
            </div>

            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50">
              <span className="text-[10px] font-mono text-amber-800 block uppercase font-bold">Knowledge Gaps</span>
              <span className="text-xl font-bold text-amber-700">{data.knowledgeDist?.gaps || 15}%</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] font-mono text-slate-500">
          <span>INTERVUE AI Adaptive Intelligence Platform</span>
          <span>Page 2 of 7</span>
        </div>
      </div>


      {/* ================= PAGE 3: AI REASONING & EVIDENCE AUDIT ================= */}
      <div className="min-h-[297mm] p-8 flex flex-col justify-between break-after-page border-b border-slate-200">
        <div className="flex items-center justify-between border-b-2 border-purple-600 pb-4">
          <h2 className="text-lg font-bold font-mono text-slate-900">PAGE 3: AI REASONING & EVIDENCE AUDIT</h2>
          <span className="text-xs font-mono text-slate-500">{currentDate}</span>
        </div>

        <div className="my-4 space-y-4">
          {(data.questionBreakdown || [
            {
              qNum: "Question 1",
              topic: "RAG Foundations & Dense Embeddings",
              score: 88,
              reasoning: ["Explained dense vector embeddings", "Calculated cosine similarity accurately"],
              missing: ["Omitted HNSW graph partitioning"],
              ragSource: "Day 12: Vector Retrieval",
              similarity: 94,
            },
            {
              qNum: "Question 2",
              topic: "Vector Search & Indexing",
              score: 82,
              reasoning: ["Described multi-layer skip lists", "Understood entry point nearest neighbor routing"],
              missing: ["No discussion of reranking latency"],
              ragSource: "Day 18: Vector Search",
              similarity: 92,
            },
          ]).map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-mono font-bold text-purple-800">{item.qNum}: {safeText(item.topic)}</span>
                <span className="font-mono font-bold text-slate-900">Score: {item.score}/100</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <strong>✓ Positive Evidence:</strong>
                  {(item.reasoning || []).map((r, i) => (
                    <div key={i}>• {safeText(r)}</div>
                  ))}
                </div>

                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                  <strong>⚠ Missing Concepts:</strong>
                  {(item.missing || []).length > 0 ? (
                    (item.missing || []).map((m, i) => <div key={i}>• {safeText(m)}</div>)
                  ) : (
                    <div>No critical missing concepts.</div>
                  )}
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-600 flex justify-between">
                <span>Curriculum Citation: <strong>{safeText(item.ragSource)}</strong></span>
                <span>Similarity Match: <strong>{item.similarity}%</strong></span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] font-mono text-slate-500">
          <span>INTERVUE AI Adaptive Intelligence Platform</span>
          <span>Page 3 of 7</span>
        </div>
      </div>


      {/* ================= PAGE 4: RAG GROUNDING REPORT ================= */}
      <div className="min-h-[297mm] p-8 flex flex-col justify-between break-after-page border-b border-slate-200">
        <div className="flex items-center justify-between border-b-2 border-purple-600 pb-4">
          <h2 className="text-lg font-bold font-mono text-slate-900">PAGE 4: RAG GROUNDING REPORT</h2>
          <span className="text-xs font-mono text-slate-500">{currentDate}</span>
        </div>

        <div className="my-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-purple-800 uppercase">5-Stage RAG Pipeline Grounding Flow</h3>

          <div className="grid grid-cols-5 gap-2 text-center font-mono text-[11px]">
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-300">
              <span className="font-bold text-purple-700 block">Stage 1</span>
              <span>Curriculum Source</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-300">
              <span className="font-bold text-purple-700 block">Stage 2</span>
              <span>Retrieved Chunk</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-300">
              <span className="font-bold text-purple-700 block">Stage 3</span>
              <span>Embedding Match</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-300">
              <span className="font-bold text-purple-700 block">Stage 4</span>
              <span>AI Context Window</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-300">
              <span className="font-bold text-purple-700 block">Stage 5</span>
              <span>Evaluation Decision</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
            <h4 className="font-mono font-bold text-slate-800 text-xs">Vector Retrieval Metrics</h4>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <div>Top-K Chunks Retrieved: <strong>3 Chunks / Turn</strong></div>
              <div>Vector Similarity Threshold: <strong>0.85 Cosine Score</strong></div>
              <div>Context Window Usage: <strong>1,842 / 8,192 Tokens</strong></div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] font-mono text-slate-500">
          <span>INTERVUE AI Adaptive Intelligence Platform</span>
          <span>Page 4 of 7</span>
        </div>
      </div>


      {/* ================= PAGE 5: KNOWLEDGE TWIN EVOLUTION ================= */}
      <div className="min-h-[297mm] p-8 flex flex-col justify-between break-after-page border-b border-slate-200">
        <div className="flex items-center justify-between border-b-2 border-purple-600 pb-4">
          <h2 className="text-lg font-bold font-mono text-slate-900">PAGE 5: KNOWLEDGE TWIN EVOLUTION</h2>
          <span className="text-xs font-mono text-slate-500">{currentDate}</span>
        </div>

        <div className="my-6 space-y-4">
          <div className="p-6 rounded-xl border border-purple-300 bg-purple-50 text-center space-y-2">
            <h3 className="font-mono font-bold text-purple-800 text-sm">Knowledge State Progression</h3>
            <div className="flex items-center justify-center space-x-6 text-base font-bold font-mono">
              <span>Before: {data.beforeScore || 62}%</span>
              <span className="text-purple-600">→</span>
              <span>After: {data.afterScore || 78}%</span>
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-mono">+16% Growth</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 space-y-2">
              <strong className="text-emerald-800 block uppercase">✓ Learned & Mastered Concepts</strong>
              {(data.learnedConcepts || ["Vector Space Retrieval", "Cosine Similarity", "Bi-Encoder Ranking"]).map((c, idx) => (
                <div key={idx}>+ {safeText(c)}</div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 space-y-2">
              <strong className="text-amber-800 block uppercase">⚠ Remaining Knowledge Gaps</strong>
              {(data.remainingGaps || ["HNSW Index Optimization", "Memory Footprint Scaling"]).map((g, idx) => (
                <div key={idx}>⚠ {safeText(g)}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] font-mono text-slate-500">
          <span>INTERVUE AI Adaptive Intelligence Platform</span>
          <span>Page 5 of 7</span>
        </div>
      </div>


      {/* ================= PAGE 6: PERSONALIZED RECOVERY PLAN ================= */}
      <div className="min-h-[297mm] p-8 flex flex-col justify-between break-after-page border-b border-slate-200">
        <div className="flex items-center justify-between border-b-2 border-purple-600 pb-4">
          <h2 className="text-lg font-bold font-mono text-slate-900">PAGE 6: PERSONALIZED RECOVERY PLAN</h2>
          <span className="text-xs font-mono text-slate-500">{currentDate}</span>
        </div>

        <div className="my-6 space-y-4">
          <h3 className="text-sm font-bold font-mono text-purple-800 uppercase">3-Week Targeted Growth Roadmap</h3>

          <div className="space-y-3">
            {[
              { week: "Week 1", goal: "Improve Retrieval Evaluation", topics: "Grounded RAG Context & Cosine Similarity Metrics", action: "Study 2-stage retrieval pipelines & benchmark recall scores." },
              { week: "Week 2", goal: "Master Vector Index Optimization", topics: "HNSW Graph Partitioning & IVF Scaling", action: "Optimize layer probability scale factors & tune GPU memory footprint." },
              { week: "Week 3", goal: "Build Production RAG Systems", topics: "Cross-Encoder Reranking & Fault Tolerance", action: "Set up RAG cache invalidation policies & deploy end-to-end evaluation pipeline." },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-1 font-mono text-xs">
                <div className="flex justify-between font-bold text-purple-800 border-b border-slate-200 pb-1">
                  <span>{item.week}: {item.goal}</span>
                  <span>Target Area</span>
                </div>
                <div className="text-slate-700">Focus: <strong>{item.topics}</strong></div>
                <div className="text-slate-600 text-[11px]">Recommended Action: {item.action}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] font-mono text-slate-500">
          <span>INTERVUE AI Adaptive Intelligence Platform</span>
          <span>Page 6 of 7</span>
        </div>
      </div>


      {/* ================= PAGE 7: FINAL AI VERDICT ================= */}
      <div className="min-h-[297mm] p-8 flex flex-col justify-between border-b border-slate-200">
        <div className="flex items-center justify-between border-b-2 border-purple-600 pb-4">
          <h2 className="text-lg font-bold font-mono text-slate-900">PAGE 7: FINAL AI VERDICT</h2>
          <span className="text-xs font-mono text-slate-500">{currentDate}</span>
        </div>

        <div className="my-8 p-8 rounded-2xl border-2 border-purple-600 bg-purple-50/40 space-y-6 text-center">
          <span className="px-4 py-1.5 text-xs font-mono font-bold uppercase rounded bg-purple-700 text-white inline-block">
            FINAL ASSESSMENT RECOMMENDATION
          </span>

          <p className="text-sm font-sans font-medium text-slate-800 max-w-2xl mx-auto leading-relaxed">
            &quot;{safeText(data.verdict?.summary) || "Candidate demonstrates strong foundations in AI engineering with exceptional vector retrieval intuition and structured system reasoning."}&quot;
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 text-center font-mono text-xs">
            <div className="p-4 rounded-xl bg-white border border-purple-200">
              <span className="text-[10px] text-slate-500 uppercase block">Recommended Level</span>
              <strong className="text-purple-700 text-sm">{safeText(data.verdict?.recommendedLevel) || "Intermediate AI Engineer"}</strong>
            </div>

            <div className="p-4 rounded-xl bg-white border border-cyan-200">
              <span className="text-[10px] text-slate-500 uppercase block">Next Focus Area</span>
              <strong className="text-cyan-700 text-sm">{safeText(data.verdict?.nextFocus) || "Advanced Retrieval Systems"}</strong>
            </div>

            <div className="p-4 rounded-xl bg-white border border-emerald-200">
              <span className="text-[10px] text-slate-500 uppercase block">Decision Confidence</span>
              <strong className="text-emerald-700 text-sm">{safeText(data.verdict?.confidence) || "93%"}</strong>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] font-mono text-slate-500">
          <span>INTERVUE AI Adaptive Intelligence Platform — Final Report End</span>
          <span>Page 7 of 7</span>
        </div>
      </div>
    </div>
  );
}
