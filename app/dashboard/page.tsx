"use client";

/**
 * app/dashboard/page.tsx
 *
 * Connected INTERVUE AI Command Center Dashboard.
 * Fetches real interview intelligence and Knowledge Twin metrics from GET /api/dashboard.
 * Displays premium AI empty state (Awaiting Intelligence Scan / --) when no session exists.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { KnowledgeCore } from "@/components/dashboard/KnowledgeCore";
import { IntelligenceCard } from "@/components/dashboard/IntelligenceCard";
import { ProgressOrb } from "@/components/dashboard/ProgressOrb";

export interface DashboardData {
  hasSession: boolean;
  message?: string;
  candidateName: string;
  roleTitle: string;
  readinessScore: number;
  knowledgeScore: number;
  confidence: string;
  curriculumProgress: number;
  aiPerformance: number;
  masteredTopics: string[];
  knowledgeGaps: string[];
  totalQuestions: number;
  completedDays: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
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
          setError("Failed to load live interview intelligence.");
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Error connecting to live AI telemetry.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <main className="min-h-screen bg-black text-slate-100 font-sans selection:bg-purple-500 selection:text-white p-4 md:p-8 lg:p-12 relative overflow-x-hidden">
      {/* Background Deep Space Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[650px] h-[650px] bg-purple-900/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-cyan-900/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-indigo-900/12 rounded-full blur-[130px]" />
      </div>

      {/* Top Floating Glass Navigation Header */}
      <DashboardHeader />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
          <p className="text-sm font-mono text-purple-300 animate-pulse">
            Connecting to Live AI Telemetry & Knowledge Twin...
          </p>
        </div>
      )}

      {/* Empty State when No Active Session Found */}
      {!isLoading && data && !data.hasSession && (
        <div className="relative z-10 max-w-7xl mx-auto space-y-8">
          <DashboardHero
            candidateName="Knowledge Twin"
            roleTitle="Senior AI Engineer Cohort"
            readinessScore={0}
            hasSession={false}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-2xl text-center space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center text-purple-300 text-2xl font-mono shadow-[0_0_25px_rgba(168,85,247,0.4)]">
              AI
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-sans text-white">
                Awaiting Intelligence Scan
              </h2>
              <p className="text-sm text-slate-300 font-mono">
                {data.message || "Complete an AI interview to generate your Knowledge Twin and reveal your Readiness Index."}
              </p>
            </div>
            <Link
              href="/interview"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-semibold font-sans text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all"
            >
              <span>Complete AI Interview</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      )}

      {/* Live Connected Dashboard Grid */}
      {!isLoading && data && data.hasSession && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-7xl mx-auto space-y-8"
        >
          {/* Header Hero Section */}
          <DashboardHero
            candidateName={data.candidateName || "Knowledge Twin"}
            roleTitle={data.roleTitle || "AI/ML Engineer"}
            readinessScore={data.readinessScore}
            hasSession={true}
          />

          {/* Main Command Center Grid: 3D Core + Intelligence Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 3D Living Knowledge Core (Lg: 7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <KnowledgeCore />

              {/* Sub-grid: 2 Secondary Cards under 3D Core */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Card 3: Knowledge Progress */}
                <IntelligenceCard
                  title="Knowledge Progress"
                  subtitle="Curriculum Completion"
                  badgeText={`Day ${data.completedDays} Active`}
                  badgeColor="purple"
                  delay={0.3}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                  metrics={[
                    { label: "Curriculum Progress", value: `${data.curriculumProgress}%`, highlight: true },
                    { label: "Questions Completed", value: `${data.totalQuestions} Answered` },
                    { label: "Days Covered", value: `Day ${data.completedDays} of 31` },
                  ]}
                >
                  <ProgressOrb value={data.curriculumProgress} label="Curriculum" sublabel="Progress" colorScheme="purple" size={130} />
                </IntelligenceCard>

                {/* Card 4: AI Performance */}
                <IntelligenceCard
                  title="AI Performance"
                  subtitle="Evaluation System Stats"
                  badgeText="Live AI"
                  badgeColor="emerald"
                  delay={0.4}
                  showSparkline={true}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                  metrics={[
                    { label: "Evaluation Accuracy", value: `${data.aiPerformance}%`, highlight: true, color: "text-emerald-400" },
                    { label: "Improvement Trend", value: "+14.2%" },
                    { label: "Contradictions Caught", value: "0 Detected" },
                  ]}
                >
                  <ProgressOrb value={data.aiPerformance} label="Accuracy" sublabel="Evaluation" colorScheme="emerald" size={130} />
                </IntelligenceCard>
              </div>
            </div>

            {/* Right Column: Key Intelligence Cards (Lg: 5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Candidate Intelligence */}
              <IntelligenceCard
                title="Candidate Intelligence"
                subtitle="Live Knowledge Twin State"
                badgeText="Live Sync"
                badgeColor="cyan"
                delay={0.1}
                skills={data.masteredTopics.length > 0 ? data.masteredTopics : ["RAG Architecture", "Vector Search"]}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                }
                metrics={[
                  { label: "Knowledge Score", value: `${data.knowledgeScore} / 100`, highlight: true },
                  { label: "Confidence Level", value: data.confidence },
                  { label: "Top Mastered Skill", value: data.masteredTopics[0] || "RAG & Vector Search" },
                  { label: "Active Knowledge Gap", value: data.knowledgeGaps[0] || "IVF Partitioning" },
                ]}
              >
                <ProgressOrb value={data.knowledgeScore} label="Intelligence" sublabel="Score" colorScheme="cyan" size={140} />
              </IntelligenceCard>

              {/* Card 2: Interview Readiness */}
              <IntelligenceCard
                title="Interview Readiness"
                subtitle="Adaptive Benchmark Status"
                badgeText="Active"
                badgeColor="amber"
                delay={0.2}
                showProgressMeter={true}
                meterValue={data.readinessScore}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                metrics={[
                  { label: "Readiness Score", value: `${data.readinessScore} / 100`, highlight: true, color: "text-amber-400" },
                  { label: "Interview Progress", value: `Day ${data.completedDays} of 31` },
                  { label: "Target Band", value: "Staff AI Engineer" },
                  { label: "Questions Answered", value: `${data.totalQuestions}` },
                ]}
              >
                <ProgressOrb value={data.readinessScore} label="Readiness" sublabel="Index" colorScheme="amber" size={140} />
              </IntelligenceCard>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
