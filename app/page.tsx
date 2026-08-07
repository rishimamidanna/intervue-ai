import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { NeuralBackground } from "@/components/landing/NeuralBackground";

export const metadata: Metadata = {
  title: "INTERVUE — Adaptive AI Technical Interview Intelligence",
  description:
    "Start your adaptive AI technical interview. Every answer changes the next question.",
};

/**
 * Landing page — the entry point for candidates.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */
export default function HomePage() {
  return (
    <main className="relative flex-1 flex flex-col">
      <NeuralBackground />
      <Hero />
    </main>
  );
}
