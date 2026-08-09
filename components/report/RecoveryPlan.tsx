"use client";

/**
 * components/report/RecoveryPlan.tsx
 *
 * SECTION 6: Personalized Recovery Plan Component for Final Report.
 * Displays AI-generated 3-week learning roadmap timeline:
 * Week 1: Improve Retrieval Evaluation
 * Week 2: Master Vector Index Optimization
 * Week 3: Build Production RAG Systems
 *
 * Supports both custom plan items and generic RecoveryItem[] from FinalFeedback.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";
import type { RecoveryItem } from "@/types/feedback";

export interface PlanTask {
  week: string;
  title: string;
  focus: string;
  tasks: string[];
}

export interface RecoveryPlanProps {
  plan?: PlanTask[];
  items?: RecoveryItem[];
}

export function RecoveryPlan({
  plan,
  items,
}: RecoveryPlanProps) {
  const defaultPlan: PlanTask[] = [
    {
      week: "Week 1",
      title: "Improve Retrieval Evaluation",
      focus: "Grounded RAG Context & Cosine Similarity Metrics",
      tasks: ["Study 2-stage retrieval pipelines", "Implement custom similarity thresholds", "Benchmark top-K recall scores"],
    },
    {
      week: "Week 2",
      title: "Master Vector Index Optimization",
      focus: "HNSW Graph Partitioning & IVF Scaling",
      tasks: ["Optimize layer probability scale factors", "Benchmark graph search pathing latency", "Tune GPU memory footprint"],
    },
    {
      week: "Week 3",
      title: "Build Production RAG Systems",
      focus: "Cross-Encoder Reranking & Fault Tolerance",
      tasks: ["Implement bi-encoder vs cross-encoder staging", "Set up RAG cache invalidation policies", "Deploy end-to-end evaluation pipeline"],
    },
  ];

  const displayPlan: PlanTask[] = plan || (items && items.length > 0 ? items.map((it: RecoveryItem, idx: number) => ({
    week: `Week ${it.priority || idx + 1}`,
    title: it.topic || `Focus Area ${idx + 1}`,
    focus: it.action || "Targeted Skill Acceleration",
    tasks: it.resources || ["Review technical documentation", "Implement practice exercises"],
  })) : defaultPlan);

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xl font-extrabold font-sans text-white">Personalized AI Recovery Plan</h3>
          <p className="text-xs text-slate-400 font-mono">3-Week Targeted Growth Roadmap</p>
        </div>
        <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          AI Roadmap
        </span>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {displayPlan.map((item: PlanTask, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.1 }}
            className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 relative group hover:border-cyan-400/50 transition-colors shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 font-mono text-xs font-bold text-cyan-300">
                  {item.week}
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>

              <h4 className="text-sm font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs font-mono text-purple-300">
                Focus: {item.focus}
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              {item.tasks.map((task: string, tIdx: number) => (
                <div key={tIdx} className="text-xs font-mono text-slate-300 flex items-start space-x-1.5">
                  <span className="text-cyan-400">•</span>
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
