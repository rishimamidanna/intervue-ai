"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const scanOrbits = [
  {
    id: "equatorial",
    d: "M24 350 C103 292 329 292 397 350 C329 408 103 408 24 350 Z",
    color: "#8b5cf6",
    duration: 12,
    delay: 0,
    rock: 1.8,
  },
  {
    id: "violet-meridian",
    d: "M126 96 C39 217 75 477 229 560 C360 476 382 221 292 96 C247 39 171 42 126 96 Z",
    color: "#7c3aed",
    duration: 16,
    delay: 1.2,
    rock: 1.2,
  },
  {
    id: "cyan-meridian",
    d: "M292 91 C382 215 355 470 217 562 C67 476 43 224 135 99 C177 43 251 39 292 91 Z",
    color: "#38bdf8",
    duration: 19,
    delay: 2.4,
    rock: 1.5,
  },
] as const;

const hudNodes = [
  { id: "left-shoulder", x: 72, y: 236, size: 23, color: "#8b5cf6", delay: 0.2 },
  { id: "right-shoulder", x: 356, y: 258, size: 21, color: "#38bdf8", delay: 0.9 },
  { id: "upper-scan", x: 318, y: 126, size: 17, color: "#a78bfa", delay: 1.5 },
  { id: "platform-scan", x: 98, y: 505, size: 19, color: "#60a5fa", delay: 2.1 },
] as const;

const neuralConnections = [
  { id: "upper-left", d: "M72 236 C132 188 236 132 318 126", color: "#8b5cf6", delay: 0.4 },
  { id: "upper-right", d: "M318 126 C342 164 353 207 356 258", color: "#38bdf8", delay: 1.1 },
  { id: "cross-field", d: "M72 236 C166 288 270 302 356 258", color: "#a78bfa", delay: 1.8 },
  { id: "lower-field", d: "M72 236 C54 356 64 442 98 505", color: "#60a5fa", delay: 2.5 },
] as const;

const particles = [
  { x: 48, y: 142, r: 1.2, delay: 0.1, duration: 5.4 },
  { x: 86, y: 328, r: 1.6, delay: 0.8, duration: 6.1 },
  { x: 112, y: 458, r: 1.1, delay: 1.6, duration: 5.8 },
  { x: 156, y: 185, r: 1.3, delay: 2.2, duration: 6.5 },
  { x: 298, y: 164, r: 1.2, delay: 0.5, duration: 5.7 },
  { x: 342, y: 351, r: 1.5, delay: 1.2, duration: 6.3 },
  { x: 378, y: 438, r: 1.1, delay: 2.6, duration: 5.5 },
  { x: 314, y: 524, r: 1.4, delay: 1.9, duration: 6.8 },
] as const;

export function RobotViewer() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-[460px] w-full overflow-hidden rounded-2xl border border-purple-900/30 bg-[#05020a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_60px_rgba(0,0,0,0.48)]">
      {/* Black-glass interview chamber and restrained volumetric lighting. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(124,58,237,0.2),transparent_38%),radial-gradient(ellipse_at_76%_34%,rgba(37,99,235,0.1),transparent_30%),linear-gradient(180deg,#080511_0%,#030107_100%)]" />
      <div className="pointer-events-none absolute inset-x-[9%] top-0 h-20 rounded-[50%] border-b border-violet-300/20 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18),transparent_68%)] blur-[0.5px]" />
      <div className="pointer-events-none absolute inset-y-0 left-[8%] w-px bg-gradient-to-b from-transparent via-violet-300/15 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-[8%] w-px bg-gradient-to-b from-transparent via-blue-300/10 to-transparent" />

      {/* The premium landing-page robot is reused and kept centered at a larger scale. */}
      <motion.div
        className="absolute -inset-[3%] z-10"
        initial={false}
        animate={
          prefersReducedMotion
            ? { y: 0, scale: 1 }
            : { y: [3, 0, 3], scale: [1, 1.012, 1] }
        }
        transition={{
          duration: 8,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/images/ai-interviewer-hero.png"
          alt="AI interviewer robot"
          fill
          preload
          sizes="(min-width:1536px) 420px, (min-width:1280px) 38vw, 100vw"
          className="translate-y-[4%] select-none object-cover object-[69%_43%]"
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-[15] bg-[linear-gradient(180deg,rgba(3,1,8,0.06),transparent_24%,transparent_68%,rgba(3,1,8,0.82)),radial-gradient(circle_at_52%_45%,transparent_36%,rgba(2,1,7,0.18)_74%,rgba(2,1,7,0.72)_100%)]" />

      {/* HUD paint is overlaid but masked out across the robot, so it reads behind it. */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 420 620"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      >
        <defs>
          <filter id="interview-hud-bloom" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="0.9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="interview-scan-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="22%" stopColor="#8b5cf6" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.9" />
            <stop offset="78%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <mask id="interview-robot-clearance" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="620">
            <rect width="420" height="620" fill="white" />
            <ellipse cx="232" cy="328" rx="118" ry="224" fill="black" />
            <rect x="70" y="432" width="324" height="104" rx="52" fill="#101010" />
          </mask>
        </defs>

        <g mask="url(#interview-robot-clearance)" style={{ mixBlendMode: "screen" }}>
          {scanOrbits.map((orbit) => (
            <motion.g
              key={orbit.id}
              data-interview-orbit={orbit.id}
              style={{ transformOrigin: "210px 350px" }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : { rotate: [-orbit.rock, orbit.rock, -orbit.rock] }
              }
              transition={{
                duration: orbit.duration * 0.7,
                repeat: prefersReducedMotion ? 0 : Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d={orbit.d}
                fill="none"
                stroke={orbit.color}
                strokeWidth="0.75"
                strokeOpacity="0.3"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={orbit.d}
                pathLength={100}
                fill="none"
                stroke={orbit.color}
                strokeWidth="1.15"
                strokeLinecap="round"
                strokeDasharray="11 89"
                strokeOpacity={prefersReducedMotion ? 0 : 0.66}
                filter="url(#interview-hud-bloom)"
                vectorEffect="non-scaling-stroke"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { strokeDashoffset: [0, -100] }
                }
                transition={{
                  duration: orbit.duration,
                  delay: orbit.delay,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.g>
          ))}

          {neuralConnections.map((connection) => (
            <g key={connection.id} data-interview-connection={connection.id}>
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
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="0.5 99.5"
                strokeOpacity={prefersReducedMotion ? 0 : 0.62}
                filter="url(#interview-hud-bloom)"
                vectorEffect="non-scaling-stroke"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { strokeDashoffset: [0, -100] }
                }
                transition={{
                  duration: 5.4,
                  delay: connection.delay,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </g>
          ))}

          <motion.line
            x1="34"
            x2="386"
            y1="132"
            y2="132"
            stroke="url(#interview-scan-gradient)"
            strokeWidth="1"
            strokeOpacity={prefersReducedMotion ? 0.18 : 0.5}
            vectorEffect="non-scaling-stroke"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    y1: [132, 512, 132],
                    y2: [132, 512, 132],
                    opacity: [0, 0.72, 0],
                  }
            }
            transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {hudNodes.map((node, index) => (
            <motion.g
              key={node.id}
              data-interview-hud={node.id}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: [0, index % 2 ? -360 : 360],
                      x: [0, 1.5, 0, -1, 0],
                      y: [0, -2, 0, 1.5, 0],
                    }
              }
              transition={{
                duration: 10 + index * 1.2,
                delay: node.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <circle cx={node.x} cy={node.y} r={node.size} fill="#04040b" fillOpacity="0.56" stroke={node.color} strokeOpacity="0.42" strokeWidth="0.8" />
              <circle cx={node.x} cy={node.y} r={node.size - 6} fill="none" stroke={node.color} strokeOpacity="0.7" strokeWidth="0.9" strokeDasharray="7 6" />
              <circle cx={node.x} cy={node.y} r="2" fill={node.color} filter="url(#interview-hud-bloom)" />
            </motion.g>
          ))}

          {particles.map((particle) => (
            <motion.circle
              key={`${particle.x}-${particle.y}`}
              cx={particle.x}
              cy={particle.y}
              r={particle.r}
              fill="#c084fc"
              filter="url(#interview-hud-bloom)"
              animate={
                prefersReducedMotion
                  ? { opacity: 0.32 }
                  : {
                      opacity: [0.12, 0.8, 0.12],
                      cy: [particle.y + 8, particle.y - 14, particle.y + 8],
                    }
              }
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: prefersReducedMotion ? 0 : Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </g>
      </svg>

      {/* A soft core breath reinforces the raster chest reactor without obscuring it. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[51%] top-[50%] z-[25] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(233,213,255,0.2),rgba(139,92,246,0.12)_38%,transparent_70%)] blur-sm"
        animate={
          prefersReducedMotion
            ? { opacity: 0.22 }
            : { opacity: [0.14, 0.34, 0.14], scale: [0.92, 1.08, 0.92] }
        }
        transition={{
          duration: 3.8,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-x-4 bottom-4 z-30 mx-auto max-w-[300px] rounded-2xl border border-purple-400/25 bg-[#080711]/82 px-4 py-3 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_36px_rgba(0,0,0,0.62),0_0_20px_rgba(124,58,237,0.14)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-xs font-semibold text-white">AI Interviewer</span>
          <span className="text-[10px] font-mono text-emerald-400">Online</span>
          <div className="ml-auto flex h-4 items-end gap-0.5" aria-hidden="true">
            {[10, 15, 8, 13, 6].map((height, index) => (
              <motion.span
                key={height}
                className="w-0.5 rounded-full bg-purple-300"
                style={{ height }}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { scaleY: [0.45, 1, 0.45] }
                }
                transition={{
                  duration: 0.8 + index * 0.08,
                  delay: index * 0.09,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-zinc-400">
          Continuously adapting to your responses and knowledge depth.
        </p>
      </div>
    </div>
  );
}
