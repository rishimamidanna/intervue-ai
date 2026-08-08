"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Vector3Tuple } from "three";

export interface FloatingObjectProps {
  /** 3D object mesh or group to animate */
  children?: ReactNode;
  /** Base position [x, y, z] in 3D depth space */
  position?: Vector3Tuple;
  /** Initial rotation [x, y, z] in radians */
  rotation?: Vector3Tuple;
  /** Float frequency speed (lower = slower, more cinematic breathing) */
  floatSpeed?: number;
  /** Float amplitude height range */
  floatAmplitude?: number;
  /** Continuous rotation speed per axis [x, y, z] in radians/sec */
  rotationSpeed?: Vector3Tuple;
  /** Phase offset in radians to desynchronize multiple floating objects */
  floatOffset?: number;
}

/**
 * Reusable FloatingObject component for INTERVUE AI.
 * Implements frame-based smooth interpolation (`useFrame`) to apply slow, cinematic floating motion
 * and continuous subtle rotation to any nested 3D mesh or object group.
 */
export function FloatingObject({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  floatSpeed = 0.8,
  floatAmplitude = 0.15,
  rotationSpeed = [0.1, 0.15, 0.05],
  floatOffset = 0,
}: FloatingObjectProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const elapsedTime = state.clock.getElapsedTime() + floatOffset;

    // Smooth sinusoidal floating motion on Y-axis
    const floatY = Math.sin(elapsedTime * floatSpeed) * floatAmplitude;
    groupRef.current.position.y = position[1] + floatY;

    // Subtle organic drift on X-axis (harmonic at half frequency)
    const floatX = Math.cos(elapsedTime * (floatSpeed * 0.5)) * (floatAmplitude * 0.3);
    groupRef.current.position.x = position[0] + floatX;

    // Continuous smooth rotation per axis
    groupRef.current.rotation.x += rotationSpeed[0] * delta;
    groupRef.current.rotation.y += rotationSpeed[1] * delta;
    groupRef.current.rotation.z += rotationSpeed[2] * delta;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      name="floating-object-container"
    >
      {children ? (
        children
      ) : (
        /* Default titanium glass geometric crystal fallback */
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[0.8, 0]} />
          <meshPhysicalMaterial
            color="#10121e"
            roughness={0.15}
            metalness={0.85}
            transmission={0.4}
            thickness={0.5}
            emissive="#7c3aed"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}
