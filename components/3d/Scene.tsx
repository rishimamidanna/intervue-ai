"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useSyncExternalStore, type ReactNode } from "react";
import { Camera, type CameraProps } from "./Camera";

export interface SceneProps {
  /** Optional 3D elements, lights, or meshes to render inside the scene */
  children?: ReactNode;
  /** Custom perspective camera settings (only rendered if explicitly provided) */
  cameraProps?: CameraProps;
  /** Custom wrapper CSS class names for responsive sizing */
  className?: string;
  /** WebGLRenderer parameters override */
  glProps?: CanvasProps["gl"];
  /** Device pixel ratio configuration for high-DPI scaling optimization */
  dpr?: CanvasProps["dpr"];
}

function subscribe(callback: () => void) {
  callback();
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * React 19 hook to safely determine client-side mounting without setState in useEffect.
 */
function useIsMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Production-quality 3D Scene Container built on React Three Fiber.
 * Handles WebGL Canvas initialization, renderer configuration (anti-aliasing, high-performance power preference),
 * device pixel ratio optimization, and client-side SSR hydration safety.
 */
export function Scene({
  children,
  cameraProps,
  className = "w-full h-full min-h-[300px] relative",
  glProps,
  dpr = [1, 2],
}: SceneProps) {
  const mounted = useIsMounted();

  if (!mounted) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <Canvas
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          ...glProps,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {cameraProps && <Camera {...cameraProps} />}
        {children}
      </Canvas>
    </div>
  );
}
