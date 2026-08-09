"use client";

/**
 * components/interview/Sidebar.tsx
 *
 * Left Sidebar Navigation for INTERVUE AI Command Center.
 * Uses universal Logo component, Next.js App Router navigation, active route highlighting using usePathname(),
 * candidate profile, session details, and End Interview action.
 *
 * Routes Supported:
 * - Dashboard -> /dashboard
 * - Live Interview -> /interview
 * - Interview History -> /history
 * - Digital Twin -> /digital-twin
 * - Knowledge Graph -> /knowledge-graph
 * - Analytics -> /analytics
 * - Reports -> /report
 * - Settings -> /settings
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Radio,
  History,
  Cpu,
  Network,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface SidebarProps {
  onEndInterview?: () => void;
}

export function Sidebar({ onEndInterview }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { label: "Live Interview", href: "/interview", icon: Radio },
    { label: "Interview History", href: "/history", icon: History },
    { label: "Digital Twin", href: "/digital-twin", icon: Cpu },
    { label: "Knowledge Graph", href: "/knowledge-graph", icon: Network },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Reports", href: "/report", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#090612]/90 backdrop-blur-2xl border-r border-purple-900/20 flex flex-col justify-between p-4 min-h-screen text-xs select-none">
      {/* Top Brand Logo */}
      <div className="space-y-6">
        <div className="px-2 py-1">
          <Logo variant="sidebar" href="/dashboard" />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-purple-400" : "text-zinc-500"
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Cards Section */}
      <div className="space-y-3 pt-4 border-t border-purple-900/20">
        {/* Candidate Profile Card */}
        <Link href="/digital-twin" className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-purple-900/20 backdrop-blur-md hover:border-purple-500/30 transition-all cursor-pointer block">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-700 to-indigo-900 border border-purple-400/40 flex items-center justify-center font-semibold text-white text-xs shadow-inner">
              KT
            </div>
            <div>
              <div className="text-white font-medium text-xs">Knowledge Twin</div>
              <div className="text-[10px] text-zinc-400">Candidate Twin</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </Link>

        {/* Session Details Card */}
        <div className="p-3 rounded-xl bg-zinc-900/40 border border-purple-900/20 backdrop-blur-md space-y-2">
          <div className="text-[11px] font-semibold text-zinc-300 tracking-wide">
            Session Details
          </div>
          <div className="space-y-1.5 text-[10px] font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Role</span>
              <span className="text-zinc-300 font-medium">AI/ML Engineer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Experience</span>
              <span className="text-zinc-300 font-medium">3+ Years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Interview Type</span>
              <span className="text-zinc-300 font-medium">Technical</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Question Set</span>
              <span className="text-zinc-300 font-medium text-right truncate max-w-[110px]">
                RAG & Search Systems
              </span>
            </div>
          </div>
        </div>

        {/* End Interview Button */}
        {onEndInterview && (
          <button
            onClick={onEndInterview}
            className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 font-medium hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-200 text-xs shadow-[0_0_10px_rgba(239,68,68,0.1)]"
          >
            End Interview
          </button>
        )}
      </div>
    </aside>
  );
}
