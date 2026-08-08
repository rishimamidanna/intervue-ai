"use client";

/**
 * components/interview/RobotViewer.tsx
 *
 * Futuristic AI Robot Visualizer component for INTERVUE AI Command Center.
 * Renders the futuristic humanoid AI robot interviewer with metallic armor, glowing purple eyes, chest core,
 * rotating background HUD rings, floating particles, scanning laser lines, and live status overlay card.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React, { useEffect, useRef } from "react";

export function RobotViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle system setup
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedY: -(Math.random() * 0.4 + 0.1),
      opacity: Math.random() * 0.7 + 0.3,
    }));

    let rotation = 0;
    let scanY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotation += 0.005;
      scanY = (scanY + 1) % height;

      const centerX = width / 2;
      const centerY = height / 2.2;

      // 1. Ambient Volumetric Glow Behind Robot
      const ambientGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        20,
        centerX,
        centerY,
        width * 0.45
      );
      ambientGlow.addColorStop(0, "rgba(168, 85, 247, 0.25)");
      ambientGlow.addColorStop(0.5, "rgba(126, 34, 206, 0.1)");
      ambientGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Holographic Orbit Rings Behind Robot
      ctx.save();
      ctx.translate(centerX, centerY);

      // Ring 1 (Clockwise)
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.arc(0, 0, 140, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 8]);
      ctx.stroke();

      // Ring 2 (Counter Clockwise)
      ctx.rotate(-rotation * 2);
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(192, 132, 252, 0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 16]);
      ctx.stroke();

      ctx.restore();

      // 3. Floating Particles
      particles.forEach((p) => {
        p.y += p.speedY;
        if (p.y < 0) p.y = height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192, 132, 252, ${p.opacity})`;
        ctx.fill();
      });

      // 4. Vertical Holographic Scanning Line
      const scanGlow = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
      scanGlow.addColorStop(0, "rgba(168, 85, 247, 0)");
      scanGlow.addColorStop(0.5, "rgba(192, 132, 252, 0.25)");
      scanGlow.addColorStop(1, "rgba(168, 85, 247, 0)");
      ctx.fillStyle = scanGlow;
      ctx.fillRect(0, scanY - 10, width, 20);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[460px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-radial from-[#150a28]/60 via-[#0a0514]/80 to-[#05020a] border border-purple-900/30 backdrop-blur-xl">
      {/* Background Hologram Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Main Center AI Robot Illustration */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto transition-transform duration-700 hover:scale-[1.02]">
        {/* Robot Vector/SVG Graphic */}
        <div className="relative w-64 h-72 sm:w-72 sm:h-80 drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">
          <svg
            viewBox="0 0 400 450"
            className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
          >
            <defs>
              {/* Metallic Gradients */}
              <linearGradient id="metalDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#27272a" />
                <stop offset="50%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>

              <linearGradient id="metalLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#52525b" />
                <stop offset="50%" stopColor="#3f3f46" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>

              <linearGradient id="purpleNeon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d8b4fe" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7e22ce" />
              </linearGradient>

              <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="40%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              <radialGradient id="coreReactor" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#e879f9" />
                <stop offset="70%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Torso Base & Shoulders */}
            <path
              d="M 120 280 L 150 200 L 250 200 L 280 280 L 260 400 L 140 400 Z"
              fill="url(#metalDark)"
              stroke="#52525b"
              strokeWidth="2"
            />
            <path
              d="M 90 230 L 150 200 L 160 270 L 100 290 Z"
              fill="url(#metalLight)"
              stroke="#3f3f46"
              strokeWidth="1.5"
            />
            <path
              d="M 310 230 L 250 200 L 240 270 L 300 290 Z"
              fill="url(#metalLight)"
              stroke="#3f3f46"
              strokeWidth="1.5"
            />

            {/* Neck Structure */}
            <rect
              x="180"
              y="160"
              width="40"
              height="45"
              rx="4"
              fill="url(#metalDark)"
              stroke="#3f3f46"
              strokeWidth="2"
            />
            <line x1="185" y1="175" x2="215" y2="175" stroke="#a855f7" strokeWidth="2" />
            <line x1="185" y1="185" x2="215" y2="185" stroke="#a855f7" strokeWidth="2" />

            {/* Head Contour / Helmet */}
            <path
              d="M 140 120 C 140 60, 260 60, 260 120 C 260 160, 240 180, 200 180 C 160 180, 140 160, 140 120 Z"
              fill="url(#metalDark)"
              stroke="#71717a"
              strokeWidth="3"
            />

            {/* Face Visor Plate */}
            <path
              d="M 155 105 C 155 80, 245 80, 245 105 C 245 140, 230 150, 200 150 C 170 150, 155 140, 155 105 Z"
              fill="#09090b"
              stroke="#a855f7"
              strokeWidth="2"
            />

            {/* Glowing Purple Slit Eyes */}
            <ellipse cx="178" cy="112" rx="14" ry="5" fill="url(#eyeGlow)" />
            <ellipse cx="222" cy="112" rx="14" ry="5" fill="url(#eyeGlow)" />

            <ellipse cx="178" cy="112" rx="6" ry="2.5" fill="#ffffff" />
            <ellipse cx="222" cy="112" rx="6" ry="2.5" fill="#ffffff" />

            {/* Chest Energy Hexagon Core */}
            <polygon
              points="200,240 225,255 225,285 200,300 175,285 175,255"
              fill="#18181b"
              stroke="#c084fc"
              strokeWidth="3"
            />
            <polygon
              points="200,248 218,260 218,280 200,292 182,280 182,260"
              fill="url(#coreReactor)"
            />

            {/* Glowing Accent Lines */}
            <path d="M 160 215 L 180 235" stroke="#c084fc" strokeWidth="2" />
            <path d="M 240 215 L 220 235" stroke="#c084fc" strokeWidth="2" />
            <circle cx="200" cy="75" r="3" fill="#a855f7" />
          </svg>
        </div>
      </div>

      {/* AI Interviewer Live Status Card (Overlay) */}
      <div className="relative z-20 mb-4 px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-purple-500/30 backdrop-blur-xl flex items-center gap-3 max-w-sm shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-semibold text-white">AI Interviewer</span>
            <span className="text-[10px] text-emerald-400 font-mono">● Online</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Continuously adapting to your responses and knowledge depth.
          </p>
        </div>

        {/* Audio Equalizer Visual Waveform */}
        <div className="flex items-end gap-0.5 h-4 ml-auto shrink-0 px-1">
          <div className="w-1 bg-purple-400 h-full rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1 bg-violet-400 h-2/3 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1 bg-indigo-400 h-4/5 rounded-full animate-bounce [animation-delay:-0.4s]" />
          <div className="w-1 bg-purple-300 h-1/2 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
