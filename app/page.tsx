import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";

export const metadata: Metadata = {
  title: "INTERVUE AI — Adaptive AI Technical Interview Intelligence",
  description:
    "Adaptive AI interviews that understand, evaluate and unlock true potential. Built with advanced RAG, candidate memory and adaptive intelligence.",
};

/**
 * Landing page — Cinematic 3D Entry Point for INTERVUE AI.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */
export default function HomePage() {
  return (
    <main className="relative flex-1 flex flex-col bg-[#050508]">
      <Hero />
    </main>
  );
}
