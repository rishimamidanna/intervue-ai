"use client";

/**
 * components/landing/HeroHeader.tsx
 *
 * Landing Page Navigation Header featuring the unified INTERVUE AI Logo.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export function HeroHeader() {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-6"
    >
      {/* Universal Brand Logo */}
      <div className="shrink-0">
        <Logo variant="hero" href="/" />
      </div>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
        <Link
          href="#home"
          className="text-white relative py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-500 after:rounded-full"
        >
          Home
        </Link>
        <Link href="#features" className="hover:text-white transition-colors duration-200">
          Features
        </Link>
        <Link href="#how-it-works" className="hover:text-white transition-colors duration-200">
          How it Works
        </Link>
        <Link href="#technology" className="hover:text-white transition-colors duration-200">
          Technology
        </Link>
        <Link href="#about" className="hover:text-white transition-colors duration-200">
          About
        </Link>
      </nav>

      {/* Header Action Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="relative group overflow-hidden px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.35)] border border-purple-400/30 flex items-center gap-2 shrink-0 whitespace-nowrap"
      >
        <span>Get Started</span>
        <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
      </button>
    </motion.header>
  );
}
