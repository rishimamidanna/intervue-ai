"use client";

/**
 * app/settings/page.tsx
 *
 * INTERVUE AI Settings & Configuration Intelligence Workspace.
 * Allows candidates and recruiters to configure AI evaluation models, RAG vector retrieval depth,
 * session telemetry controls, and display preferences.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/common/PageTransition";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function SettingsPage() {
  const [llmModel, setLlmModel] = useState("gemini-2.5-flash");
  const [topK, setTopK] = useState(3);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.85);
  const [autoSaveSession, setAutoSaveSession] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-slate-100 font-sans selection:bg-purple-500 selection:text-white p-4 md:p-8 lg:p-12 relative overflow-x-hidden">
      {/* Background Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-purple-950/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-cyan-950/20 rounded-full blur-[150px]" />
      </div>

      {/* Floating Top Navigation Header */}
      <DashboardHeader />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Settings Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 backdrop-blur-2xl border border-purple-500/30 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
          <div>
            <span className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
              SYSTEM CONFIGURATION
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
              Platform Settings
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Configure Gemini LLM evaluation engine, RAG retrieval thresholds, and session telemetry.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-mono text-xs font-semibold tracking-wide shadow-lg shadow-purple-500/30 hover:scale-[1.02] transition-all"
          >
            {savedSuccess ? "✓ Settings Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Section 1: AI Engine Configuration */}
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 md:p-8 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold font-sans text-white">AI Evaluation Engine</h2>
            <p className="text-xs font-mono text-slate-400">Choose primary LLM inference model and evaluation rigor</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">Inference Model</label>
              <select
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-purple-400 focus:outline-none"
              >
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Fastest / Low Latency)</option>
                <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Technical Rigor)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">Evaluation Strictness</label>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 font-bold">
                Standard Enterprise (5 Rubrics: Correctness, Reasoning, Depth, Comm, Eng)
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: RAG Vector Retrieval Telemetry */}
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 p-6 md:p-8 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold font-sans text-white">RAG Vector Retrieval Settings</h2>
            <p className="text-xs font-mono text-slate-400">Control curriculum chunk retrieval & cosine similarity cutoff</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-slate-300 font-bold">Top-K Retrieved Chunks</label>
                <span className="text-cyan-300 font-bold">{topK} Chunks / Turn</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-slate-300 font-bold">Similarity Cutoff Threshold</label>
                <span className="text-cyan-300 font-bold">{similarityThreshold} Cosine</span>
              </div>
              <input
                type="range"
                min={0.7}
                max={0.95}
                step={0.05}
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Session Persistence */}
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 md:p-8 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold font-sans text-white">Session & Redis Telemetry</h2>
            <p className="text-xs font-mono text-slate-400">Upstash Redis state persistence & browser storage</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
            <div>
              <span className="font-bold text-slate-200 block">Auto-Save Session State to LocalStorage</span>
              <span className="text-slate-400 text-[11px]">Preserves active session ID across browser refreshes</span>
            </div>
            <input
              type="checkbox"
              checked={autoSaveSession}
              onChange={(e) => setAutoSaveSession(e.target.checked)}
              className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </main>
    </PageTransition>
  );
}
