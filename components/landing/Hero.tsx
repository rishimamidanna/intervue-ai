"use client";

/**
 * components/landing/Hero.tsx
 *
 * Primary Landing Hero Section for INTERVUE AI.
 * Displays 3D background scene, header navigation bar, main foreground hero content,
 * and feature cards.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import { HeroHeader } from "./HeroHeader";
import { Hero3DScene } from "./Hero3DScene";
import { HeroCards } from "./HeroCards";
import { HeroContent } from "@/components/sections/HeroContent";

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#050508] z-10"
      aria-labelledby="hero-headline"
    >
      {/* 3D Background Scene with Depth & Focal Core */}
      <Hero3DScene />

      {/* Header Navigation Bar */}
      <HeroHeader />

      {/* Main Foreground Composition Grid */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Content with Typography Hierarchy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <HeroContent />
          </div>

          {/* Right Column: Glass Feature Cards */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <HeroCards />
          </div>
        </div>
      </div>
    </section>
  );
}
