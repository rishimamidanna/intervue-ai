"use client";

/**
 * components/dashboard/DashboardHeader.tsx
 *
 * Futuristic Floating Glass Top Navigation Bar for INTERVUE AI.
 * Strict 3-column Flexbox layout:
 * [ Logo Area (flex-shrink-0) ]  [ Navigation Links (flex-1) ]  [ Status + CTA (flex-shrink-0) ]
 *
 * Routes:
 * - Dashboard -> /dashboard
 * - Interview -> /interview
 * - History -> /history
 * - Digital Twin -> /digital-twin
 * - Knowledge Graph -> /knowledge-graph
 * - Analytics -> /analytics
 * - Reports -> /report
 * - Settings -> /settings
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export function DashboardHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Interview", href: "/interview" },
    { label: "History", href: "/history" },
    { label: "Digital Twin", href: "/digital-twin" },
    { label: "Knowledge Graph", href: "/knowledge-graph" },
    { label: "Analytics", href: "/analytics" },
    { label: "Reports", href: "/report" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-4 z-50 max-w-7xl mx-auto px-4 mb-8"
    >
      <div className="rounded-2xl bg-slate-900/70 backdrop-blur-2xl border border-purple-500/30 p-3 md:px-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 md:gap-6">
        {/* 1. Logo Area (Fixed Width / Non-shrinking) */}
        <div className="shrink-0 flex items-center">
          <Logo variant="navbar" href="/dashboard" />
        </div>

        {/* 2. Center Navigation Links (Takes Remaining Flexible Space) */}
        <div className="hidden xl:flex flex-1 items-center justify-center min-w-0 mx-2">
          <nav className="flex items-center space-x-1 rounded-xl bg-slate-950/60 p-1 border border-purple-500/20 whitespace-nowrap overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative px-2.5 py-1.5 text-[11px] font-mono tracking-wider transition-all rounded-lg shrink-0 ${
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
        </div>

        {/* 3. Right Status & CTA Action Section (Fixed / Non-shrinking) */}
        <div className="shrink-0 flex items-center space-x-2 md:space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono shadow-[0_0_12px_rgba(52,211,153,0.2)] shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase font-semibold whitespace-nowrap">AI ONLINE</span>
          </div>

          <Link
            href="/interview"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-sans text-xs font-semibold tracking-wide shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center space-x-1.5 shrink-0 whitespace-nowrap"
          >
            <span>Start Interview</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-slate-900 border border-purple-500/30 text-slate-300 hover:text-white shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden mt-2 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-purple-500/30 p-4 space-y-2 shadow-2xl overflow-hidden"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-colors ${
                    isActive
                      ? "bg-purple-600/30 text-purple-200 border border-purple-400/40 font-bold"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
