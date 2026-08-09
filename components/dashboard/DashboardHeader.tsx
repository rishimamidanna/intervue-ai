"use client";

/**
 * components/dashboard/DashboardHeader.tsx
 *
 * Futuristic Floating Glass Top Navigation Bar for INTERVUE AI.
 * Displays brand logo, glowing active navigation items with usePathname route matching,
 * system status badge, and Apple Vision Pro style floating glass container.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function DashboardHeader() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Interview", href: "/interview" },
    { label: "Digital Twin", href: "/digital-twin" },
    { label: "Knowledge Graph", href: "/knowledge-graph" },
    { label: "Analytics", href: "/analytics" },
    { label: "Reports", href: "/report" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-4 z-50 max-w-7xl mx-auto px-4 mb-8"
    >
      <div className="rounded-2xl bg-slate-900/70 backdrop-blur-2xl border border-purple-500/30 p-3 md:px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between">
        {/* Brand Logo & Identifier */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-extrabold font-mono text-sm">
                AI
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold font-sans tracking-widest text-slate-100 text-sm md:text-base flex items-center space-x-1.5">
              <span>INTERVUE</span>
              <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                OS
              </span>
            </span>
            <span className="text-[10px] text-purple-300/70 font-mono tracking-widest uppercase">
              Adaptive Intelligence Platform
            </span>
          </div>
        </Link>

        {/* Top Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 rounded-xl bg-slate-950/60 p-1 border border-purple-500/20">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-4 py-2 text-xs font-mono tracking-wider transition-all rounded-lg ${
                  isActive
                    ? "text-slate-100 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-500/30 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Online Badge */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wider uppercase">SYSTEM ONLINE // 12ms</span>
          </div>

          <Link
            href="/interview"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-sans text-xs font-semibold tracking-wide shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center space-x-1.5"
          >
            <span>Launch</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
