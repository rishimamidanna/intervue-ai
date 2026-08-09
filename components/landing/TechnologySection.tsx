"use client";

/**
 * components/landing/TechnologySection.tsx
 *
 * Technology Section (#technology) for INTERVUE AI Landing Page.
 * Displays a futuristic AI System Architecture showcase diagram covering:
 * - AI Engine (Gemini API, Adaptive Strategy)
 * - RAG Knowledge Engine (Vector Embeddings, Hybrid Search)
 * - Memory System (Digital Twin, Knowledge Graph)
 * - Frontend Experience (3D Chamber, Next.js Turbopack)
 *
 * Owner: Member 1 (Frontend / UI)
 */

import { motion } from "framer-motion";
import { Cpu, Layers, Database, Sparkles, Terminal } from "lucide-react";

const techLayers = [
  {
    id: "ai-engine",
    title: "AI Reasoning Engine",
    badge: "GEMINI PRO INTEGRATED",
    icon: Cpu,
    techStack: ["Google Gemini API", "Adaptive Strategy", "Dynamic Difficulty", "Structured JSON Schema"],
    description:
      "Core AI orchestrator evaluating candidate responses in under 800ms, selecting follow-up questions according to candidate mastery level.",
  },
  {
    id: "rag-engine",
    title: "RAG Knowledge Engine",
    badge: "HYBRID VECTOR SEARCH",
    icon: Layers,
    techStack: ["Vector Embeddings", "Cosine Similarity", "Curriculum Knowledge", "Top-K Context"],
    description:
      "Retrieval-Augmented Generation pipeline injecting authoritative technical context, system design trade-offs, and scoring rubrics.",
  },
  {
    id: "memory-system",
    title: "Memory & Digital Twin",
    badge: "REAL-TIME GRAPH SYNC",
    icon: Database,
    techStack: ["Candidate Profiler", "Digital Twin Synapses", "Knowledge Graph", "Session Store"],
    description:
      "Persistent memory store tracking evolving candidate competencies across skills, problem-solving speed, and conceptual gaps.",
  },
  {
    id: "frontend-tech",
    title: "Cinematic UI & 3D Core",
    badge: "NEXT.JS 16 TURBOPACK",
    icon: Terminal,
    techStack: ["Next.js App Router", "Framer Motion", "Tailwind CSS", "PDF Export Engine"],
    description:
      "High-performance client experience delivering SPA page transitions, 3D AI Chamber visualizations, and executive report PDF rendering.",
  },
];

export function TechnologySection() {
  return (
    <section
      id="technology"
      className="relative py-24 px-6 max-w-7xl mx-auto w-full z-10 overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-mono font-semibold text-purple-300 tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>SYSTEM ARCHITECTURE</span>
        </div>
        <h2 className="font-hero-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-300">AI Stack Architecture</span>
        </h2>
        <p className="max-w-2xl text-slate-400 text-sm md:text-base font-sans leading-relaxed">
          Built on production-grade RAG pipelines, dynamic LLM orchestration, and real-time candidate memory.
        </p>
      </div>

      {/* Tech Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {techLayers.map((layer, idx) => {
          const Icon = layer.icon;
          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative p-6 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-purple-500/30 hover:border-cyan-400/60 transition-all duration-300 shadow-[0_14px_38px_rgba(0,0,0,0.7)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans">
                    {layer.title}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-purple-500/30 text-[10px] font-mono font-semibold text-cyan-300 tracking-wider">
                  {layer.badge}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                {layer.description}
              </p>

              {/* Tech Stack Chips */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-900/20">
                {layer.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-purple-500/20 text-[10px] font-mono text-purple-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
