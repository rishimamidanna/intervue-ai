"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function HeroHeader() {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-6"
    >
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-violet-400/30 group-hover:scale-105 transition-transform duration-200">
          <span className="text-xs font-black tracking-widest text-white">IV</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          INTER<span className="text-violet-400">VUE</span>{" "}
          <span className="text-xs tracking-widest font-mono text-neutral-400 font-normal">AI</span>
        </span>
      </Link>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
        <Link
          href="#home"
          className="text-white relative py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-violet-500 after:rounded-full"
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
        onClick={() => router.push("/interview")}
        className="relative group overflow-hidden px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.35)] border border-violet-400/30 flex items-center gap-2"
      >
        <span>Get Started</span>
        <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
      </button>
    </motion.header>
  );
}
