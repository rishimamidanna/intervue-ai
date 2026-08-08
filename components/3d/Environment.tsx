"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, Points } from "three";

export interface EnvironmentProps {
  /** Enable background depth particle field */
  enableParticles?: boolean;
  /** Number of atmospheric dust particles */
  particleCount?: number;
  /** Primary background color hex */
  backgroundColor?: string;
  /** Fog density near & far bounds */
  fogBounds?: [number, number];
}

/**
 * Pure deterministic pseudo-random generator to satisfy React 19 purity rules.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Cinematic Environment component for INTERVUE AI.
 * Establishes a dark luxury environment with titanium metallic ground reflection,
 * frosted glass materials, atmospheric depth fog, and continuous floating particle dust.
 */
export function Environment({
  enableParticles = true,
  particleCount = 150,
  backgroundColor = "#050508",
  fogBounds = [4, 22],
}: EnvironmentProps) {
  const ringRef = useRef<Mesh>(null);
  const glassRef = useRef<Mesh>(null);
  const particlesRef = useRef<Points>(null);

  // Generate deterministic atmospheric dust particle positions
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (pseudoRandom(i * 3 + 1) - 0.5) * 20;
      positions[i * 3 + 1] = (pseudoRandom(i * 3 + 2) - 0.5) * 12;
      positions[i * 3 + 2] = (pseudoRandom(i * 3 + 3) - 0.5) * 15;
    }
    return positions;
  }, [particleCount]);

  // Continuous ambient background environment movement loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.08 * delta;
    }

    if (glassRef.current) {
      glassRef.current.position.y = Math.sin(time * 0.5) * 0.12;
      glassRef.current.rotation.y = -Math.PI / 8 + Math.cos(time * 0.4) * 0.04;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.025 * delta;
      particlesRef.current.position.y = Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <group name="cinematic-environment">
      {/* Background Color & Depth Fog */}
      <color attach="background" args={[backgroundColor]} />
      <fog attach="fog" args={[backgroundColor, fogBounds[0], fogBounds[1]]} />

      {/* Titanium Metallic Reflective Floor Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#090a10"
          roughness={0.25}
          metalness={0.85}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Titanium Accent Ring (Demonstrates Metallic Finish) */}
      <mesh ref={ringRef} position={[0, -1.95, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.0, 64]} />
        <meshStandardMaterial
          color="#1e1b4b"
          emissive="#7c3aed"
          emissiveIntensity={0.25}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Sample Glass Panel (Demonstrates Frosted Glass Material) */}
      <mesh ref={glassRef} position={[2, 0, -2]} rotation={[0, -Math.PI / 8, 0]} castShadow>
        <boxGeometry args={[1.6, 2.4, 0.08]} />
        <meshPhysicalMaterial
          color="#10121e"
          transparent
          opacity={0.65}
          roughness={0.15}
          metalness={0.1}
          transmission={0.85}
          ior={1.4}
          thickness={0.5}
          reflectivity={0.9}
        />
      </mesh>

      {/* Atmospheric Particle Dust Field */}
      {enableParticles && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particlePositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            color="#a78bfa"
            transparent
            opacity={0.4}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  );
}
