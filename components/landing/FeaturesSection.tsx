"use client";

/**
 * components/landing/FeaturesSection.tsx
 *
 * Features Section (#features) for INTERVUE AI Landing Page.
 * Displays 5 Core AI Capability Cards with 3D Holographic Icons, Glassmorphism,
 * and Purple/Cyan Neon Ambient Lighting.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import { motion } from "framer-motion";
import {
  AdaptiveDifficultyIcon,
  KnowledgeRetrievalIcon,
  DigitalTwinIcon,
  SelfReflectionIcon,
} from "./HologramIcons";
import { Sparkles, Brain, Cpu, ShieldCheck } from "lucide-react";

const features = [
  {
    id: "adaptive-engine",
    title: "Adaptive Interview Engine",
    subtitle: "Dynamic Question Calibration",
    description:
      "Real-time AI engine that adjusts question difficulty and cognitive depth on-the-fly based on candidate response performance.",
    status: "CALIBRATING",
    badgeColor: "text-purple-300 border-purple-500/40 bg-purple-950/40",
    dotColor: "bg-purple-400",
    icon: <AdaptiveDifficultyIcon />,
  },
  {
    id: "rag-retrieval",
    title: "RAG Knowledge Retrieval",
    subtitle: "Hybrid Context Injection",
    description:
      "Vector embedding search engine retrieving accurate domain context, system design patterns, and evaluation rubrics for every question.",
    status: "RAG ONLINE",
    badgeColor: "text-cyan-300 border-cyan-500/40 bg-cyan-950/40",
    dotColor: "bg-cyan-400",
    icon: <KnowledgeRetrievalIcon />,
  },
  {
    id: "digital-twin",
    title: "Digital Knowledge Twin",
    subtitle: "Evolving Skill Graph",
    description:
      "Builds a comprehensive 3D candidate intelligence profile, tracking skill mastery, problem-solving speed, and knowledge gaps.",
    status: "SYNCED",
    badgeColor: "text-purple-300 border-purple-500/40 bg-purple-950/40",
    dotColor: "bg-purple-400",
    icon: <DigitalTwinIcon />,
  },
  {
    id: "explainable-eval",
    title: "Explainable AI Evaluation",
    subtitle: "Multi-Dimensional Scoring",
    description:
      "Transparent assessment metrics analyzing Technical Depth, Problem Solving Strategy, Communication Clarity, and Code Quality.",
    status: "SCORING",
    badgeColor: "text-emerald-300 border-emerald-500/40 bg-emerald-950/40",
    dotColor: "bg-emerald-400",
    icon: (
      <div className="relative flex items-center justify-center w-7 h-7">
        <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-md animate-pulse" />
        <Brain className="w-6 h-6 text-emerald-300 relative z-10 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      </div>
    ),
  },
  {
    id: "self-reflection",
    title: "Self Reflection Loop",
    subtitle: "Closed-Loop Assessment",
    description:
      "Self-evaluating neural mechanism analyzing answer trajectories turn-by-turn to refine follow-up prompts and eliminate assessment bias.",
    status: "LOOP ACTIVE",
    badgeColor: "text-cyan-300 border-cyan-500/40 bg-cyan-950/40",
    dotColor: "bg-cyan-400",
    icon: <SelfReflectionIcon />,
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-24 px-6 max-w-7xl mx-auto w-full z-10 overflow-hidden"
    >
      {/* Background Volumetric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-mono font-semibold text-purple-300 tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>CAPABILITIES & ARCHITECTURE</span>
        </div>
        <h2 className="font-hero-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-300">Adaptive AI Intelligence</span>
        </h2>
        <p className="max-w-2xl text-slate-400 text-sm md:text-base font-sans leading-relaxed">
          Explore the five core AI subsystems driving next-generation technical interview evaluation.
        </p>
      </div>

      {/* 5 Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {features.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className={`group relative overflow-hidden p-6 rounded-2xl bg-[linear-gradient(135deg,rgba(9,10,22,0.92)_0%,rgba(4,6,16,0.85)_58%,rgba(2,9,18,0.82)_100%)] backdrop-blur-2xl border border-purple-500/30 hover:border-cyan-400/60 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_14px_38px_rgba(0,0,0,0.7),0_0_22px_rgba(168,85,247,0.15)] hover:shadow-[0_0_35px_rgba(56,189,248,0.25)] hover:-translate-y-1 ${
              idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
            }`}
          >
            {/* Top Glow Bar */}
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.6),rgba(56,189,248,0.4),transparent)] opacity-90" />

            <div className="flex items-start justify-between mb-5">
              {/* Module Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-slate-950/90 border border-purple-500/40 backdrop-blur-md flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(168,85,247,0.35)] group-hover:scale-105 transition-transform">
                {item.icon}
              </div>

              {/* Status Badge */}
              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider ${item.badgeColor} flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} animate-pulse`} />
                <span>{item.status}</span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1 mb-3">
              <h3 className="text-lg font-bold text-white tracking-tight font-sans group-hover:text-purple-200 transition-colors">
                {item.title}
              </h3>
              <div className="text-xs font-mono text-cyan-400/90 font-semibold tracking-wide flex items-center gap-1">
                <span>❖</span>
                <span>{item.subtitle}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300/85 leading-relaxed font-sans">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
