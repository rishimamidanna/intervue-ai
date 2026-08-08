"use client";

import { motion, useReducedMotion } from "framer-motion";

const cardsData = [
  {
    title: "Adaptive Difficulty",
    description: "Real-time AI adjusts interview difficulty dynamically based on candidate performance.",
    status: "Adaptive",
    color: "text-violet-300",
    dotColor: "bg-violet-400",
    iconBg: "border-purple-500/30 shadow-[0_0_12px_rgba(124,58,237,0.3)]",
    icon: (
      <svg className="w-4 h-4 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "Knowledge Retrieval",
    description: "Hybrid RAG retrieves accurate technical context for every question.",
    status: "94% Confidence",
    color: "text-cyan-300",
    dotColor: "bg-cyan-400",
    iconBg: "border-cyan-500/30 shadow-[0_0_12px_rgba(56,189,248,0.3)]",
    icon: (
      <svg className="w-4 h-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: "Digital Twin",
    description: "Builds candidate intelligence profile from skills and response patterns.",
    status: "Learning Synced",
    color: "text-purple-300",
    dotColor: "bg-purple-400",
    iconBg: "border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.3)]",
    icon: (
      <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Self Reflection",
    description: "AI evaluates answers and improves assessment accuracy.",
    status: "95% Confidence",
    color: "text-cyan-300",
    dotColor: "bg-cyan-400",
    iconBg: "border-cyan-500/30 shadow-[0_0_12px_rgba(56,189,248,0.3)]",
    icon: (
      <svg className="w-4 h-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

/**
 * Premium HeroCards component for INTERVUE AI matching the reference image.
 * Displays right-column dark glass feature cards with glowing circular icons,
 * concise descriptions, and status indicators.
 */
export function HeroCards() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-3.5 w-full max-w-xs sm:max-w-sm">
      {cardsData.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, x: 18 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1, x: 0, y: 0 }
              : { opacity: 1, x: 0, y: [0, -2, 0, 1, 0] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
              : {
                  opacity: { duration: 0.55, delay: 0.55 + idx * 0.08, ease: [0.16, 1, 0.3, 1] },
                  x: { duration: 0.55, delay: 0.55 + idx * 0.08, ease: [0.16, 1, 0.3, 1] },
                  y: {
                    duration: 4.8 + idx * 0.35,
                    delay: 1 + idx * 0.24,
                    repeat: Infinity,
                    ease: [0.45, 0, 0.55, 1],
                  },
                }
          }
          style={{ willChange: prefersReducedMotion ? "auto" : "transform" }}
          className="group relative overflow-hidden p-4 rounded-2xl bg-[linear-gradient(135deg,rgba(9,10,20,0.88)_0%,rgba(3,5,13,0.82)_58%,rgba(2,8,15,0.78)_100%)] backdrop-blur-2xl border border-violet-300/25 hover:border-cyan-300/35 transition-[border-color,box-shadow] duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_0_26px_rgba(99,102,241,0.08),0_14px_38px_rgba(0,0,0,0.68),0_0_22px_rgba(76,29,149,0.1)] before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(167,139,250,0.58),rgba(56,189,248,0.32),transparent)] before:opacity-80"
        >
          <motion.span
            aria-hidden="true"
            data-glass-edge-glint={idx}
            initial={false}
            animate={
              prefersReducedMotion
                ? { opacity: 0, x: "-140%" }
                : { opacity: [0, 0.72, 0.28, 0], x: ["-140%", "420%"] }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: 1.25,
                    delay: 0.65 + idx * 0.22,
                    repeat: Infinity,
                    repeatDelay: 3.6 + idx * 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
            className="pointer-events-none absolute left-0 top-0 z-20 h-px w-[32%] bg-[linear-gradient(90deg,transparent,rgba(167,139,250,0.72),rgba(56,189,248,0.52),transparent)] shadow-[0_0_8px_rgba(139,92,246,0.28)]"
          />

          <div className="relative z-10 flex items-start gap-3.5">
            {/* Glowing Circular Icon Background */}
            <div className={`w-9 h-9 rounded-full bg-slate-950/90 border ${card.iconBg} flex items-center justify-center shrink-0 group-hover:border-purple-400/60 transition-colors mt-0.5`}>
              {card.icon}
            </div>

            {/* Card Content Stack */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white tracking-tight mb-1">
                {card.title}
              </h3>
              <p className="text-xs text-neutral-300/90 font-normal leading-relaxed mb-2">
                {card.description}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium">
                <span className={`h-1.5 w-1.5 rounded-full ${card.dotColor} animate-pulse motion-reduce:animate-none`} />
                <span className={card.color}>{card.status}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
