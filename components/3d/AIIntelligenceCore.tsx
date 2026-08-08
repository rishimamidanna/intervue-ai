"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, MeshStandardMaterial, PointLight } from "three";
import { MathUtils } from "three";
import { FloatingObject } from "./FloatingObject";
import { heroInteractionStore } from "./heroInteractionStore";

export interface AIIntelligenceCoreProps {
  /** Core position [x, y, z] in 3D scene */
  position?: [number, number, number];
}

/**
 * 3D AI Intelligence Core component for INTERVUE AI.
 * Handles timed entrance sequence (0.5s - 1.0s), core rotation, volumetric lighting,
 * and smooth CTA hover reaction (increased emissive intensity & energy pulse).
 */
export function AIIntelligenceCore({
  position = [0.4, 0.1, -0.4],
}: AIIntelligenceCoreProps) {
  const coreGroupRef = useRef<Group>(null);
  const sphereRef = useRef<Group>(null);
  const ring1Ref = useRef<Group>(null);
  const ring2Ref = useRef<Group>(null);
  const pedestalRef = useRef<Group>(null);
  const innerMatRef = useRef<MeshStandardMaterial>(null);
  const outerMatRef = useRef<MeshStandardMaterial>(null);
  const coreLightRef = useRef<PointLight>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const isCtaHovered = heroInteractionStore.getCtaHovered();

    // 1. Entrance Sequence: 0.5s - 1.0s fade & scale into position
    const entranceProgress = MathUtils.clamp((time - 0.5) / 0.5, 0, 1);
    // Smooth cubic-bezier-like easing curve: 1 - Math.pow(1 - progress, 3)
    const entranceScale = 1 - Math.pow(1 - entranceProgress, 3);

    if (coreGroupRef.current) {
      coreGroupRef.current.scale.setScalar(entranceScale);
    }

    // 2. Slow Core Rotation
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.15 * delta;
      sphereRef.current.rotation.x = Math.sin(time * 0.4) * 0.08;
    }

    // 3. CTA Hover Reaction & Subtle Energy Pulse
    const lerpAlpha = 1 - Math.exp(-4 * delta);
    const targetPulseFreq = isCtaHovered ? 2.5 : 1.2;
    const baseEmissive = isCtaHovered ? 3.6 : 1.8;
    const pulseAmplitude = isCtaHovered ? 1.0 : 0.6;
    const targetLightIntensity = isCtaHovered ? 8.0 : 4.0;

    const currentEmissiveTarget = baseEmissive + Math.sin(time * targetPulseFreq) * pulseAmplitude;

    if (innerMatRef.current) {
      innerMatRef.current.emissiveIntensity = MathUtils.lerp(
        innerMatRef.current.emissiveIntensity,
        currentEmissiveTarget,
        lerpAlpha
      );
    }

    if (outerMatRef.current) {
      const targetOuterEmissive = isCtaHovered ? 2.4 : 1.5;
      outerMatRef.current.emissiveIntensity = MathUtils.lerp(
        outerMatRef.current.emissiveIntensity,
        targetOuterEmissive,
        lerpAlpha
      );
    }

    if (coreLightRef.current) {
      coreLightRef.current.intensity = MathUtils.lerp(
        coreLightRef.current.intensity,
        targetLightIntensity,
        lerpAlpha
      );
    }

    // 4. Orbital Ring Precession
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += 0.12 * delta;
      ring1Ref.current.rotation.x += 0.08 * delta;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.1 * delta;
      ring2Ref.current.rotation.y -= 0.07 * delta;
    }

    if (pedestalRef.current) {
      pedestalRef.current.rotation.z += 0.05 * delta;
    }
  });

  return (
    <group ref={coreGroupRef} name="ai-intelligence-core" position={position}>
      <FloatingObject floatSpeed={0.5} floatAmplitude={0.1} rotationSpeed={[0.04, 0.08, 0.03]}>
        {/* Central Core Group */}
        <group ref={sphereRef}>
          {/* Inner Glowing Nucleus Sphere */}
          <mesh>
            <icosahedronGeometry args={[0.95, 3]} />
            <meshStandardMaterial
              ref={innerMatRef}
              color="#1e1b4b"
              emissive="#8b5cf6"
              emissiveIntensity={1.8}
              roughness={0.15}
              metalness={0.85}
            />
          </mesh>

          {/* Outer Holographic Cyan Glass Wireframe Shell */}
          <mesh scale={[1.2, 1.2, 1.2]}>
            <icosahedronGeometry args={[0.95, 1]} />
            <meshPhysicalMaterial
              ref={outerMatRef}
              color="#38bdf8"
              wireframe
              transparent
              opacity={0.7}
              emissive="#38bdf8"
              emissiveIntensity={1.5}
            />
          </mesh>

          {/* Volumetric Glowing Point Light inside Core */}
          <pointLight ref={coreLightRef} color="#a78bfa" intensity={4} distance={6} decay={2} />
        </group>
      </FloatingObject>

      {/* Primary Orbital Purple Titanium Ring */}
      <group ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.1, 0.035, 16, 100]} />
          <meshStandardMaterial
            color="#1e1b4b"
            emissive="#8b5cf6"
            emissiveIntensity={1.4}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Secondary Cyan Glow Accent Orbital Ring */}
      <group ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[2.6, 0.025, 16, 100]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={1.6}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Holographic Concentric Light Pedestal Disks at Base */}
      <group ref={pedestalRef} position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.8, 2.2, 64]} />
          <meshBasicMaterial
            color="#7c3aed"
            transparent
            opacity={0.3}
            side={2}
          />
        </mesh>

        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[1.8, 1.85, 64]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.7}
            side={2}
          />
        </mesh>

        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[2.3, 2.34, 64]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.5}
            side={2}
          />
        </mesh>
      </group>
    </group>
  );
}
