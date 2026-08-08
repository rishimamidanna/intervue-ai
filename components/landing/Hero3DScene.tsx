"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const ambientParticles = [
  { left: "35%", top: "24%", size: 2, delay: 0.2, duration: 6.8 },
  { left: "41%", top: "40%", size: 3, delay: 1.4, duration: 7.6 },
  { left: "46%", top: "69%", size: 2, delay: 0.8, duration: 6.2 },
  { left: "51%", top: "19%", size: 2, delay: 2.1, duration: 8.1 },
  { left: "55%", top: "58%", size: 3, delay: 0.4, duration: 7.2 },
  { left: "60%", top: "31%", size: 2, delay: 1.8, duration: 6.6 },
  { left: "64%", top: "76%", size: 2, delay: 2.6, duration: 8.4 },
  { left: "69%", top: "46%", size: 3, delay: 1.1, duration: 7.8 },
] as const;

const holographicScanOrbits = [
  {
    id: "equatorial-scan",
    d: "M88 384 C164 316 420 316 500 384 C420 452 164 452 88 384 Z",
    color: "#8b5cf6",
    duration: 10.5,
    pulseDuration: 5.2,
    delay: 0,
    rock: 1.6,
    rockDuration: 7.2,
    origin: "294px 384px",
  },
  {
    id: "violet-meridian",
    d: "M207 190 C123 304 155 500 330 584 C470 516 493 326 405 205 C350 132 266 132 207 190 Z",
    color: "#7c3aed",
    duration: 12,
    pulseDuration: 5.9,
    delay: 0.8,
    rock: 1.2,
    rockDuration: 8.4,
    origin: "306px 376px",
  },
  {
    id: "cyan-meridian",
    d: "M389 176 C479 289 457 481 302 592 C157 501 117 327 207 207 C255 145 337 133 389 176 Z",
    color: "#38bdf8",
    duration: 13.5,
    pulseDuration: 6.6,
    delay: 1.6,
    rock: 1.4,
    rockDuration: 9.6,
    origin: "300px 378px",
  },
] as const;

const holographicHudNodes = [
  { id: "left-shoulder", left: "29%", top: "39%", size: 34, color: "#8b5cf6", delay: 0.4, strength: 0.88 },
  { id: "right-shoulder", left: "79%", top: "39%", size: 32, color: "#38bdf8", delay: 1.4, strength: 0.88 },
  { id: "above", left: "61%", top: "19%", size: 30, color: "#a78bfa", delay: 2.2, strength: 0.78 },
  { id: "behind", left: "45%", top: "54%", size: 36, color: "#818cf8", delay: 0.9, strength: 0.55 },
  { id: "platform", left: "52%", top: "77%", size: 30, color: "#60a5fa", delay: 1.8, strength: 0.74 },
] as const;

const holographicConnections = [
  { id: "above-left", d: "M351 144 C300 186 238 236 167 296", color: "#8b5cf6", delay: 0.1, duration: 4.6 },
  { id: "above-right", d: "M351 144 C392 190 424 242 455 296", color: "#38bdf8", delay: 0.65, duration: 5 },
  { id: "left-behind", d: "M167 296 C196 338 226 382 259 410", color: "#a78bfa", delay: 1.15, duration: 4.3 },
  { id: "right-behind", d: "M455 296 C392 334 328 382 259 410", color: "#60a5fa", delay: 0.35, duration: 4.8 },
  { id: "behind-platform", d: "M259 410 C270 470 286 530 300 585", color: "#818cf8", delay: 0.9, duration: 5.4 },
] as const;

function HolographicIntelligenceField({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <div className="absolute inset-0 overflow-visible">
      <motion.svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 576 760"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full overflow-visible"
        style={{ mixBlendMode: "screen" }}
        initial={false}
        animate={
          reducedMotion
            ? { opacity: 0.72 }
            : { opacity: [0.74, 0.86, 0.74] }
        }
        transition={{ duration: 5.5, repeat: reducedMotion ? 0 : Infinity, ease: [0.45, 0, 0.55, 1] }}
      >
        <defs>
          <filter id="holographic-soft-bloom" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="holographic-scan-bloom" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="0.85" result="scanBlur" />
            <feMerge>
              <feMergeNode in="scanBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <mask id="holographic-behind-robot" maskUnits="userSpaceOnUse" x="0" y="0" width="576" height="760">
            <rect width="576" height="760" fill="white" />
            <ellipse cx="334" cy="382" rx="108" ry="216" fill="black" />
            <rect x="166" y="438" width="352" height="128" rx="64" fill="#171717" />
          </mask>
        </defs>

        <g
          mask="url(#holographic-behind-robot)"
          style={{ filter: "brightness(0.82)", opacity: 0.9 }}
        >
          {holographicScanOrbits.map((orbit) => (
            <motion.g
              key={orbit.id}
              data-holographic-orbit={orbit.id}
              style={{ transformOrigin: orbit.origin }}
              animate={reducedMotion ? undefined : { rotate: [-orbit.rock, orbit.rock, -orbit.rock] }}
              transition={{ duration: orbit.rockDuration, repeat: reducedMotion ? 0 : Infinity, ease: [0.45, 0, 0.55, 1] }}
            >
              <path
                d={orbit.d}
                fill="none"
                stroke={orbit.color}
                strokeWidth="0.7"
                strokeOpacity="0.24"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={orbit.d}
                pathLength={100}
                fill="none"
                stroke={orbit.color}
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="13 87"
                strokeOpacity={reducedMotion ? 0 : 0.56}
                filter="url(#holographic-scan-bloom)"
                vectorEffect="non-scaling-stroke"
                animate={reducedMotion ? undefined : { strokeDashoffset: [0, -100] }}
                transition={{ duration: orbit.duration, delay: orbit.delay, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d={orbit.d}
                pathLength={100}
                fill="none"
                stroke={orbit.color}
                strokeWidth="1.15"
                strokeLinecap="round"
                strokeDasharray="0.22 99.78"
                strokeOpacity={reducedMotion ? 0 : 0.72}
                filter="url(#holographic-scan-bloom)"
                vectorEffect="non-scaling-stroke"
                animate={reducedMotion ? undefined : { strokeDashoffset: [0, -100] }}
                transition={{ duration: orbit.pulseDuration, delay: orbit.delay + 0.25, repeat: Infinity, ease: "linear" }}
              />
            </motion.g>
          ))}
        </g>

        <g
          mask="url(#holographic-behind-robot)"
          style={{ filter: "brightness(0.76)", opacity: 0.84 }}
        >
          {holographicConnections.map((connection) => (
            <g key={connection.id} data-holographic-connection={connection.id}>
              <path
                d={connection.d}
                fill="none"
                stroke={connection.color}
                strokeWidth="0.65"
                strokeOpacity="0.22"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={connection.d}
                pathLength={100}
                fill="none"
                stroke={connection.color}
                strokeWidth="1.05"
                strokeLinecap="round"
                strokeDasharray="0.35 99.65"
                strokeOpacity={reducedMotion ? 0 : 0.54}
                filter="url(#holographic-soft-bloom)"
                vectorEffect="non-scaling-stroke"
                animate={reducedMotion ? undefined : { strokeDashoffset: [0, -100] }}
                transition={{ duration: connection.duration, delay: connection.delay, repeat: Infinity, ease: "linear" }}
              />
            </g>
          ))}
        </g>
      </motion.svg>

      {holographicHudNodes.map((node, index) => (
        <div
          key={node.id}
          data-holographic-node={node.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: node.left,
            top: node.top,
            width: node.size,
            height: node.size,
          }}
        >
          <motion.div
            className="relative h-full w-full rounded-full border bg-[#02040c]/68 backdrop-blur-lg"
            style={{
              borderColor: `${node.color}66`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 15px ${node.color}1f, 0 0 18px ${node.color}2b`,
            }}
            initial={{ opacity: 0 }}
            animate={
              reducedMotion
                ? { opacity: 0.64 * node.strength }
                : {
                    opacity: [0.54 * node.strength, 0.86 * node.strength, 0.54 * node.strength],
                    x: [0, 0.8, 0, -0.6, 0],
                    y: [0, -2, 0, 1.6, 0],
                  }
            }
            transition={{ duration: 4.4 + index * 0.25, delay: node.delay * 0.45, repeat: reducedMotion ? 0 : Infinity, ease: [0.45, 0, 0.55, 1] }}
          >
            <motion.svg
              viewBox="0 0 44 44"
              className="h-full w-full"
              animate={reducedMotion ? undefined : { rotate: [0, index % 2 ? -360 : 360] }}
              transition={{ duration: 12 + index * 0.65, repeat: reducedMotion ? 0 : Infinity, ease: "linear" }}
            >
              <circle cx="22" cy="22" r="15.5" fill="none" stroke={node.color} strokeOpacity="0.24" strokeWidth="0.8" />
              <circle
                cx="22"
                cy="22"
                r="11"
                fill="none"
                stroke={node.color}
                strokeOpacity="0.68"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeDasharray="8 7"
              />
              <path d="M22 4.5v4M39.5 22h-4M22 39.5v-4M4.5 22h4" stroke={node.color} strokeOpacity="0.6" strokeWidth="0.8" />
            </motion.svg>
            <motion.span
              className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: node.color, boxShadow: `0 0 9px 2px ${node.color}88` }}
              animate={reducedMotion ? undefined : { opacity: [0.38, 1, 0.38], scale: [0.88, 1.1, 0.88] }}
              transition={{ duration: 2.4 + index * 0.08, delay: node.delay * 0.35, repeat: reducedMotion ? 0 : Infinity, ease: [0.45, 0, 0.55, 1] }}
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/**
 * Cinematic AI interviewer centerpiece.
 *
 * The generated chamber image replaces the previous WebGL sphere and orbital
 * model. It remains a decorative background layer so the hero copy, CTA,
 * navigation, feature cards, and page grid keep their existing layout.
 */
export function Hero3DScene() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Existing near-black palette with a restrained violet/blue atmosphere. */}
      <div className="absolute inset-0 bg-[#020207]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_53%_45%,rgba(91,33,182,0.17),transparent_24%),radial-gradient(circle_at_61%_34%,rgba(37,99,235,0.10),transparent_20%)]" />

      {/* The three-column desktop composition has a clean visual lane from xl up. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985, y: 12 }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.96, scale: 1, y: 0 }
            : {
                opacity: [0.92, 0.98, 0.92],
                scale: [0.995, 1.008, 0.995],
                y: [4, 0, 4],
              }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            : {
                opacity: { duration: 7.5, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              }
        }
        className="absolute bottom-10 left-[51%] top-[4.5rem] hidden w-[clamp(26rem,32vw,36rem)] -translate-x-1/2 xl:block"
      >
        <div className="absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_82%_88%_at_55%_48%,black_58%,transparent_100%)]">
          <Image
            src="/images/ai-interviewer-hero.png"
            alt=""
            fill
            preload
            sizes="(min-width:1536px) 576px, (min-width:1280px) 32vw, 1px"
            className="object-contain object-center select-none"
          />
        </div>

        {/* Low-amplitude chest-core light breath; aligned to the rendered asset. */}
        <motion.div
          animate={
            prefersReducedMotion
              ? { opacity: 0.28 }
              : { opacity: [0.2, 0.46, 0.2], scale: [0.9, 1.08, 0.9] }
          }
          transition={{ duration: 3.8, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
          className="absolute left-[61%] top-[47%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.38),rgba(109,40,217,0.12)_42%,transparent_72%)] blur-sm"
        />

        <HolographicIntelligenceField reducedMotion={prefersReducedMotion} />
      </motion.div>

      {/* Sparse particles stay within the center lane and away from foreground cards. */}
      <div className="absolute inset-0 hidden xl:block">
        {ambientParticles.map((particle, index) => (
          <motion.span
            key={`${particle.left}-${particle.top}`}
            initial={{ opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.25 }
                : { opacity: [0.08, 0.62, 0.08], y: [7, -9, 7], x: [0, index % 2 ? 4 : -4, 0] }
            }
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: prefersReducedMotion ? 0 : Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-violet-300 shadow-[0_0_9px_2px_rgba(139,92,246,0.45)]"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
          />
        ))}
      </div>

      {/* Gentle edge falloff keeps copy and feature cards at full contrast. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#020207_0%,#020207_26%,rgba(2,2,7,0.9)_34%,transparent_44%,transparent_66%,rgba(2,2,7,0.72)_77%,#020207_91%)]" />
    </div>
  );
}
