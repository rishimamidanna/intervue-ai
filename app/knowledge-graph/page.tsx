"use client";

/**
 * app/knowledge-graph/page.tsx
 *
 * Milestone 2.9.3 — Enterprise RAG Observability Workspace.
 * Connected to live RAG telemetry via GET /api/knowledge-graph.
 * Visualizes internal AI Knowledge System across all 7 RAG processing stages
 * (Curriculum -> Chunking -> Vector Embeddings -> Retrieval -> Rerank -> LLM Window -> Evaluation).
 *
 * Layout Flow:
 * Left Column:  3D RAG Scene → Retrieved Context Intelligence
 * Right Column: RAG System Status → Current RAG Query → Token Stream Connector → Context Assembly Preview
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/common/PageTransition";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RAGGraphScene } from "@/components/knowledge-graph/RAGGraphScene";
import { RAGPipelineStep } from "@/components/knowledge-graph/RAGPipelineStep";
import { RAGAnalyticsPanel } from "@/components/knowledge-graph/RAGAnalyticsPanel";
import { QueryContextPanel } from "@/components/knowledge-graph/QueryContextPanel";
import { RetrievedContextPanel } from "@/components/knowledge-graph/RetrievedContextPanel";
import { ContextAssemblyPreview } from "@/components/knowledge-graph/ContextAssemblyPreview";
import { TokenStreamConnector } from "@/components/knowledge-graph/TokenStreamConnector";
import type { RetrievedChunkItem } from "@/app/api/knowledge-graph/route";

export interface RAGGraphData {
  hasSession: boolean;
  message?: string;
  semanticRetrievalScore: number;
  topKRetrievedChunksCount: number;
  knowledgeNodesActivatedCount: number;
  contextAlignmentScore: number;
  groundingScore: number;
  currentQuery: string;
  retrievedConcepts: string[];
  retrievedChunks: RetrievedChunkItem[];
  contextConfidence: string;
  contextAssembly?: {
    retrievedChunksCount: number;
    contextTokens: number;
    maxContextTokens: number;
    promptGrounding: number;
    contextCompression: string;
    generationStatus: string;
  };
  systemStatus?: {
    embeddingEngine: string;
    vectorIndex: string;
    retrieverLatency: string;
    contextWindow: string;
  };
}

export default function KnowledgeGraphPage() {
  const [data, setData] = useState<RAGGraphData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRAGGraphData() {
      setIsLoading(true);
      setError(null);
      try {
        let activeSessionId: string | null = null;
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          activeSessionId = urlParams.get("sessionId") || localStorage.getItem("intervue_session_id");
        }

        const url = activeSessionId
          ? `/api/knowledge-graph?sessionId=${encodeURIComponent(activeSessionId)}`
          : `/api/knowledge-graph`;

        const res = await fetch(url);
        if (res.ok) {
          const resData = await res.json();
          const graphPayload: RAGGraphData = resData.data || resData;
          setData(graphPayload);
        } else {
          setError("Failed to load RAG Knowledge Graph telemetry.");
        }
      } catch (err) {
        console.error("Knowledge graph fetch error:", err);
        setError("Error connecting to RAG Knowledge Graph telemetry.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRAGGraphData();
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
      {/* Background Deep Space Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[650px] h-[650px] bg-purple-950/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-cyan-950/20 rounded-full blur-[150px]" />
      </div>

      {/* Top Floating Glass Navigation Header */}
      <DashboardHeader />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
          <p className="text-sm font-mono text-purple-300 animate-pulse">
            Connecting to RAG Observability Telemetry Mesh...
          </p>
        </div>
      )}

      {/* Empty State when No Active Session Found */}
      {!isLoading && data && !data.hasSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-2xl text-center space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center text-purple-300 text-2xl font-mono shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            RAG
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-sans text-white">
              No active interview session
            </h2>
            <p className="text-sm text-slate-300 font-mono">
              Start an AI interview to generate RAG Knowledge Graph observability telemetry.
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

      {/* Connected Enterprise 3D RAG Observability Workspace */}
      {!isLoading && data && data.hasSession && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-7xl mx-auto space-y-8"
        >
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 backdrop-blur-2xl border border-purple-500/30 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  ENTERPRISE RAG OBSERVABILITY
                </span>
                <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  VECTOR PIPELINE HEALTHY
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                3D RAG Architecture & Context Observability
              </h1>
              <p className="text-xs font-mono text-slate-400">
                Curriculum Grounding • Dimensional Vector Embeddings • Nearest Neighbor Retrieval
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Semantic Retrieval Score
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-300">
                {data.semanticRetrievalScore}%
              </div>
            </div>
          </div>

          {/* RAG 7-Node Pipeline Progress Bar */}
          <RAGPipelineStep />

          {/* Main Grid: 3D Scene + RAG Observability Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 3D Scene & Top-K Retrieved Context (Lg: 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 3D RAG System Scene */}
              <RAGGraphScene />

              {/* Standalone Retrieved Context Intelligence Glassmorphism Card */}
              <RetrievedContextPanel retrievedChunks={data.retrievedChunks} />
            </div>

            {/* Right Column: Observability, Query & Context Assembly Stream (Lg: 5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* RAG System Status & Telemetry Panel */}
              <RAGAnalyticsPanel
                semanticRetrievalScore={data.semanticRetrievalScore}
                topKRetrievedChunksCount={data.topKRetrievedChunksCount}
                knowledgeNodesActivatedCount={data.knowledgeNodesActivatedCount}
                contextAlignmentScore={data.contextAlignmentScore}
                groundingScore={data.groundingScore}
                systemStatus={data.systemStatus}
              />

              {/* Current Query Context Panel */}
              <QueryContextPanel
                currentQuery={data.currentQuery}
                retrievedConcepts={data.retrievedConcepts}
                contextConfidence={data.contextConfidence}
              />

              {/* Compact Animated Context Assembly Stream Connector (Current Query ↓ Context Assembly) */}
              <TokenStreamConnector />

              {/* Context Assembly Preview Glassmorphism Card */}
              <ContextAssemblyPreview
                retrievedChunksCount={data.contextAssembly?.retrievedChunksCount}
                contextTokens={data.contextAssembly?.contextTokens}
                maxContextTokens={data.contextAssembly?.maxContextTokens}
                promptGrounding={data.contextAssembly?.promptGrounding}
                contextCompression={data.contextAssembly?.contextCompression}
                generationStatus={data.contextAssembly?.generationStatus}
              />
            </div>
          </div>
        </motion.div>
      )}
    </main>
    </PageTransition>
  );
}
