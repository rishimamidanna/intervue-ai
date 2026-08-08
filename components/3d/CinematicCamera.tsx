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
  /** Enable ambient camera breathing drift */
  enableDrift?: boolean;
  /** Speed multiplier for camera drift motion */
  driftSpeed?: number;
  /** Drift displacement amplitude [x, y] */
  driftAmount?: [number, number];
  /** Enable mouse parallax interaction */
  enableParallax?: boolean;
  /** Parallax movement bounds [x, y] */
  parallaxAmount?: [number, number];
  /** Smoothness dampening factor for position/focus transitions */
  dampFactor?: number;
  /** Set as active default scene camera */
  makeDefault?: boolean;
}

/**
 * CinematicCamera component – smooth ambient breathing camera motion.
 */
export function CinematicCamera({
  position = [0, 0, 6],
  lookAt = [0, 0, 0],
  fov = 50,
  enableDrift = true,
  driftSpeed = 0.35,
  driftAmount = [0.15, 0.1],
  enableParallax = true,
  parallaxAmount = [0.2, 0.15],
  dampFactor = 2.5,
  makeDefault = true,
}: CinematicCameraProps) {
  const cameraRef = useRef<PerspectiveCameraImpl>(null);
  const currentLookAt = useRef(new Vector3(...lookAt));

  useFrame((state, delta) => {
    if (!cameraRef.current) return;
    const time = state.clock.getElapsedTime();

    // Subtle ambient breathing camera drift (always active)
    const driftX = enableDrift ? Math.sin(time * driftSpeed) * driftAmount[0] : 0;
    const driftY = enableDrift ? Math.cos(time * (driftSpeed * 0.8)) * driftAmount[1] : 0;

    // Smooth mouse parallax response
    const parallaxX = enableParallax ? state.pointer.x * parallaxAmount[0] : 0;
    const parallaxY = enableParallax ? state.pointer.y * parallaxAmount[1] : 0;

    const targetX = position[0] + driftX + parallaxX;
    const targetY = position[1] + driftY + parallaxY;
    const targetZ = position[2];

    const lerpAlpha = 1 - Math.exp(-dampFactor * delta);
    cameraRef.current.position.x = MathUtils.lerp(cameraRef.current.position.x, targetX, lerpAlpha);
    cameraRef.current.position.y = MathUtils.lerp(cameraRef.current.position.y, targetY, lerpAlpha);
    cameraRef.current.position.z = MathUtils.lerp(cameraRef.current.position.z, targetZ, lerpAlpha);

    const targetLookX = lookAt[0] + parallaxX * 0.3;
    const targetLookY = lookAt[1] + parallaxY * 0.3;
    const targetLookZ = lookAt[2];
    currentLookAt.current.x = MathUtils.lerp(currentLookAt.current.x, targetLookX, lerpAlpha);
    currentLookAt.current.y = MathUtils.lerp(currentLookAt.current.y, targetLookY, lerpAlpha);
    currentLookAt.current.z = MathUtils.lerp(currentLookAt.current.z, targetLookZ, lerpAlpha);
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
