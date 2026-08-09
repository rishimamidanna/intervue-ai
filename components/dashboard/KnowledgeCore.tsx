"use client";

/**
 * components/dashboard/KnowledgeCore.tsx
 *
 * Living 3D AI Knowledge Core Component.
 * Uses React Three Fiber to render a glowing AI brain sphere, rotating neural network,
 * floating particle field, orbiting knowledge nodes, and integrated Holographic AI Status Panel.
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

/**
 * Living 3D Holographic AI Brain Orb with Orbiting Knowledge Nodes
 */
function HolographicSphere() {
  const coreRef = useRef<Mesh>(null!);
  const ring1Ref = useRef<Group>(null!);
  const ring2Ref = useRef<Group>(null!);
  const orbitGroupRef = useRef<Group>(null!);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.45;
      coreRef.current.rotation.x += delta * 0.25;
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
      orbitGroupRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.0}>
      {/* Central Distorted Living AI Core */}
      <Sphere ref={coreRef} args={[1.25, 64, 64]}>
        <MeshDistortMaterial
          color="#a855f7"
          emissive="#7e22ce"
          emissiveIntensity={0.9}
          distort={0.4}
          speed={3.5}
          roughness={0.15}
          metalness={0.85}
        />
      </Sphere>

      {/* Inner Energy Core Wireframe */}
      <Sphere args={[0.72, 32, 32]}>
        <meshBasicMaterial color="#38bdf8" wireframe />
      </Sphere>

      {/* Holographic Outer Ring 1 */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.1, 0.02, 16, 100]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.75} />
        </mesh>
      </group>

      {/* Holographic Outer Ring 2 */}
      <group ref={ring2Ref}>
        <mesh rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
          <torusGeometry args={[2.6, 0.015, 16, 100]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Orbiting Knowledge Nodes */}
      <group ref={orbitGroupRef}>
        <mesh position={[2.2, 0.5, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[-2.2, -0.5, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#c084fc" />
        </mesh>
        <mesh position={[0, 2.2, 0.5]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#34d399" />
        </mesh>
      </group>
    </Float>
  );
}

export function KnowledgeCore() {
  return (
    <div className="relative w-full h-[480px] rounded-3xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-2xl p-4 overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.18)] flex flex-col justify-between group">
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wider font-mono uppercase">
              AI Knowledge Core
            </h2>
            <p className="text-xs text-purple-300/80 font-mono">
              3D Living Neural Topology & Real-Time Sync
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-300 text-xs font-mono tracking-widest uppercase shadow-lg">
          Live Hologram
        </div>
      </div>

      {/* Holographic AI Status Panel (Top Right Overlay) */}
      <div className="absolute top-20 right-6 z-10 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 p-3.5 space-y-2 text-xs font-mono shadow-xl hidden sm:block">
        <div className="flex items-center justify-between space-x-4 border-b border-slate-800 pb-2">
          <span className="text-slate-400 uppercase">AI CORE STATUS</span>
          <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </span>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <span className="text-slate-400">Processing Speed</span>
          <span className="text-cyan-300 font-semibold">12ms</span>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <span className="text-slate-400">Knowledge Sync</span>
          <span className="text-purple-300 font-semibold">Active</span>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <span className="text-slate-400">Reasoning Engine</span>
          <span className="text-emerald-400 font-semibold">Ready</span>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="w-full h-full">
        <Scene className="w-full h-full min-h-[400px]">
          <Lighting keyLightIntensity={2.0} purpleGlowIntensity={3.5} />
          <Particles count={180} color="#c084fc" size={0.035} />
          <NeuralConnections origin={[0, 0, 0]} pulseSpeed={0.28} />
          <HolographicSphere />
        </Scene>
      </div>

      {/* Bottom Status Bar Overlay */}
      <div className="absolute bottom-4 left-6 right-6 z-10 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-purple-500/20 pt-3 pointer-events-none">
        <span className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>NEURAL BRAIN: ACTIVE</span>
        </span>
        <span>LATENCY: 12ms</span>
        <span className="text-purple-400">FPS: 60</span>
      </div>
    </div>
  );
}
