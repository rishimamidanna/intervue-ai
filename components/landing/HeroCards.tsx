"use client";

/**
 * components/landing/HeroCards.tsx
 *
 * $1B Enterprise AI Product Launch Landing Hero Feature Modules.
 * Apple Vision Pro x OpenAI x NVIDIA AI Aesthetic.
 *
 * Features:
 * - 3D Holographic AI Module Icons (Calibration, Neural RAG Core, Memory Core, Feedback Mirror)
 * - Subsystem Technical Status Badges & Interactive Pipeline Flow Tags
 * - Travelling Holographic Data Particles connecting Central AI Core to Feature Modules
 * - Ultra-Deep Glassmorphism with Strict Overflow Clipping & Hover Elevation
 *
 * Owner: Member 1 (Frontend / UI)
 */

import { motion, useReducedMotion } from "framer-motion";
import {
  AdaptiveDifficultyIcon,
  KnowledgeRetrievalIcon,
  DigitalTwinIcon,
  SelfReflectionIcon,
} from "./HologramIcons";

const cardsData = [
  {
    title: "Adaptive Difficulty",
    description: "Real-time AI adjusts interview difficulty dynamically based on candidate performance.",
    status: "ACTIVE",
    subsystem: "Dynamic Difficulty Calibration",
    color: "text-purple-300 border-purple-500/40 bg-purple-950/50",
    dotColor: "bg-purple-400",
    iconBg: "border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.45)]",
    icon: <AdaptiveDifficultyIcon />,
  },
  {
    title: "Knowledge Retrieval",
    description: "Hybrid RAG retrieves accurate technical context for every question.",
    status: "RAG CONNECTED",
    subsystem: "Top-K Context Retrieval",
    color: "text-cyan-300 border-cyan-500/40 bg-cyan-950/50",
    dotColor: "bg-cyan-400",
    iconBg: "border-cyan-500/60 shadow-[0_0_20px_rgba(56,189,248,0.45)]",
    icon: <KnowledgeRetrievalIcon />,
  },
  {
    title: "Digital Twin",
    description: "Builds candidate intelligence profile from skills and response patterns.",
    status: "MEMORY SYNCED",
    subsystem: "Candidate Profile Synapses",
    color: "text-purple-300 border-purple-500/40 bg-purple-950/50",
    dotColor: "bg-purple-400",
    iconBg: "border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.45)]",
    icon: <DigitalTwinIcon />,
  },
  {
    title: "Self Reflection",
    description: "AI evaluates answers and improves assessment accuracy.",
    status: "FEEDBACK LOOP ACTIVE",
    subsystem: "Continuous Self Evaluation",
    color: "text-cyan-300 border-cyan-500/40 bg-cyan-950/50",
    dotColor: "bg-cyan-400",
    iconBg: "border-cyan-500/60 shadow-[0_0_20px_rgba(56,189,248,0.45)]",
    icon: <SelfReflectionIcon />,
  },
];

export function HeroCards() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative z-10 flex flex-col gap-4 w-full max-w-xs sm:max-w-sm">
      {/* Holographic Data Streams with Travelling Particles (Behind Cards z-0) */}
      <svg
        className="hidden lg:block absolute -left-16 top-0 bottom-0 w-16 h-full pointer-events-none z-0 opacity-60"
        viewBox="0 0 64 420"
        fill="none"
      >
        {/* Stream Paths */}
        <path d="M0 55 C32 55, 32 65, 64 65" stroke="url(#holoPurple)" strokeWidth="1.8" strokeDasharray="4 3" />
        <path d="M0 160 C32 160, 32 170, 64 170" stroke="url(#holoCyan)" strokeWidth="1.8" strokeDasharray="4 3" />
        <path d="M0 265 C32 265, 32 275, 64 275" stroke="url(#holoPurple)" strokeWidth="1.8" strokeDasharray="4 3" />
        <path d="M0 370 C32 370, 32 380, 64 380" stroke="url(#holoCyan)" strokeWidth="1.8" strokeDasharray="4 3" />

        {/* Travelling Energy Data Particles */}
        <motion.circle
          r="2.5"
          fill="#f0abfc"
          animate={{
            cx: [0, 20, 40, 64],
            cy: [55, 58, 62, 65],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          r="2.5"
          fill="#38bdf8"
          animate={{
            cx: [0, 20, 40, 64],
            cy: [160, 163, 167, 170],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          r="2.5"
          fill="#f0abfc"
          animate={{
            cx: [0, 20, 40, 64],
            cy: [265, 268, 272, 275],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 2.1, delay: 1.0, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          r="2.5"
          fill="#38bdf8"
          animate={{
            cx: [0, 20, 40, 64],
            cy: [370, 373, 377, 380],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 2.4, delay: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />

        <defs>
          <linearGradient id="holoPurple" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="50%" stopColor="#e879f9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="holoCyan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>

      {cardsData.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, x: 18 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1, x: 0, y: 0 }
              : { opacity: 1, x: 0, y: [0, -3, 0, 2, 0] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
              : {
                  opacity: { duration: 0.55, delay: 0.55 + idx * 0.08, ease: [0.16, 1, 0.3, 1] },
                  x: { duration: 0.55, delay: 0.55 + idx * 0.08, ease: [0.16, 1, 0.3, 1] },
                  y: {
                    duration: 5.2 + idx * 0.4,
                    delay: 1 + idx * 0.24,
                    repeat: Infinity,
                    ease: [0.45, 0, 0.55, 1],
                  },
                }
          }
          style={{ willChange: prefersReducedMotion ? "auto" : "transform" }}
          className="group relative z-10 overflow-hidden p-4 rounded-2xl bg-[linear-gradient(135deg,rgba(9,10,22,0.96)_0%,rgba(4,6,16,0.92)_58%,rgba(2,9,18,0.88)_100%)] backdrop-blur-2xl border border-purple-500/35 hover:border-cyan-400/70 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_24px_rgba(168,85,247,0.12),0_16px_40px_rgba(0,0,0,0.85)] hover:shadow-[0_0_35px_rgba(56,189,248,0.35)] hover:scale-[1.02] hover:-translate-y-0.5 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.8),rgba(56,189,248,0.6),transparent)] before:opacity-100"
        >
          <div className="flex items-start gap-3.5 relative z-10">
            {/* Glass Holographic Module Icon Container */}
            <div
              className={`w-11 h-11 rounded-xl bg-slate-950/95 border backdrop-blur-md flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400/90 ${card.iconBg}`}
            >
              {card.icon}
            </div>

            {/* Subsystem Technical Metadata */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight font-sans truncate">
                  {card.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider ${card.color} shadow-sm flex items-center gap-1 shrink-0`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor} animate-pulse`} />
                  <span>{card.status}</span>
                </span>
              </div>

              {/* Subsystem Pipeline Tag */}
              <div className="text-[10px] font-mono text-cyan-300/90 tracking-wide flex items-center gap-1 font-semibold">
                <span className="text-purple-400">❖</span>
                <span className="truncate">{card.subsystem}</span>
              </div>

              <p className="text-xs text-slate-300/85 leading-relaxed font-sans line-clamp-2 pt-0.5">
                {card.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
