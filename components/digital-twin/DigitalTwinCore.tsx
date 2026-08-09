"use client";

/**
 * components/digital-twin/DigitalTwinCore.tsx
 *
 * Central 3D Knowledge Twin Core Component.
 * Uses React Three Fiber to render a glowing AI brain sphere, rotating neural network,
 * floating particle field, and dynamic 3D skill node spheres scaling with mastery level.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { Scene } from "../3d/Scene";
import { Lighting } from "../3d/Lighting";
import { Particles } from "../3d/Particles";
import { NeuralConnections } from "../3d/NeuralConnections";

interface SkillNode3D {
  name: string;
  position: [number, number, number];
  mastery: number; // 0 to 100
}

interface DigitalTwinCoreProps {
  skills?: SkillNode3D[];
}

const DEFAULT_3D_SKILLS: SkillNode3D[] = [
  { name: "RAG Architecture", position: [2.2, 0.6, 0.2], mastery: 95 },
  { name: "Vector Search", position: [-2.2, -0.4, 0.3], mastery: 88 },
  { name: "AI Agents", position: [0.5, 2.1, -0.5], mastery: 90 },
  { name: "BM25 Ranking", position: [-0.5, -2.1, 0.4], mastery: 75 },
  { name: "IVF Indexing", position: [1.8, -1.2, -0.6], mastery: 45 },
];

/**
 * 3D Holographic AI Twin Brain with Dynamic 3D Skill Spheres
 */
function HolographicTwinBrain({ skills = DEFAULT_3D_SKILLS }: { skills?: SkillNode3D[] }) {
  const coreRef = useRef<Mesh>(null!);
  const ring1Ref = useRef<Group>(null!);
  const ring2Ref = useRef<Group>(null!);
  const orbitGroupRef = useRef<Group>(null!);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      coreRef.current.rotation.x += delta * 0.2;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5;
      ring1Ref.current.rotation.x += delta * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.4;
      ring2Ref.current.rotation.y += delta * 0.6;
    }
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y = time * 0.4;
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={0.7} floatIntensity={0.9}>
      {/* Central Distorted Living AI Core */}
      <Sphere ref={coreRef} args={[1.3, 64, 64]}>
        <MeshDistortMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.85}
          distort={0.38}
          speed={3.2}
          roughness={0.15}
          metalness={0.85}
        />
      </Sphere>

      {/* Inner Energy Core Wireframe */}
      <Sphere args={[0.75, 32, 32]}>
        <meshBasicMaterial color="#c084fc" wireframe />
      </Sphere>

      {/* Holographic Outer Ring 1 */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
        </mesh>
      </group>

      {/* Holographic Outer Ring 2 */}
      <group ref={ring2Ref}>
        <mesh rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
          <torusGeometry args={[2.7, 0.015, 16, 100]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Dynamic 3D Skill Spheres Scaling with Mastery Level */}
      <group ref={orbitGroupRef}>
        {skills.map((s, idx) => {
          const isHigh = s.mastery >= 70;
          const isMed = s.mastery >= 50 && s.mastery < 70;
          const size = isHigh ? 0.16 : isMed ? 0.12 : 0.09;
          const color = isHigh ? "#38bdf8" : isMed ? "#c084fc" : "#fbbf24";

          return (
            <mesh key={idx} position={s.position}>
              <sphereGeometry args={[size, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

export function DigitalTwinCore({ skills }: DigitalTwinCoreProps) {
  return (
    <div className="relative w-full h-[460px] rounded-3xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-2xl p-4 overflow-hidden shadow-[0_0_60px_rgba(56,189,248,0.18)] flex flex-col justify-between group">
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wider font-mono uppercase">
              Digital Twin Topology
            </h2>
            <p className="text-xs text-cyan-300/80 font-mono">
              3D Vector Skill Neural Model
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono tracking-widest uppercase shadow-lg">
          Live Vector Core
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="w-full h-full">
        <Scene className="w-full h-full min-h-[380px]">
          <Lighting keyLightIntensity={2.0} purpleGlowIntensity={3.5} />
          <Particles count={180} color="#38bdf8" size={0.035} />
          <NeuralConnections origin={[0, 0, 0]} pulseSpeed={0.28} />
          <HolographicTwinBrain skills={skills} />
        </Scene>
      </div>

      {/* Bottom Status Bar Overlay */}
      <div className="absolute bottom-4 left-6 right-6 z-10 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-cyan-500/20 pt-3 pointer-events-none">
        <span className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>VECTOR TWIN: ACTIVE</span>
        </span>
        <span>LATENCY: 12ms</span>
        <span className="text-cyan-400">FPS: 60</span>
      </div>
    </div>
  );
}
