"use client";

/**
 * components/common/PageTransition.tsx
 *
 * Global Framer Motion Page Transition & AI Chamber Initialization Component.
 * Ensures 100% animation consistency across all routes in INTERVUE AI
 * (/dashboard, /interview, /history, /digital-twin, /knowledge-graph, /analytics, /report, /settings).
 *
 * Features:
 * - Unified easing curve & scale/fade transition
 * - Cinematic AI Chamber initialization overlay ("Initializing AI Interview Chamber...")
 * - Radial purple/cyan energy glow pulse
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  isChamberInit?: boolean;
  initMessage?: string;
}

export function PageTransition({
  children,
  className = "",
  isChamberInit = false,
  initMessage = "Initializing AI Interview Chamber...",
}: PageTransitionProps) {
  const [showOverlay, setShowOverlay] = useState<boolean>(isChamberInit);

  useEffect(() => {
    if (isChamberInit) {
      setShowOverlay(true);
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isChamberInit]);

  const pageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.12,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: -15,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  return (
    <>
      {/* Cinematic AI Chamber Initialization Overlay */}
      <AnimatePresence font-sans>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center space-y-6 select-none"
          >
            {/* Pulsing Energy Glow Core */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-purple-600/30 blur-2xl animate-pulse" />
              <div className="absolute w-16 h-16 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_30px_rgba(56,189,248,0.6)]" />
              <div className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold font-mono text-white tracking-wider uppercase">
                {initMessage}
              </h2>
              <p className="text-xs font-mono text-cyan-300/80 animate-pulse">
                Synthesizing Adaptive Vector Topology & Grounded Evaluator Engine...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Transition Container */}
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </>
  );
}
