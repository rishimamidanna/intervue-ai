"use client";

/**
 * components/landing/HologramIcons.tsx
 *
 * 9.5/10 $100M AI Startup Holographic Glass Module Icons.
 * Apple Vision Pro x NVIDIA AI x OpenAI Design Language.
 *
 * Modules:
 * 1. AdaptiveDifficultyIcon  (AI Calibration Meter with Dynamic Level Adjustment Stream)
 * 2. KnowledgeRetrievalIcon (3D Neural Search Cube: Query -> Vector Search -> Retrieved Knowledge)
 * 3. DigitalTwinIcon         (3D Holographic Digital Memory Core with Synapsed Synchronization)
 * 4. SelfReflectionIcon      (AI Feedback Loop Mirror: Answer Analysis -> Evaluation -> Improvement)
 *
 * Owner: Member 1 (Frontend / UI)
 */

import React from "react";
import { motion } from "framer-motion";

export function AdaptiveDifficultyIcon() {
  return (
    <div className="relative flex items-center justify-center w-7 h-7 select-none">
      {/* Soft Inner Neon Glow Core */}
      <div className="absolute inset-0 bg-purple-500/35 rounded-full blur-md animate-pulse" />

      <svg className="w-6 h-6 text-purple-300 relative z-10 drop-shadow-[0_0_12px_rgba(192,132,252,0.9)]" viewBox="0 0 24 24" fill="none">
        {/* Layered Calibration Graph Bars */}
        <rect x="2.5" y="14" width="3.5" height="7" rx="1" fill="url(#diffBar1)" />
        <rect x="8" y="10" width="3.5" height="11" rx="1" fill="url(#diffBar2)" />
        <rect x="13.5" y="6" width="3.5" height="15" rx="1" fill="url(#diffBar3)" />
        <rect x="19" y="2" width="3.5" height="19" rx="1" fill="url(#diffBar4)" />

        {/* Dynamic Calibration Curve & Pulse Particle */}
        <path
          d="M4.25 13.5L9.75 9.5L15.25 5.5L20.75 1.5"
          stroke="#f0abfc"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="3 2"
        />
        <circle cx="20.75" cy="1.5" r="2.5" fill="#e879f9" className="animate-ping" />
        <circle cx="20.75" cy="1.5" r="1.5" fill="#ffffff" />

        <defs>
          <linearGradient id="diffBar1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#581c87" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="diffBar2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="diffBar3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="diffBar4" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function KnowledgeRetrievalIcon() {
  return (
    <div className="relative flex items-center justify-center w-7 h-7 select-none">
      {/* Soft Inner Neon Glow Core */}
      <div className="absolute inset-0 bg-cyan-500/35 rounded-full blur-md animate-pulse" />

      <svg className="w-6 h-6 text-cyan-300 relative z-10 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" viewBox="0 0 24 24" fill="none">
        {/* 3D Neural Search Cube Topography */}
        <path d="M3 8L12 3L21 8L12 13L3 8Z" stroke="url(#ragMesh)" strokeWidth="1.5" fill="url(#ragFill)" fillOpacity="0.3" />
        <path d="M3 16L12 21L21 16" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.6" />
        <path d="M12 13V21" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" />

        {/* Neural Query -> Vector Search -> Knowledge Particles */}
        <circle cx="3" cy="8" r="1.8" fill="#38bdf8" />
        <circle cx="12" cy="3" r="1.8" fill="#a5f3fc" />
        <circle cx="21" cy="8" r="1.8" fill="#38bdf8" />

        {/* Central Vector Retrieval Core Intersection */}
        <circle cx="12" cy="13" r="3" fill="#22d3ee" className="animate-ping" />
        <circle cx="12" cy="13" r="1.6" fill="#ffffff" />

        {/* Laser RAG Retrieval Stream Line */}
        <path d="M7.5 5.5L16.5 10.5" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />

        <defs>
          <linearGradient id="ragMesh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="ragFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function DigitalTwinIcon() {
  return (
    <div className="relative flex items-center justify-center w-7 h-7 select-none">
      {/* Soft Inner Neon Glow Core */}
      <div className="absolute inset-0 bg-purple-500/35 rounded-full blur-md animate-pulse" />

      <svg className="w-6 h-6 text-purple-300 relative z-10 drop-shadow-[0_0_12px_rgba(232,121,249,0.9)]" viewBox="0 0 24 24" fill="none">
        {/* 3D Digital Memory Network Halo Ring */}
        <circle cx="12" cy="12" r="9.5" stroke="url(#memRing)" strokeWidth="1.5" strokeDasharray="4 2" />

        {/* Candidate Intelligence Profile Silhouette */}
        <circle cx="12" cy="7.5" r="3.2" stroke="#f0abfc" strokeWidth="1.8" fill="url(#memFill)" fillOpacity="0.45" />
        <path
          d="M5.5 19.5C5.5 15.8 8.4 13.5 12 13.5C15.6 13.5 18.5 15.8 18.5 19.5"
          stroke="#c084fc"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Memory Network Node Synapses */}
        <circle cx="8.5" cy="7.5" r="1.2" fill="#38bdf8" />
        <circle cx="15.5" cy="7.5" r="1.2" fill="#38bdf8" />
        <circle cx="12" cy="13.5" r="2.2" fill="#e879f9" className="animate-pulse" />

        <defs>
          <linearGradient id="memRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="memFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function SelfReflectionIcon() {
  return (
    <div className="relative flex items-center justify-center w-7 h-7 select-none">
      {/* Soft Inner Neon Glow Core */}
      <div className="absolute inset-0 bg-cyan-500/35 rounded-full blur-md animate-pulse" />

      <svg className="w-6 h-6 text-cyan-300 relative z-10 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" viewBox="0 0 24 24" fill="none">
        {/* Circular Feedback Evaluation Layers: Analysis -> Eval -> Improvement */}
        <path
          d="M12 3.5V0.5L7.5 4.5L12 8.5V5.5C15.87 5.5 19 8.63 19 12.5C19 13.62 18.73 14.68 18.25 15.6"
          stroke="#38bdf8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12 20.5V23.5L16.5 19.5L12 15.5V18.5C8.13 18.5 5 15.37 5 11.5C5 10.38 5.27 9.32 5.75 8.4"
          stroke="#c084fc"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* AI Brain Feedback Reflection Core */}
        <circle cx="12" cy="12" r="3.2" fill="url(#reflectGrad)" />
        <circle cx="12" cy="12" r="1.6" fill="#ffffff" className="animate-ping" />

        <defs>
          <linearGradient id="reflectGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
