"use client";

/**
 * components/landing/BuiltBySection.tsx
 *
 * Built By LogicLoom Section for INTERVUE AI Landing Page.
 * Displays 3 elegant team member cards containing member name and glowing LinkedIn button ONLY.
 *
 * Subtitle: Building intelligent AI systems with adaptive agents, RAG, and modern AI engineering.
 *
 * Team Members:
 * 1. Muni Kiran Borra (https://www.linkedin.com/in/munikiran-borra-352a33380/)
 * 2. Abhishek Prem Gudala (https://www.linkedin.com/in/abhishek-prem-kumar-gudala-696065389/)
 * 3. Aditya Rishi Mamidanna (https://www.linkedin.com/in/aditya-rishi-mamidanna-5b1008342/)
 *
 * Owner: Member 1 (Frontend / UI)
 */

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

function LinkedInSvg() {
  return (
    <svg
      className="w-3.5 h-3.5 fill-cyan-400 group-hover/link:scale-110 transition-transform shrink-0"
      viewBox="0 0 24 24"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.2.98-2.18 2.18-2.18s2.18.98 2.18 2.18v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
    </svg>
  );
}

const teamMembers = [
  {
    name: "Muni Kiran Borra",
    linkedin: "https://www.linkedin.com/in/munikiran-borra-352a33380/",
  },
  {
    name: "Abhishek Prem Gudala",
    linkedin: "https://www.linkedin.com/in/abhishek-prem-kumar-gudala-696065389/",
  },
  {
    name: "Aditya Rishi Mamidanna",
    linkedin: "https://www.linkedin.com/in/aditya-rishi-mamidanna-5b1008342/",
  },
];

export function BuiltBySection() {
  return (
    <section
      id="built-by"
      className="relative py-20 px-6 max-w-7xl mx-auto w-full z-10 overflow-hidden text-center"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Section Title & Subtitle */}
      <div className="flex flex-col items-center text-center mb-14 space-y-3.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-mono font-semibold text-purple-300 tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>TEAM LOGICLOOM</span>
        </div>
        <h2 className="font-hero-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Built By <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-300">LogicLoom</span>
        </h2>
        <p className="max-w-2xl text-slate-400 text-sm sm:text-base font-sans leading-relaxed">
          Building intelligent AI systems with adaptive agents, RAG, and modern AI engineering.
        </p>
      </div>

      {/* 3 Minimal Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto relative z-10">
        {teamMembers.map((member, idx) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.12 }}
            className="group relative overflow-hidden p-6 rounded-2xl bg-[linear-gradient(135deg,rgba(15,18,36,0.85)_0%,rgba(6,9,24,0.8)_100%)] backdrop-blur-2xl border border-purple-500/30 hover:border-cyan-400/60 transition-all duration-300 shadow-[0_14px_38px_rgba(0,0,0,0.75)] hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:-translate-y-1 flex flex-col items-center justify-center space-y-4"
          >
            {/* Top Border Glow Highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.8),rgba(56,189,248,0.6),transparent)]" />

            {/* Member Name */}
            <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight group-hover:text-cyan-200 transition-colors">
              {member.name}
            </h3>

            {/* Glowing LinkedIn Icon Button */}
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-slate-950/80 border border-purple-500/30 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/80 hover:bg-slate-900 text-xs font-mono font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-[0_0_18px_rgba(56,189,248,0.5)] group/link"
              aria-label={`${member.name}'s LinkedIn Profile`}
            >
              <LinkedInSvg />
              <span>LinkedIn</span>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
