"use client";

/**
 * components/ui/Logo.tsx
 *
 * Universal Reusable Logo Component for INTERVUE AI.
 * Features a purple gradient rounded square icon with "IV" letters inside,
 * bold "INTERVUE AI" typography, glowing neon accents, and responsive variants.
 *
 * Variants:
 * - "navbar"  : Compact top navigation header logo
 * - "hero"    : Landing page / primary header logo
 * - "sidebar" : Left sidebar workspace logo
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import Link from "next/link";

export interface LogoProps {
  variant?: "navbar" | "hero" | "sidebar";
  href?: string;
  className?: string;
}

export function Logo({
  variant = "navbar",
  href = "/dashboard",
  className = "",
}: LogoProps) {
  const iconSizes = {
    navbar: "w-8 h-8 rounded-lg text-xs",
    sidebar: "w-8 h-8 rounded-lg text-xs",
    hero: "w-9 h-9 rounded-xl text-sm",
  };

  const textSizes = {
    navbar: "text-base md:text-lg font-bold",
    sidebar: "text-base font-bold",
    hero: "text-xl md:text-2xl font-bold",
  };

  const logoContent = (
    <div className={`flex items-center gap-2.5 group cursor-pointer shrink-0 whitespace-nowrap ${className}`}>
      {/* Purple Gradient Rounded Square Icon with IV */}
      <div
        className={`${iconSizes[variant]} bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-800 border border-purple-400/40 flex items-center justify-center font-black tracking-widest text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-transform duration-200 shrink-0`}
      >
        IV
      </div>

      {/* INTERVUE AI Brand Text */}
      <div className={`flex items-center tracking-tight text-white font-sans whitespace-nowrap ${textSizes[variant]}`}>
        <span>INTERVUE</span>
        <span className="ml-1.5 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-extrabold">
          AI
        </span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="shrink-0">{logoContent}</Link>;
  }

  return logoContent;
}
