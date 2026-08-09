"use client";

/**
 * app/analytics/page.tsx
 *
 * Milestone 2.9.3 — Premium Hackathon-Winning AI Analytics Intelligence Workspace.
 * Connected to live backend telemetry via GET /api/analytics.
 * NASA Mission Control + AI Evaluation Laboratory style workspace detailing
 * candidate reasoning quality, adaptive decision nodes, RAG usage, and knowledge growth.
 * (NO SPHERES, FLOATING BALLS, OR PLANETS).
 *
 * Workspace Layout Assembly:
 * 1. Analytics Hero Banner
 * 2. Holographic AI Performance Core
 * 3. Row 1: 5-Axis Performance Radar (6 cols) + Score Timeline Progression Graph (6 cols)
 * 4. Row 2: Knowledge Growth Analysis (6 cols) + Adaptive AI Decision Timeline (6 cols) [Equal Height]
 * 5. ScoreExplanationPanel ("Why This Score?")
 * 6. KnowledgeTwinMemoryView ("Knowledge Twin Update")
 * 7. Intelligence Connection Bar (Performance -> Growth -> Decision Engine -> Strategy)
 * 8. AI DECISION INTELLIGENCE LAYER (Answer -> Reasoning -> Decision -> Next Action Bridge)
 * 9. AI REASONING EVIDENCE CENTER (Grounding & Decision Audit Section)
 * 10. AI Evaluation Pipeline Dataflow (6-Stage RAG Flow)
 * 11. Live AI Infrastructure Telemetry
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/common/PageTransition";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PerformanceCore } from "@/components/analytics/PerformanceCore";
import { PerformanceRadar } from "@/components/analytics/PerformanceRadar";
import { ScoreTimeline } from "@/components/analytics/ScoreTimeline";
import { DifficultyAnalytics } from "@/components/analytics/DifficultyAnalytics";
import { KnowledgeGrowth } from "@/components/analytics/KnowledgeGrowth";
import { ScoreExplanationPanel } from "@/components/analytics/ScoreExplanationPanel";
import { KnowledgeTwinMemoryView } from "@/components/analytics/KnowledgeTwinMemoryView";
import { IntelligenceConnectionBar } from "@/components/analytics/IntelligenceConnectionBar";
import { DecisionIntelligenceLayer } from "@/components/analytics/DecisionIntelligenceLayer";
import { ReasoningEvidenceCenter } from "@/components/analytics/ReasoningEvidenceCenter";
import { EvaluationBreakdown } from "@/components/analytics/EvaluationBreakdown";
import { AITelemetry } from "@/components/analytics/AITelemetry";
import type { AnalyticsPayload } from "@/app/api/analytics/route";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalyticsData() {
      setIsLoading(true);
      setError(null);
      try {
        let activeSessionId: string | null = null;
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          activeSessionId = urlParams.get("sessionId") || localStorage.getItem("intervue_session_id");
        }

        const url = activeSessionId
          ? `/api/analytics?sessionId=${encodeURIComponent(activeSessionId)}`
          : `/api/analytics`;

        const res = await fetch(url);
        if (res.ok) {
          const resData = await res.json();
          const analyticsPayload: AnalyticsPayload = resData.data || resData;
          setData(analyticsPayload);
        } else {
          setError("Failed to load AI evaluation intelligence telemetry.");
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Error connecting to AI evaluation intelligence telemetry.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalyticsData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-slate-100 font-sans selection:bg-purple-500 selection:text-white p-4 md:p-8 lg:p-12 relative overflow-x-hidden">
      {/* Deep Space Background Grid & Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-purple-950/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-cyan-950/20 rounded-full blur-[150px]" />
      </div>

      {/* Top Floating Glass Navigation Header */}
      <DashboardHeader />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
          <p className="text-sm font-mono text-cyan-300 animate-pulse">
            Connecting to AI Evaluation Laboratory Telemetry...
          </p>
        </div>
      )}

      {/* Empty State when No Active Session Found */}
      {!isLoading && data && !data.hasSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-2xl text-center space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-2xl font-mono shadow-[0_0_25px_rgba(56,189,248,0.4)]">
            ANALYTICS
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-sans text-white">
              No active interview session
            </h2>
            <p className="text-sm text-slate-300 font-mono">
              Start an AI interview to generate your live evaluation intelligence telemetry.
            </p>
          </div>
          <Link
            href="/interview"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-semibold font-sans text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all"
          >
            <span>Start Interview</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      )}

      {/* Connected AI Evaluation Intelligence Workspace */}
      {!isLoading && data && data.hasSession && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-7xl mx-auto space-y-8"
        >
          {/* 1. ANALYTICS HERO BANNER */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 backdrop-blur-2xl border border-purple-500/30 p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    AI EVALUATION LABORATORY
                  </span>
                  <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    MISSION CONTROL ACTIVE
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">
                  AI Evaluation Intelligence
                </h1>
                <p className="text-xs md:text-sm font-mono text-slate-300">
                  Advanced analytics of interview performance, reasoning patterns, and knowledge evolution.
                </p>
              </div>
            </div>

            {/* Hero Metric Cards with Animated Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Overall Score
                </span>
                <span className="text-3xl font-extrabold font-mono text-purple-300 mt-1 block">
                  {data.overallScore} <span className="text-xs text-slate-400">/ 100</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Questions Evaluated
                </span>
                <span className="text-3xl font-extrabold font-mono text-cyan-300 mt-1 block">
                  {data.questionsEvaluated}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  AI Confidence
                </span>
                <span className="text-3xl font-extrabold font-mono text-emerald-400 mt-1 block">
                  {data.aiConfidence}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Knowledge Growth
                </span>
                <span className="text-3xl font-extrabold font-mono text-amber-300 mt-1 block">
                  +{data.knowledgeGrowth}%
                </span>
              </div>
            </div>
          </div>

          {/* 2. AI Performance Holograph Panel (NO SPHERES) */}
          <PerformanceCore metrics={data.radarMetrics} />

          {/* ROW 1: 5-Axis Performance Radar (6 cols) + Score Timeline Progression Graph (6 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6">
              <PerformanceRadar metrics={data.radarMetrics} />
            </div>

            <div className="lg:col-span-6">
              <ScoreTimeline timeline={data.scoreTimeline} />
            </div>
          </div>

          {/* ROW 2: Knowledge Growth Analysis (6 cols) + Adaptive AI Decision Timeline (6 cols) [EQUAL HEIGHT] */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6">
              <KnowledgeGrowth
                baseline={data.knowledgeGrowthData?.baseline}
                current={data.knowledgeGrowthData?.current}
                masteredCount={data.knowledgeGrowthData?.masteredCount}
                gapCount={data.knowledgeGrowthData?.gapCount}
              />
            </div>

            <div className="lg:col-span-6">
              <DifficultyAnalytics decisions={data.difficultyHistory} />
            </div>
          </div>

          {/* 5. SCORE EXPLANATION PANEL ("Why This Score?") */}
          <ScoreExplanationPanel overallScore={data.overallScore} metrics={data.radarMetrics} />

          {/* 6. LIVE AI MEMORY VIEW ("Knowledge Twin Update") */}
          <KnowledgeTwinMemoryView
            beforeScore={data.knowledgeGrowthData?.baseline}
            afterScore={data.knowledgeGrowthData?.current}
          />

          {/* 7. AI INTELLIGENCE CLOSED-LOOP CONNECTION BAR */}
          <IntelligenceConnectionBar />

          {/* 8. AI DECISION INTELLIGENCE LAYER (Answer -> Reasoning -> Decision -> Next Action Bridge) */}
          <DecisionIntelligenceLayer />

          {/* 9. AI REASONING EVIDENCE CENTER (Explainable Decision Cards & RAG Grounding Audit) */}
          <ReasoningEvidenceCenter />

          {/* 10 & 11: Evaluation Pipeline Breakdown (6-Stage RAG Flow) + Live Telemetry */}
          <EvaluationBreakdown />
          <AITelemetry
            evaluationsCompleted={data.telemetry?.evaluationsCompleted}
            avgResponseTimeMs={data.telemetry?.avgResponseTimeMs}
            ragContextUsage={data.telemetry?.ragContextUsage}
            retrievalAccuracy={data.telemetry?.retrievalAccuracy}
            aiDecisionsCount={data.telemetry?.aiDecisionsCount}
          />
        </motion.div>
      )}
    </main>
    </PageTransition>
  );
}
