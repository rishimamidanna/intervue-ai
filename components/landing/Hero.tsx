"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HeroHeader } from "./HeroHeader";
import { Hero3DScene } from "./Hero3DScene";
import { HeroCards } from "./HeroCards";
import { TrustedBy } from "./TrustedBy";

const checklistItems = [
  "Adaptive Interviews",
  "Knowledge Retrieval",
  "Candidate Memory",
  "Real-time Analysis",
  "Personalized Feedback",
];

const telemetryStats = [
  { value: "10K+", label: "Interviews Conducted" },
  { value: "95%", label: "Accuracy" },
  { value: "4.9/5", label: "User Rating" },
  { value: "30+", label: "Skills Covered" },
];

export function Hero() {
  const router = useRouter();

  return (
    <section
      className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#050508]"
      aria-labelledby="hero-headline"
    >
      {/* 3D Background Scene with Depth & Focal Core */}
      <Hero3DScene />

      {/* Header Navigation Bar */}
      <HeroHeader />

      {/* Main Foreground Composition Grid */}
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Copy & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 tracking-wide uppercase backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              ✦ AI-POWERED INTERVIEW AGENT
            </div>

            {/* Headline */}
            <h1
              id="hero-headline"
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6"
            >
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-400">
                Technical Interviews
              </span>
            </h1>

            {/* Body Description */}
            <p className="text-base sm:text-lg text-neutral-300 max-w-xl leading-relaxed mb-8 font-normal">
              Adaptive AI interviews that understand, evaluate and unlock true potential.
              Built with advanced RAG, candidate memory and adaptive intelligence.
            </p>

            {/* Checklist Feature Tags */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 text-xs font-medium text-neutral-300">
              {checklistItems.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <span className="text-violet-400 font-bold">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10 w-full max-w-lg pt-4 border-t border-white/10">
              {telemetryStats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => router.push("/interview")}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white font-semibold text-base shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_45px_rgba(124,58,237,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-violet-400/30"
            >
              <span>Start Interview</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200 text-lg">→</span>
            </button>
          </motion.div>

          {/* Right Column: Glass Feature Cards */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <HeroCards />
          </div>
        </div>
      </div>

      {/* Bottom Footer Company Logos */}
      <TrustedBy />
    </section>
  );
}
