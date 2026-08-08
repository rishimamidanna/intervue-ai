"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, QuadraticBezierCurve3, Group, Mesh, MathUtils } from "three";

export interface NetworkTarget {
  id: string;
  position: [number, number, number];
  color?: string;
}

export interface NeuralNetworkProps {
  /** Core origin position [x, y, z] */
  origin?: [number, number, number];
  /** Targets array */
  targets?: NetworkTarget[];
  /** Flowing particle speed multiplier */
  pulseSpeed?: number;
}

const DEFAULT_TARGETS: NetworkTarget[] = [
  { id: "adaptive", position: [0, 2.1, -0.8], color: "#c084fc" },
  { id: "rag", position: [-3.2, -0.4, 0.1], color: "#38bdf8" },
  { id: "digital-twin", position: [2.8, 0.4, 0.1], color: "#38bdf8" },
  { id: "reflection", position: [0.8, -1.5, 0.2], color: "#a78bfa" },
];

/**
 * 3D Neural Network component for INTERVUE AI.
 * Handles timed entrance sequence (1.0s - 1.5s) for smooth neural line & particle reveal.
 */
export function NeuralNetwork({
  origin = [0, 0.1, -0.4],
  targets = DEFAULT_TARGETS,
  pulseSpeed = 0.22,
}: NeuralNetworkProps) {
  const networkGroupRef = useRef<Group>(null);
  const pulseGroupRef = useRef<Group>(null);

  // Generate 3D Bezier curves for neural pathways
  const pathways = useMemo(() => {
    const start = new Vector3(...origin);

    return targets.map((t) => {
      const end = new Vector3(...t.position);

      // Compute elevated control point
      const mid = new Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);
      mid.y += 0.3;
      mid.z += 0.15;

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

    // 1.0s - 1.5s Entrance Sequence
    const entranceProgress = MathUtils.clamp((time - 1.0) / 0.5, 0, 1);
    const entranceScale = 1 - Math.pow(1 - entranceProgress, 3);

    if (networkGroupRef.current) {
      networkGroupRef.current.scale.setScalar(entranceScale);
    }

    pathways.forEach((path, pathIdx) => {
      // Update 3 pulse particles per pathway
      for (let p = 0; p < 3; p++) {
        const meshIdx = pathIdx * 3 + p;
        const mesh = pulseMeshRefs.current[meshIdx];
        if (!mesh) continue;

        const offset = p / 3;
        const t = (time * pulseSpeed + offset) % 1.0;
        const point = path.curve.getPoint(t);
        mesh.position.copy(point);

        // Scale pulse along path
        const scale = (0.035 + Math.sin(t * Math.PI) * 0.025) * entranceProgress;
        mesh.scale.setScalar(scale / 0.035);
      }
    });
  });

  return (
    <group ref={networkGroupRef} name="neural-network">
      {pathways.map((path) => (
        <group key={`pathway-${path.id}`}>
          {/* Glowing Primary Tube Line */}
          <mesh>
            <tubeGeometry args={[path.curve, 40, 0.01, 8, false]} />
            <meshBasicMaterial
              color={path.color}
              transparent
              opacity={0.45}
            />
          </mesh>

          {/* Outer Soft Ambient Glow */}
          <mesh>
            <tubeGeometry args={[path.curve, 24, 0.025, 8, false]} />
            <meshBasicMaterial
              color={path.color}
              transparent
              opacity={0.15}
            />
          </mesh>
        </group>
      ))}

      {/* Animated Flowing Data Pulse Particles */}
      <group ref={pulseGroupRef}>
        {pathways.map((path, pathIdx) =>
          [0, 1, 2].map((p) => {
            const meshIdx = pathIdx * 3 + p;
            return (
              <mesh
                key={`pulse-${path.id}-${p}`}
                ref={(el) => {
                  pulseMeshRefs.current[meshIdx] = el;
                }}
              >
                <icosahedronGeometry args={[0.035, 1]} />
                <meshBasicMaterial color={path.color} />
              </mesh>
            );
          })
        )}
      </group>
    </group>
  );
}
