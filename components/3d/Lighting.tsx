"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { PointLight } from "three";

export interface LightingProps {
  /** Main directional key light intensity */
  keyLightIntensity?: number;
  /** Primary purple AI glow point light intensity */
  purpleGlowIntensity?: number;
  /** Secondary cyan AI glow point light intensity */
  blueGlowIntensity?: number;
  /** Ambient light intensity */
  ambientIntensity?: number;
  /** Enable dynamic light pulsing animation */
  enablePulse?: boolean;
}

/**
 * Cinematic Lighting component for INTERVUE AI.
 * Smooth, subtle glow pulse for a luxury AI aesthetic.
 */
export function Lighting({
  keyLightIntensity = 1.8,
  purpleGlowIntensity = 3.2,
  blueGlowIntensity = 2.0,
  ambientIntensity = 0.4,
  enablePulse = true,
}: LightingProps) {
  const purpleLightRef = useRef<PointLight>(null);
  const blueLightRef = useRef<PointLight>(null);

  useFrame((state) => {
    if (!enablePulse) return;
    const time = state.clock.getElapsedTime();

    if (purpleLightRef.current) {
      // Subtle, slow breathing purple glow pulse
      purpleLightRef.current.intensity =
        purpleGlowIntensity + Math.sin(time * 0.8) * 0.4;
    }
    if (blueLightRef.current) {
      // Subtle, slow breathing cyan glow pulse out-of-phase
      blueLightRef.current.intensity =
        blueGlowIntensity + Math.cos(time * 0.6) * 0.3;
    }
  });

  return (
    <group name="cinematic-lighting">
      {/* Soft Low-Intensity Ambient Fill */}
      <ambientLight intensity={ambientIntensity} color="#1e1b4b" />

      {/* Main Soft Key Light with Shadows */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={keyLightIntensity}
        color="#f8fafc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-bias={-0.0001}
      />

      {/* Cool Blue Fill Light */}
      <directionalLight
        position={[-5, -2, -3]}
        intensity={0.6}
        color="#3b82f6"
      />

      {/* Signature Purple AI Glow Point Light */}
      <pointLight
        ref={purpleLightRef}
        position={[0, 1, 2]}
        intensity={purpleGlowIntensity}
        color="#7c3aed"
        distance={10}
        decay={2}
      />

      {/* Secondary Cyan/Blue AI Glow Accent Light */}
      <pointLight
        ref={blueLightRef}
        position={[-2, -1, 1]}
        intensity={blueGlowIntensity}
        color="#38bdf8"
        distance={8}
        decay={2}
      />

      {/* Deep Rim Light from behind */}
      <directionalLight
        position={[0, 4, -8]}
        intensity={0.8}
        color="#8b5cf6"
      />
    </group>
  );
}
