"use client";

/**
 * components/landing/HowItWorksSection.tsx
 *
 * How It Works Section (#how-it-works) for INTERVUE AI Landing Page.
 * Displays a futuristic 6-stage AI workflow timeline with glowing connection paths.
 *
 * Stages:
 * 1. Candidate Profile
 * 2. AI Interview Agent
 * 3. Adaptive Question Engine
 * 4. RAG Retrieval
 * 5. AI Evaluation
 * 6. Personalized Report
 *
 * Owner: Member 1 (Frontend / UI)
 */

import { motion } from "framer-motion";
import { Workflow, User, Bot, Cpu, Database, Award, FileSpreadsheet } from "lucide-react";

const workflowStages = [
  {
    step: "01",
    title: "Candidate Profile",
    description: "Ingests resume, role requirements, and target technical domain.",
    icon: User,
    color: "from-purple-600 to-indigo-600",
  },
  {
    step: "02",
    title: "AI Interview Agent",
    description: "Initializes interactive voice/text session tailored to role level.",
    icon: Bot,
    color: "from-indigo-600 to-cyan-600",
  },
  {
    step: "03",
    title: "Adaptive Question Engine",
    description: "Generates questions calibrated dynamically to candidate response depth.",
    icon: Cpu,
    color: "from-cyan-600 to-blue-600",
  },
  {
    step: "04",
    title: "RAG Retrieval",
    description: "Fetches domain context, code patterns, and evaluation rubrics.",
    icon: Database,
    color: "from-blue-600 to-violet-600",
  },
  {
    step: "05",
    title: "AI Evaluation",
    description: "Evaluates accuracy, system design, problem solving, and trade-offs.",
    icon: Award,
    color: "from-violet-600 to-purple-600",
  },
  {
    step: "06",
    title: "Personalized Report",
    description: "Generates 3D Digital Twin graph and downloadable executive PDF report.",
    icon: FileSpreadsheet,
    color: "from-purple-600 to-cyan-500",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 px-6 max-w-7xl mx-auto w-full z-10 overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-20 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-mono font-semibold text-cyan-300 tracking-widest uppercase shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <Workflow className="w-3.5 h-3.5 text-cyan-400" />
          <span>WORKFLOW PIPELINE</span>
        </div>
        <h2 className="font-hero-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          How <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-400">INTERVUE AI Works</span>
        </h2>
        <p className="max-w-2xl text-slate-400 text-sm md:text-base font-sans leading-relaxed">
          From candidate profile analysis to real-time adaptive questioning and executive reporting.
        </p>
      </div>

      {/* Timeline Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {workflowStages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <motion.div
              key={stage.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative p-6 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-purple-500/30 hover:border-cyan-400/60 transition-all duration-300 shadow-[0_14px_38px_rgba(0,0,0,0.7)] hover:-translate-y-1"
            >
              {/* Step Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest">
                  STAGE {stage.step}
                </span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stage.color} p-0.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform`}>
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-white tracking-tight mb-2 font-sans">
                {stage.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {stage.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
