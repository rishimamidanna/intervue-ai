"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, QuadraticBezierCurve3, Group, Mesh } from "three";

export interface ConnectionTarget {
  id: string;
  position: [number, number, number];
  color?: string;
}

export interface NeuralConnectionsProps {
  /** Core focal origin position [x, y, z] */
  origin?: [number, number, number];
  /** Array of target positions for neural connections */
  targets?: ConnectionTarget[];
  /** Flowing particle speed multiplier */
  pulseSpeed?: number;
}

const DEFAULT_TARGETS: ConnectionTarget[] = [
  { id: "rag", position: [-4.5, 0.8, -2.2], color: "#38bdf8" },
  { id: "memory", position: [4.5, -0.4, -2.0], color: "#a78bfa" },
  { id: "adaptive", position: [0, 2.2, -2.0], color: "#c084fc" },
];

/**
 * 3D Neural Connections & Flowing Data Pulse Particles component for INTERVUE AI.
 * Renders subtle, low-opacity glowing 3D Bezier neural pathways connecting the central AI core to background hologram nodes.
 */
export function NeuralConnections({
  origin = [0, 0.2, -0.5],
  targets = DEFAULT_TARGETS,
  pulseSpeed = 0.18,
}: NeuralConnectionsProps) {
  const pulseGroupRef = useRef<Group>(null);

  // Generate 3D Bezier curves for neural pathways
  const pathways = useMemo(() => {
    const start = new Vector3(...origin);

    return targets.map((t) => {
      const end = new Vector3(...t.position);

      // Compute curved control point elevated between start and end
      const mid = new Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);
      mid.y += 0.2;

      const curve = new QuadraticBezierCurve3(start, mid, end);
      return {
        id: t.id,
        curve,
        color: t.color || "#8b5cf6",
      };
    });
  }, [origin, targets]);

  // Flowing pulse particle refs array initialization
  const pulseMeshRefs = useRef<(Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    pathways.forEach((path, pathIdx) => {
      // Update 2 micro pulse particles per pathway
      for (let p = 0; p < 2; p++) {
        const meshIdx = pathIdx * 2 + p;
        const mesh = pulseMeshRefs.current[meshIdx];
        if (!mesh) continue;

        const offset = p / 2;
        const t = (time * pulseSpeed + offset) % 1.0;
        const point = path.curve.getPoint(t);
        mesh.position.copy(point);

        // Subtle micro pulse scale
        const scale = 0.02 + Math.sin(t * Math.PI) * 0.015;
        mesh.scale.setScalar(scale / 0.02);
      }
    });
  });

  return (
    <group name="neural-connections">
      {pathways.map((path) => (
        <group key={`pathway-${path.id}`}>
          {/* Subtle Low-Opacity Neural Line */}
          <mesh>
            <tubeGeometry args={[path.curve, 28, 0.006, 6, false]} />
            <meshBasicMaterial
              color={path.color}
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Micro Flowing Data Pulse Particles */}
      <group ref={pulseGroupRef}>
        {pathways.map((path, pathIdx) =>
          [0, 1].map((p) => {
            const meshIdx = pathIdx * 2 + p;
            return (
              <mesh
                key={`pulse-${path.id}-${p}`}
                ref={(el) => {
                  pulseMeshRefs.current[meshIdx] = el;
                }}
              >
                <icosahedronGeometry args={[0.02, 1]} />
                <meshBasicMaterial color={path.color} transparent opacity={0.6} />
              </mesh>
            );
          })
        )}
      </group>
    </group>
  );
}
