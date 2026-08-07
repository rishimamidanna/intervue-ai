/**
 * components/landing/Hero.tsx
 *
 * Landing page hero section — the first impression of INTERVUE.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 * TODO: Add Framer Motion entrance animations.
 * TODO: Integrate NeuralBackground 3D scene behind the hero text.
 */

import { StartInterview } from "./StartInterview";

export function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-screen text-center px-6"
      aria-labelledby="hero-headline"
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
      </div>

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 tracking-wider uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
        Adaptive AI Technical Interview Intelligence
      </div>

      {/* Headline */}
      <h1
        id="hero-headline"
        className="text-5xl sm:text-7xl font-bold tracking-tight text-white"
      >
        INTER
        <span className="text-violet-400">VUE</span>
      </h1>

      {/* Tagline */}
      <p className="mt-4 text-xl sm:text-2xl font-light text-neutral-400 max-w-xl">
        Every Answer Changes the Interview.
      </p>

      {/* CTA */}
      <div className="mt-10">
        <StartInterview />
      </div>

      {/* Scroll hint */}
      <p className="absolute bottom-8 text-xs text-neutral-600 tracking-widest uppercase">
        Powered by AI
      </p>
    </section>
  );
}
