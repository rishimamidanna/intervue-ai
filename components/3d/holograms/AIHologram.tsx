"use client";

import { useMemo, type ReactNode } from "react";
import { Html } from "@react-three/drei";
import { FloatingObject } from "../FloatingObject";

export interface AIHologramSubElement {
  label: string;
  badge?: string;
}

export interface AIHologramProps {
  /** Main hologram header title */
  title: string;
  /** Sub-header classification badge */
  tag?: string;
  /** List of sub-elements / capabilities */
  subElements: (string | AIHologramSubElement)[];
  /** Position [x, y, z] in 3D scene */
  position?: [number, number, number];
  /** Initial rotation [x, y, z] in radians */
  rotation?: [number, number, number];
  /** Floating animation speed multiplier */
  floatSpeed?: number;
  /** Floating amplitude height range */
  floatAmplitude?: number;
  /** Floating phase offset for desynchronization */
  floatOffset?: number;
  /** Custom icon SVG or node */
  icon?: ReactNode;
}

/**
 * 3D AI Holographic Data Projection component for INTERVUE AI.
 * Composition Reset: 60% smaller scale, 50% lower opacity/emissive brightness,
 * creating subtle background holographic data projections rather than dominant foreground panels.
 */
export function AIHologram({
  title,
  tag = "AI DATA",
  subElements,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  floatSpeed = 0.35,
  floatAmplitude = 0.06,
  floatOffset = 0,
  icon,
}: AIHologramProps) {
  const parsedSubElements = useMemo(() => {
    return subElements.map((item) => {
      if (typeof item === "string") return { label: item };
      return item;
    });
  }, [subElements]);

  return (
    <FloatingObject
      position={position}
      rotation={rotation}
      floatSpeed={floatSpeed}
      floatAmplitude={floatAmplitude}
      floatOffset={floatOffset}
      rotationSpeed={[0.015, 0, 0.015]}
    >
      <group name={`hologram-projection-${title.toLowerCase().replace(/\s+/g, "-")}`}>
        {/* Sheer Ultra-Thin Glass Projection Plane (60% smaller scale, 50% opacity) */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[1.1, 0.72, 0.01]} />
          <meshPhysicalMaterial
            color="#060710"
            roughness={0.1}
            metalness={0.9}
            transmission={0.92}
            thickness={0.2}
            transparent
            opacity={0.25}
            clearcoat={1.0}
            emissive="#7c3aed"
            emissiveIntensity={0.08}
          />
        </mesh>

        {/* Faint Wireframe Holographic Border */}
        <mesh position={[0, 0, -0.008]}>
          <boxGeometry args={[1.12, 0.74, 0.015]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.12}
            emissive="#38bdf8"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Subtle Micro Corner Projection Dots */}
        {[-0.55, 0.55].map((x) =>
          [-0.36, 0.36].map((y) => (
            <mesh key={`dot-${x}-${y}`} position={[x, y, 0.002]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>
          ))
        )}

        {/* Compact, Sheer Micro Hologram Intelligence Projection */}
        <Html
          transform
          distanceFactor={10.5}
          position={[0, 0, 0.015]}
          className="pointer-events-none select-none"
        >
          <div className="w-36 bg-slate-950/35 backdrop-blur-md border border-purple-500/20 rounded-md p-2 shadow-[0_0_10px_rgba(124,58,237,0.1)] text-left opacity-75">
            {/* Projection Header */}
            <div className="flex items-center justify-between border-b border-purple-500/15 pb-1 mb-1.5">
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-cyan-400 opacity-80" />
                <h4 className="text-[8px] font-mono font-bold tracking-wider text-purple-100 uppercase">
                  {title}
                </h4>
              </div>
              <span className="text-[6.5px] font-mono text-cyan-300/80 bg-purple-950/40 border border-purple-500/20 px-0.5 py-0.2 rounded">
                {tag}
              </span>
            </div>

            {/* Data Stream Rows */}
            <div className="space-y-0.5">
              {parsedSubElements.map((elem, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[7.5px] bg-purple-950/15 border border-purple-500/10 rounded px-1 py-0.2"
                >
                  <div className="flex items-center gap-0.5">
                    <span className="text-[7px] text-cyan-400/70 font-mono">›</span>
                    <span className="text-slate-300 font-sans font-medium">
                      {elem.label}
                    </span>
                  </div>
                  {elem.badge ? (
                    <span className="text-[6.5px] text-purple-300/70 font-mono">
                      {elem.badge}
                    </span>
                  ) : (
                    <span className="text-[6.5px] text-cyan-400/70 font-mono">
                      •
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Micro Footer Line */}
            <div className="mt-1 pt-0.5 border-t border-purple-500/10 flex items-center justify-between text-[6.5px] font-mono text-slate-400/70">
              <span className="flex items-center gap-0.5">
                {icon || <span className="w-0.5 h-0.5 rounded-full bg-purple-400 inline-block" />}
                <span>AI Core</span>
              </span>
              <span className="text-cyan-400/70">NODE</span>
            </div>
          </div>
        </Html>
      </group>
    </FloatingObject>
  );
}
