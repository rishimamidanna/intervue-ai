"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, MeshStandardMaterial } from "three";
import { FloatingObject } from "./FloatingObject";

/**
 * HeroFocalCore component for INTERVUE AI.
 * Premium slow cinematic motion for luxury AI aesthetic.
 */
export function HeroFocalCore() {
  const coreRef = useRef<Group>(null);
  const ring1Ref = useRef<Group>(null);
  const ring2Ref = useRef<Group>(null);
  const innerMatRef = useRef<MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (coreRef.current) {
      // Slow, elegant rotation for central core
      coreRef.current.rotation.y += 0.15 * delta;
      coreRef.current.rotation.x = Math.sin(time * 0.4) * 0.08;
    }
    if (innerMatRef.current) {
      // Gentle, subtle breathing emissive pulse
      innerMatRef.current.emissiveIntensity = 1.2 + Math.sin(time * 0.8) * 0.4;
    }
    if (ring1Ref.current) {
      // Slow holographic precession for primary orbital ring
      ring1Ref.current.rotation.z += 0.12 * delta;
      ring1Ref.current.rotation.x += 0.08 * delta;
    }
    if (ring2Ref.current) {
      // Counter-rotating cyan orbital accent ring
      ring2Ref.current.rotation.z -= 0.1 * delta;
      ring2Ref.current.rotation.y -= 0.07 * delta;
    }
  });

  return (
    <group name="hero-focal-core" position={[0, 0.2, -0.5]}>
      {/* Floating Central Core Sphere with subtle floating motion */}
      <FloatingObject floatSpeed={0.6} floatAmplitude={0.12} rotationSpeed={[0.08, 0.15, 0.05]}>
        <group ref={coreRef}>
          {/* Inner Glowing Core */}
          <mesh>
            <icosahedronGeometry args={[0.95, 2]} />
            <meshStandardMaterial
              ref={innerMatRef}
              color="#1e1b4b"
              emissive="#7c3aed"
              emissiveIntensity={1.4}
              roughness={0.15}
              metalness={0.85}
            />
          </mesh>

          {/* Outer Holographic Glass Wireframe Shell */}
          <mesh scale={[1.2, 1.2, 1.2]}>
            <icosahedronGeometry args={[0.95, 1]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              wireframe
              transparent
              opacity={0.65}
              emissive="#38bdf8"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      </FloatingObject>

      {/* Primary Orbital Titanium Ring */}
      <group ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.1, 0.035, 16, 100]} />
          <meshStandardMaterial
            color="#1e1b4b"
            emissive="#8b5cf6"
            emissiveIntensity={0.9}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Secondary Cyan Glow Orbital Ring */}
      <group ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[2.6, 0.025, 16, 100]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={1.1}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
}
