"use client";

/**
 * components/knowledge-graph/TokenStreamConnector.tsx
 *
 * Compact Animated Token Stream Connection Component between:
 * Current RAG Query → Context Assembly Preview.
 * Visualizes query context and retrieved chunks flowing into the LLM context window with:
 * - Thin glowing vertical cyan/purple connection line
 * - Animated Framer Motion token particles traveling downward
 * - Compact mono stream telemetry badge
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import { motion } from "framer-motion";

export function TokenStreamConnector() {
  return (
    <div className="relative py-0 -my-2 flex flex-col items-center justify-center pointer-events-none z-20">
      {/* Central Glowing Connection Line */}
      <div className="relative w-0.5 h-6 bg-gradient-to-b from-cyan-500/80 via-purple-500/80 to-cyan-500/80 shadow-[0_0_8px_rgba(56,189,248,0.6)] overflow-hidden">
        {/* Particle 1 flowing downward */}
        <motion.div
          animate={{ y: [-6, 28] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          className="w-1.5 h-1.5 -left-[2px] relative rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(56,189,248,1)]"
        />
        {/* Particle 2 with delay */}
        <motion.div
          animate={{ y: [-6, 28] }}
          transition={{ duration: 0.9, delay: 0.45, repeat: Infinity, ease: "linear" }}
          className="w-1.5 h-1.5 -left-[2px] relative rounded-full bg-purple-300 shadow-[0_0_8px_rgba(168,85,247,1)]"
        />
      </div>

      {/* Stream Label Badge */}
      <div className="px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-cyan-500/40 backdrop-blur-md flex items-center space-x-1.5 shadow-lg -mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-cyan-300">
          CONTEXT ASSEMBLY STREAM ↓
        </span>
      </div>
    </div>
  );
}
