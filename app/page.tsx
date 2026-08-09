import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TechnologySection } from "@/components/landing/TechnologySection";
import { AboutSection } from "@/components/landing/AboutSection";
import { BuiltBySection } from "@/components/landing/BuiltBySection";
import { FooterSection } from "@/components/landing/FooterSection";

export const metadata: Metadata = {
  title: "INTERVUE AI — Adaptive AI Technical Interview Intelligence",
  description:
    "Adaptive AI interviews that understand candidate knowledge, evaluate reasoning, and create personalized growth paths. Built by LogicLoom.",
};

/**
 * Landing page — Cinematic 3D Entry Point & Enterprise Product Launch Page for INTERVUE AI.
 * Built by LogicLoom.
 *
 * Sections:
 * - Hero (3D Scene, Navigation, Headline, Subsystems)
 * - Features (#features)
 * - How It Works (#how-it-works)
 * - Technology (#technology)
 * - About / Vision (#about)
 * - Built By (#built-by)
 * - Footer
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */
export default function HomePage() {
  return (
    <main className="relative flex-1 flex flex-col bg-[#050508] overflow-x-hidden">
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <TechnologySection />
      <AboutSection />
      <BuiltBySection />
      <FooterSection />
    </main>
  );
}
