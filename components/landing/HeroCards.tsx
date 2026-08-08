"use client";

import { motion } from "framer-motion";

const cardsData = [
  {
    title: "Adaptive Difficulty",
    description: "AI adjusts question difficulty in real-time based on your performance.",
    tag: "Advanced",
    color: "text-violet-400",
    icon: (
      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "Knowledge Retrieval",
    description: "Retrieves relevant concepts using Hybrid RAG (Vector + BM25) for accurate context.",
    tag: "Confidence 94%",
    color: "text-indigo-400",
    icon: (
      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.11a2 2 0 00-1.84 2.82l4.887 8.552a2 2 0 002.83.693l7.954-4.577a2 2 0 00.797-2.77l-1.022-2.044z" />
      </svg>
    ),
  },
  {
    title: "Digital Twin",
    description: "Builds a live profile of your skills, strengths, weaknesses and learning patterns.",
    tag: "Synced",
    color: "text-cyan-400",
    icon: (
      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Self Reflection",
    description: "Ensures every answer is grounded, accurate and hallucination-free.",
    tag: "Confidence 95%",
    color: "text-blue-400",
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export function HeroCards() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {cardsData.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 1.5 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 rounded-2xl bg-[#0e0f17]/70 backdrop-blur-xl border border-white/10 hover:border-violet-500/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] group"
        >
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-violet-500/10 transition-colors">
                {card.icon}
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">{card.title}</h3>
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed mb-2 pl-9">
            {card.description}
          </p>
          <div className="pl-9 flex items-center gap-2">
            <span className={`text-[10px] font-mono font-medium ${card.color}`}>
              • {card.tag}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
