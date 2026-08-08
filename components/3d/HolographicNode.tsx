"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import { MathUtils } from "three";
import { FloatingObject } from "./FloatingObject";

export interface HolographicNodeProps {
  /** Node identifier */
  id: string;
  /** Main Node Title (Line 1) */
  title: string;
  /** Subtitle (Line 2) */
  subtext: string;
  /** Node position [x, y, z] in 3D scene */
  position?: [number, number, number];
  /** Floating speed multiplier */
  floatSpeed?: number;
  /** Floating height amplitude */
  floatAmplitude?: number;
  /** Phase offset for desynchronization */
  floatOffset?: number;
  /** Icon type: 'rag' | 'adaptive' | 'digital-twin' | 'reflection' */
  nodeType?: "rag" | "adaptive" | "digital-twin" | "reflection";
  /** Optional custom icon */
  icon?: ReactNode;
}

/**
 * Minimalist 3D Circular Holographic Node component for INTERVUE AI.
 * Handles timed entrance sequence (1.0s - 1.5s) for smooth node reveal.
 */
export function HolographicNode({
  title,
  subtext,
  position = [0, 0, 0],
  floatSpeed = 0.4,
  floatAmplitude = 0.08,
  floatOffset = 0,
  nodeType = "rag",
  icon,
}: HolographicNodeProps) {
  const nodeGroupRef = useRef<Group>(null);
  const pedestalRef = useRef<Group>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1.0s - 1.5s Entrance Sequence
    const entranceProgress = MathUtils.clamp((time - 1.0) / 0.5, 0, 1);
    const entranceScale = 1 - Math.pow(1 - entranceProgress, 3);

    if (nodeGroupRef.current) {
      nodeGroupRef.current.scale.setScalar(entranceScale);
    }

    if (pedestalRef.current) {
      pedestalRef.current.rotation.z += 0.2 * delta;
    }
  });

  const renderIcon = () => {
    if (icon) return icon;

    switch (nodeType) {
      case "rag":
        return (
          <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case "adaptive":
        return (
          <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case "digital-twin":
        return (
          <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "reflection":
        return (
          <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
    }
  };

  return (
    <FloatingObject
      position={position}
      floatSpeed={floatSpeed}
      floatAmplitude={floatAmplitude}
      floatOffset={floatOffset}
      rotationSpeed={[0.02, 0, 0.02]}
    >
      <group ref={nodeGroupRef} name={`holographic-node-${nodeType}`}>
        {/* 3D Glowing Circular Pedestal Base Ring under node */}
        <group ref={pedestalRef} position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.38, 0.012, 16, 32]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={1.5}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <ringGeometry args={[0.1, 0.38, 32]} />
            <meshBasicMaterial color="#7c3aed" transparent opacity={0.25} side={2} />
          </mesh>
        </group>

        {/* Camera-Facing Minimalist Circular Holographic Node with Attached 2-Line Label */}
        <Html
          transform
          distanceFactor={7.2}
          position={[0, 0, 0.02]}
          className="pointer-events-none select-none"
        >
          <div className="flex items-center gap-2">
            {/* Circular Hologram Icon Badge */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-400/40 shadow-[0_0_15px_rgba(56,189,248,0.35)] shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 animate-pulse" />
              {renderIcon()}
            </div>

            {/* Micro 2-Line Attached Holographic Label */}
            <div className="bg-slate-950/60 backdrop-blur-md border border-cyan-500/30 rounded px-2 py-1 shadow-[0_0_10px_rgba(56,189,248,0.2)] text-left whitespace-nowrap">
              <div className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase leading-none drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]">
                {title}
              </div>
              <div className="text-[8.5px] font-sans font-medium text-slate-300 leading-none mt-1">
                {subtext}
              </div>
            </div>
          </div>
        </Html>
      </group>
    </FloatingObject>
  );
}
