"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { FloatingObject } from "./FloatingObject";

/**
 * HeroFocalCore component for INTERVUE AI.
 * Renders an advanced 3D AI intelligence core surrounded by metallic orbital rings
 * and glowing concept nodes to serve as the visual focal point in the hero scene.
 */
export function HeroFocalCore() {
  const coreRef = useRef<Group>(null);
  const ring1Ref = useRef<Group>(null);
  const ring2Ref = useRef<Group>(null);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.25 * delta;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += 0.18 * delta;
      ring1Ref.current.rotation.x += 0.12 * delta;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.22 * delta;
      ring2Ref.current.rotation.y -= 0.14 * delta;
    }
  });

  return (
    <group name="hero-focal-core" position={[0, 0.2, -0.5]}>
      {/* Floating Central Core Sphere */}
      <FloatingObject floatSpeed={0.9} floatAmplitude={0.15}>
        <group ref={coreRef}>
          {/* Inner Glowing Core */}
          <mesh>
            <icosahedronGeometry args={[0.95, 2]} />
            <meshStandardMaterial
              color="#1e1b4b"
              emissive="#7c3aed"
              emissiveIntensity={1.5}
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
              opacity={0.45}
              emissive="#38bdf8"
              emissiveIntensity={0.6}
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
            emissiveIntensity={0.7}
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
            emissiveIntensity={0.9}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
}
