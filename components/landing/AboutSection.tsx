"use client";

/**
 * components/landing/AboutSection.tsx
 *
 * About / Vision Section (#about) for INTERVUE AI Landing Page.
 * Displays the product vision and core value proposition:
 * "Building the next generation of intelligent technical interviews."
 * "Traditional interviews evaluate answers. INTERVUE AI understands how candidates think, how knowledge evolves, where improvement is needed."
 *
 * Owner: Member 1 (Frontend / UI)
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Brain, Sparkles } from "lucide-react";

export function AboutSection() {
  const router = useRouter();

  return (
    <section
      id="about"
      className="relative py-28 px-6 max-w-7xl mx-auto w-full z-10 overflow-hidden"
    >
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-r from-purple-600/15 via-indigo-600/10 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Vision Statement */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-6 text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-mono font-semibold text-purple-300 tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PRODUCT VISION</span>
          </div>

          <h2 className="font-hero-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
            Building the Next Generation of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-300">
              Intelligent Technical Interviews
            </span>
          </h2>

          <p className="text-base text-slate-300 leading-relaxed font-sans">
            Traditional technical interviews evaluate static answers. <strong className="text-white">INTERVUE AI</strong> creates adaptive evaluation chambers that understand candidate cognitive reasoning, track skill progression, and unlock true potential.
          </p>

          {/* Key Differentiators */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white font-sans">How Candidates Think</h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Analyzes problem-solving strategy, trade-off analysis, and system architecture decision pathways.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white font-sans">How Knowledge Evolves</h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Tracks continuous skill graph progression during the interview session turn-by-turn.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white font-sans">Where Improvement Is Needed</h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Delivers actionable gap analysis and personalized learning growth roadmaps in executive reports.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-sans text-xs font-semibold tracking-wider uppercase shadow-[0_0_25px_rgba(168,85,247,0.4)] border border-purple-400/30 transition-all flex items-center gap-2 group"
            >
              <span>Experience INTERVUE AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Right Column: Interactive Vision Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex justify-center"
        >
          <div className="w-full p-8 rounded-3xl bg-[linear-gradient(135deg,rgba(15,18,36,0.92)_0%,rgba(6,9,24,0.88)_100%)] backdrop-blur-2xl border border-purple-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(168,85,247,0.25)] space-y-6 relative overflow-hidden">
            {/* Ambient Inner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <Brain className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight font-sans">
              An Adaptive AI Interviewer That Learns With Every Interaction
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              INTERVUE AI combines high-accuracy RAG knowledge retrieval, real-time candidate profiling, and closed-loop self reflection to deliver true technical interview intelligence.
            </p>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>AI Interview Intelligence</span>
                <span className="text-emerald-400 font-bold">100% Active</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full w-full animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
