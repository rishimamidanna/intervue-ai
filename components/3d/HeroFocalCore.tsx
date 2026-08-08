"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, MeshStandardMaterial } from "three";
import { FloatingObject } from "./FloatingObject";

/**
 * HeroFocalCore component for INTERVUE AI.
 * Scaled-down core sphere positioned at [0.8, -0.2, -0.4] with ultra-thin orbital paths.
 */
export function HeroFocalCore() {
  const coreRef = useRef<Group>(null);
  const ring1Ref = useRef<Group>(null);
  const ring2Ref = useRef<Group>(null);
  const innerMatRef = useRef<MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (coreRef.current) {
      coreRef.current.rotation.y += 0.06 * delta;
      coreRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;

      const breathScale = 1 + Math.sin(time * 0.8) * 0.025;
      coreRef.current.scale.setScalar(breathScale);
    }
    if (innerMatRef.current) {
      innerMatRef.current.emissiveIntensity = 1.6 + Math.sin(time * 0.8) * 0.4;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += 0.05 * delta;
      ring1Ref.current.rotation.x += 0.03 * delta;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.04 * delta;
      ring2Ref.current.rotation.y -= 0.03 * delta;
    }
  });

  return (
    <group name="hero-focal-core" position={[0.8, -0.2, -0.4]}>
      {/* Floating Central Core Sphere (Scaled down ~38%) */}
      <FloatingObject floatSpeed={0.35} floatAmplitude={0.05} rotationSpeed={[0.02, 0.04, 0.015]}>
        <group ref={coreRef}>
          {/* Inner Glowing Core */}
          <mesh>
            <icosahedronGeometry args={[0.46, 3]} />
            <meshStandardMaterial
              ref={innerMatRef}
              color="#1e1b4b"
              emissive="#7c3aed"
              emissiveIntensity={1.8}
              roughness={0.15}
              metalness={0.85}
            />
          </mesh>

          {/* Outer Holographic Glass Wireframe Shell */}
          <mesh scale={[1.15, 1.15, 1.15]}>
            <icosahedronGeometry args={[0.46, 1]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              wireframe
              transparent
              opacity={0.6}
              emissive="#38bdf8"
              emissiveIntensity={1.4}
            />
          </mesh>
        </group>
      </FloatingObject>

      {/* Ultra-Thin Orbital Purple Path */}
      <group ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.88, 0.005, 16, 100]} />
          <meshStandardMaterial
            color="#1e1b4b"
            emissive="#8b5cf6"
            emissiveIntensity={1.3}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Ultra-Thin Orbital Cyan Path */}
      <group ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[1.08, 0.004, 16, 100]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#38bdf8"
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
    </group>
  );
}
