"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Points } from "three";

export interface ParticlesProps {
  /** Total particle count for the atmospheric dust field */
  count?: number;
  /** Primary particle glow color hex */
  color?: string;
  /** Base particle size in 3D scene units */
  size?: number;
  /** Particle field bounding volume box dimensions [width, height, depth] */
  bounds?: [number, number, number];
  /** Slow rotation speed multiplier */
  speed?: number;
}

/**
 * Pure deterministic pseudo-random generator to satisfy React 19 purity rules.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Atmospheric Particle System for INTERVUE AI.
 * Renders glowing atmospheric 3D dust points using a single-draw-call buffer geometry,
 * additive color blending, size attenuation depth effects, and GPU-accelerated frame motion.
 */
export function Particles({
  count = 300,
  color = "#a78bfa",
  size = 0.06,
  bounds = [24, 16, 20],
  speed = 0.03,
}: ParticlesProps) {
  const pointsRef = useRef<Points>(null);

  // Generate deterministic particle positions once using useMemo
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const [width, height, depth] = bounds;

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (pseudoRandom(i * 3 + 101) - 0.5) * width;
      pos[i * 3 + 1] = (pseudoRandom(i * 3 + 202) - 0.5) * height;
      pos[i * 3 + 2] = (pseudoRandom(i * 3 + 303) - 0.5) * depth;
    }

    return pos;
  }, [count, bounds]);

  // GPU-accelerated frame animation: slow, smooth rotation and breathing drift
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Slow atmospheric rotation
    pointsRef.current.rotation.y += speed * delta;
    pointsRef.current.rotation.x += speed * 0.5 * delta;

    // Subtle sinusoidal wave drift for organic depth floating
    const elapsedTime = state.clock.getElapsedTime();
    pointsRef.current.position.y = Math.sin(elapsedTime * 0.4) * 0.15;
  });

  return (
    <points ref={pointsRef} name="atmospheric-particles">
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.55}
        sizeAttenuation
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
