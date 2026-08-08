"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Vector3, MathUtils } from "three";
import type { PerspectiveCamera as PerspectiveCameraImpl } from "three";

export interface CinematicCameraProps {
  /** Base target camera position [x, y, z] */
  position?: [number, number, number];
  /** Target focus point for camera to look at [x, y, z] */
  lookAt?: [number, number, number];
  /** Field of view in degrees */
  fov?: number;
  /** Enable subtle ambient camera breathing drift */
  enableDrift?: boolean;
  /** Speed multiplier for camera drift motion */
  driftSpeed?: number;
  /** Drift displacement amplitude [x, y] */
  driftAmount?: [number, number];
  /** Smoothness dampening factor for position/focus transitions (higher = tighter, lower = smoother) */
  dampFactor?: number;
  /** Set as active default scene camera */
  makeDefault?: boolean;
}

/**
 * CinematicCamera component for INTERVUE AI.
 * Provides premium product-showcase quality camera movement including smooth breathing drift,
 * slow forward movement, and exponential dampening focus transitions without camera snapping or jitter.
 */
export function CinematicCamera({
  position = [0, 0, 6],
  lookAt = [0, 0, 0],
  fov = 50,
  enableDrift = true,
  driftSpeed = 0.4,
  driftAmount = [0.15, 0.1],
  dampFactor = 2.0,
  makeDefault = true,
}: CinematicCameraProps) {
  const cameraRef = useRef<PerspectiveCameraImpl>(null);
  const currentLookAt = useRef(new Vector3(...lookAt));

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const time = state.clock.getElapsedTime();

    // 1. Calculate subtle ambient breathing drift offsets
    const driftX = enableDrift ? Math.sin(time * driftSpeed) * driftAmount[0] : 0;
    const driftY = enableDrift ? Math.cos(time * (driftSpeed * 0.8)) * driftAmount[1] : 0;

    // Target position combining base position and ambient drift
    const targetX = position[0] + driftX;
    const targetY = position[1] + driftY;
    const targetZ = position[2];

    // 2. Exponential dampening lerp towards target position
    const lerpAlpha = 1 - Math.exp(-dampFactor * delta);
    cameraRef.current.position.x = MathUtils.lerp(cameraRef.current.position.x, targetX, lerpAlpha);
    cameraRef.current.position.y = MathUtils.lerp(cameraRef.current.position.y, targetY, lerpAlpha);
    cameraRef.current.position.z = MathUtils.lerp(cameraRef.current.position.z, targetZ, lerpAlpha);

    // 3. Exponential dampening lerp towards lookAt focus target point
    currentLookAt.current.x = MathUtils.lerp(currentLookAt.current.x, lookAt[0], lerpAlpha);
    currentLookAt.current.y = MathUtils.lerp(currentLookAt.current.y, lookAt[1], lerpAlpha);
    currentLookAt.current.z = MathUtils.lerp(currentLookAt.current.z, lookAt[2], lerpAlpha);

    cameraRef.current.lookAt(currentLookAt.current);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault={makeDefault}
      position={position}
      fov={fov}
      near={0.1}
      far={1000}
    />
  );
}
