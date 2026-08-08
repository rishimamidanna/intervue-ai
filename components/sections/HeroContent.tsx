"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useRef, MouseEvent, useEffect } from "react";
import { heroInteractionStore } from "@/components/3d/heroInteractionStore";

/**
 * HeroContent component for INTERVUE AI.
 * Implements the 1.5s - 2.0s timed typography reveal, 2.0s CTA activation,
 * magnetic cursor-tracking hover effect, light sweep animation,
 * and 3D AI Core reaction triggering.
 */
export function HeroContent() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCtaActive, setIsCtaActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Activate CTA at exactly 2.0 seconds in the page load sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCtaActive(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Magnetic Hover Effect Physics Setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Magnetic pull range (pull up to 12px towards cursor)
    x.set(distanceX * 0.25);
    y.set(distanceY * 0.25);
  }

  function handleMouseEnter() {
    heroInteractionStore.setCtaHovered(true);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    heroInteractionStore.setCtaHovered(false);
  }

  function handleStart() {
    if (!isCtaActive) return;
    setIsNavigating(true);
    router.push("/interview");
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
            delayChildren: 1.5, // 1.5s - 2.0s headline and description reveal
          },
        },
      }}
      className="flex flex-col items-start text-left max-w-2xl"
    >
      {/* Brand Badge */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          },
        }}
        className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(124,58,237,0.2)]"
      >
        <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
        <span>INTERVUE AI</span>
        <span className="text-neutral-500">•</span>
        <span className="text-neutral-300 font-mono text-[11px]">ADAPTIVE AI INTERVIEW INTELLIGENCE</span>
      </motion.div>

      {/* Hero Statement Headline */}
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 25 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
          },
        }}
        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.18] mb-6"
      >
        The Future of <br />
        Technical <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300 drop-shadow-[0_0_25px_rgba(167,139,250,0.4)]">
          Interviews
        </span>
      </motion.h1>

      {/* Supporting Text Description */}
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          },
        }}
        className="text-base sm:text-lg text-neutral-300/90 font-normal leading-relaxed mb-10 max-w-xl"
      >
        Adaptive AI interviews that understand your skills, <br className="hidden sm:inline" />
        evaluate your knowledge, and reveal your true potential.
      </motion.p>

      {/* Action Button CTA with Magnetic Hover, Glow, Light Sweep, and AI Core Reaction */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          },
        }}
        style={{ x: springX, y: springY }}
      >
        <motion.button
          ref={buttonRef}
          onClick={handleStart}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={!isCtaActive || isNavigating}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 0 50px rgba(124, 58, 237, 0.75)",
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="group relative inline-flex items-center gap-3.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white font-semibold text-base shadow-[0_0_30px_rgba(124,58,237,0.4)] border border-violet-400/40 cursor-pointer disabled:opacity-50 overflow-hidden"
        >
          {/* Light Sweep Animation Overlay */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out pointer-events-none" />

          {/* Button Text & Arrow */}
          <span className="relative z-10">
            {isNavigating ? "Initializing…" : isCtaActive ? "Start Interview" : "Ready"}
          </span>
          <span className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300 text-lg">
            →
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
