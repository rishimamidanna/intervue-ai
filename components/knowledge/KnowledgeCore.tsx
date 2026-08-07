"use client";

/**
 * components/knowledge/KnowledgeCore.tsx
 *
 * 3D Candidate Knowledge Core visualization.
 * Rendered with React Three Fiber — must be a Client Component.
 *
 * The Knowledge Core is the premium 3D centrepiece of INTERVUE.
 * It visually represents the Candidate Knowledge Twin as a glowing,
 * dynamic 3D structure that evolves with every answer.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 *
 * TODO: Implement the full Knowledge Core 3D scene:
 *   - Central core sphere pulsing with overall knowledge score colour
 *   - Orbiting knowledge nodes (one per topic in the KnowledgeTwin)
 *   - Node size = evidenceCount, node colour = estimatedScore
 *   - Connecting lines between related topics
 *   - Smooth animations as the twin updates
 *   - Camera orbit controls for user interaction
 *   - Bloom/glow post-processing for premium look
 *   - Consider @react-three/drei OrbitControls, Sphere, Line
 */

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { TopicKnowledge } from "@/types/interview";

interface KnowledgeCoreProps {
  /** Current state of the Candidate Knowledge Twin */
  knowledgeTwin: TopicKnowledge[];
}

function CorePlaceholder() {
  return (
    <mesh>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#7c3aed" wireframe />
    </mesh>
  );
}

export function KnowledgeCore({ knowledgeTwin }: KnowledgeCoreProps) {
  void knowledgeTwin; // TODO: use to render nodes

  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-neutral-900/50 border border-white/5">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          {/* TODO: Replace with full KnowledgeCore scene */}
          <CorePlaceholder />
        </Suspense>
      </Canvas>
    </div>
  );
}
