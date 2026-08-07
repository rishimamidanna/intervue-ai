"use client";

/**
 * components/landing/NeuralBackground.tsx
 *
 * Animated neural network background for the landing page.
 * Rendered with React Three Fiber (R3F) — Client Component.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import { Canvas } from "@react-three/fiber";
import { Suspense, useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function PlaceholderScene() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#7c3aed" wireframe />
    </mesh>
  );
}

export function NeuralBackground() {
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isClient) {
    return null;
  }

  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <PlaceholderScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
