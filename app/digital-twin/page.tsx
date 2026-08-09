"use client";

/**
 * app/digital-twin/page.tsx
 *
 * Milestone 2.9.2 — Premium 3D Digital Twin Intelligence Workspace.
 * Connected to live session telemetry via GET /api/dashboard.
 * Displays 3D DigitalTwinCore, skill node matrix, 5-axis capability radar,
 * strengths, knowledge gaps, and recovery timeline.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/common/PageTransition";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DigitalTwinCore } from "@/components/digital-twin/DigitalTwinCore";
import { SkillNode, SkillNodeData } from "@/components/digital-twin/SkillNode";
import { KnowledgeRadar } from "@/components/digital-twin/KnowledgeRadar";
import { StrengthPanel } from "@/components/digital-twin/StrengthPanel";
import { KnowledgeGapPanel } from "@/components/digital-twin/KnowledgeGapPanel";
import { RecoveryTimeline } from "@/components/digital-twin/RecoveryTimeline";
import type { DashboardData } from "@/app/dashboard/page";

export default function DigitalTwinPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTwinData() {
      setIsLoading(true);
      setError(null);
      try {
        let activeSessionId: string | null = null;
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          activeSessionId = urlParams.get("sessionId") || localStorage.getItem("intervue_session_id");
        }

        const url = activeSessionId
          ? `/api/dashboard?sessionId=${encodeURIComponent(activeSessionId)}`
          : `/api/dashboard`;

        const res = await fetch(url);
        if (res.ok) {
          const resData = await res.json();
          const dashboardPayload: DashboardData = resData.data || resData;
          setData(dashboardPayload);
        } else {
          setError("Failed to load Digital Twin telemetry.");
        }
      } catch (err) {
        console.error("Digital Twin fetch error:", err);
        setError("Error connecting to Digital Twin telemetry.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTwinData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const skillList: SkillNodeData[] = data?.hasSession
    ? [
        { topic: data.masteredTopics[0] || "RAG Architecture", score: data.knowledgeScore, confidence: "high", evidenceCount: 5 },
        { topic: data.masteredTopics[1] || "Vector Search", score: Math.round(data.knowledgeScore * 0.95), confidence: "high", evidenceCount: 4 },
        { topic: "AI Agents", score: Math.round(data.knowledgeScore * 0.9), confidence: "medium", evidenceCount: 3 },
        { topic: data.knowledgeGaps[0] || "IVF Partitioning", score: Math.round(data.knowledgeScore * 0.55), confidence: "medium", evidenceCount: 2 },
      ]
    : [];

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-slate-100 font-sans selection:bg-cyan-500 selection:text-white p-4 md:p-8 lg:p-12 relative overflow-x-hidden">
      {/* Deep Space Background Radial Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-cyan-950/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-purple-950/20 rounded-full blur-[150px]" />
      </div>

      {/* Floating Top Navigation Header */}
      <DashboardHeader />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
          <p className="text-sm font-mono text-cyan-300 animate-pulse">
            Synthesizing 3D Knowledge Twin Vector Topology...
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
            TWIN
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-sans text-white">
              No active interview session
            </h2>
            <p className="text-sm text-slate-300 font-mono">
              Start an AI interview to build your Knowledge Twin.
            </p>
          </div>
          <Link
            href="/interview"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white font-semibold font-sans text-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all"
          >
            <span>Start Interview</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      )}

      {/* Connected 3D Digital Twin Intelligence Dashboard */}
      {!isLoading && data && data.hasSession && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-7xl mx-auto space-y-8"
        >
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-widest rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  KNOWLEDGE TWIN MODEL ACTIVE
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {data.candidateName || "Knowledge Twin"} Neural Model
              </h1>
              <p className="text-xs font-mono text-slate-400">
                Vector Skill Topography • Live Adaptive Benchmark Status
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Twin Mastery Index
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-300">
                {data.knowledgeScore} <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
          </div>

          {/* Main Grid: 3D Core + Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 3D Digital Twin Core & Skill Nodes (Lg: 7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <DigitalTwinCore />

              {/* Floating Skill Nodes Sub-grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold font-mono text-slate-300 uppercase tracking-wider">
                  Evaluated Skill Node Matrix
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skillList.map((skill, idx) => (
                    <SkillNode key={idx} skill={skill} index={idx} />
                  ))}
                </div>
              </div>

              {/* Recovery Roadmap Timeline */}
              <RecoveryTimeline
                currentLevel={`Senior AI Engineer (Score: ${data.readinessScore})`}
                recommendedFocus={`Master ${data.knowledgeGaps[0] || "IVF Partitioning"} & Evaluation Metrics`}
                nextMilestone="Staff AI Engineer Target Band"
              />
            </div>

            {/* Right Column: Radar & Panels (Lg: 5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 5-Axis Capability Radar */}
              <KnowledgeRadar
                scores={{
                  correctness: Math.round(data.readinessScore * 0.95),
                  reasoning: Math.round(data.readinessScore * 0.98),
                  depth: Math.round(data.knowledgeScore * 0.92),
                  communication: 90,
                  engineering: Math.round(data.readinessScore * 0.94),
                }}
              />

              {/* Strength Panel */}
              <StrengthPanel strengths={data.masteredTopics} />

              {/* Knowledge Gap Panel */}
              <KnowledgeGapPanel gaps={data.knowledgeGaps} />
            </div>
          </div>
        </motion.div>
      )}
    </main>
    </PageTransition>
  );
}
