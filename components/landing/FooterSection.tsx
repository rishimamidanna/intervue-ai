"use client";

/**
 * components/landing/FooterSection.tsx
 *
 * Footer Section for INTERVUE AI Landing Page.
 * Displays universal Logo component, quick navigation links, system status indicator,
 * and copyright info.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function FooterSection() {
  return (
    <footer className="w-full border-t border-purple-900/30 bg-[#040408] py-12 px-6 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand Logo & Tagline */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <Logo variant="navbar" href="/" />
          <p className="text-xs text-slate-500 font-mono">
            Adaptive AI Technical Interview Intelligence
          </p>
        </div>

        {/* Quick Nav Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
          <Link href="#home" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="#technology" className="hover:text-white transition-colors">
            Technology
          </Link>
          <Link href="#about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Dashboard
          </Link>
        </nav>

        {/* System Status & Copyright */}
        <div className="flex flex-col items-center md:items-end space-y-2">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono shadow-[0_0_12px_rgba(52,211,153,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase font-semibold">AI SYSTEM ONLINE</span>
          </div>
          <span className="text-[11px] font-mono text-slate-600">
            © {new Date().getFullYear()} INTERVUE AI. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
