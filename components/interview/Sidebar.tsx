"use client";

/**
 * components/interview/Sidebar.tsx
 *
 * Left Sidebar Navigation for INTERVUE AI Command Center.
 * Features logo, active navigation, candidate profile, session details, and End Interview action.
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import {
  LayoutGrid,
  Radio,
  MessageSquare,
  History,
  Cpu,
  Network,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  Hexagon,
} from "lucide-react";

interface SidebarProps {
  onEndInterview?: () => void;
}

export function Sidebar({ onEndInterview }: SidebarProps) {
  const navItems = [
    { label: "Dashboard", icon: LayoutGrid, active: false },
    { label: "Live Interview", icon: Radio, active: true },
    { label: "Interview", icon: MessageSquare, active: false },
    { label: "History", icon: History, active: false },
    { label: "Digital Twin", icon: Cpu, active: false },
    { label: "Knowledge Graph", icon: Network, active: false },
    { label: "Analytics", icon: BarChart3, active: false },
    { label: "Reports", icon: FileText, active: false },
    { label: "Settings", icon: Settings, active: false },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#090612]/90 backdrop-blur-2xl border-r border-purple-900/20 flex flex-col justify-between p-4 min-h-screen text-xs select-none">
      {/* Top Brand Logo */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-900 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Hexagon className="w-5 h-5 text-white fill-purple-500/30" />
            <div className="absolute w-2 h-2 bg-purple-300 rounded-full animate-ping" />
          </div>
          <div className="flex items-center tracking-tight text-base font-bold text-white font-sans">
            INTERVUE<span className="ml-1.5 text-purple-400">AI</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  item.active
                    ? "bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? "text-purple-400" : "text-zinc-500"
                  }`}
                />
                <span>{item.label}</span>
                {item.active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Cards Section */}
      <div className="space-y-3 pt-4 border-t border-purple-900/20">
        {/* Candidate Profile Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-purple-900/20 backdrop-blur-md hover:border-purple-500/30 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-700 to-indigo-900 border border-purple-400/40 flex items-center justify-center font-semibold text-white text-xs shadow-inner">
              AR
            </div>
            <div>
              <div className="text-white font-medium text-xs">Aditya R.</div>
              <div className="text-[10px] text-zinc-400">Candidate</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </div>

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
            <div className="flex justify-between">
              <span className="text-zinc-500">Time Elapsed</span>
              <span className="text-purple-300 font-medium font-mono">
                00:24:38
              </span>
            </div>
          </div>
        </div>

        {/* End Interview Button */}
        <button
          onClick={onEndInterview}
          className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 font-medium hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-200 text-xs shadow-[0_0_10px_rgba(239,68,68,0.1)]"
        >
          End Interview
        </button>
      </div>
    </aside>
  );
}
