"use client";

import { PerspectiveCamera } from "@react-three/drei";
import type { ComponentProps } from "react";

export interface CameraProps extends ComponentProps<typeof PerspectiveCamera> {
  position?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
  makeDefault?: boolean;
}

/**
 * Camera component for 3D scenes.
 * Encapsulates a production-ready PerspectiveCamera with customizable position, FOV, near/far planes.
 */
export function Camera({
  position = [0, 0, 5],
  fov = 50,
  near = 0.1,
  far = 1000,
  makeDefault = true,
  ...props
}: CameraProps) {
  return (
    <PerspectiveCamera
      makeDefault={makeDefault}
      position={position}
      fov={fov}
      near={near}
      far={far}
      {...props}
    />
  );
}

export { CinematicCamera } from "./CinematicCamera";
export type { CinematicCameraProps } from "./CinematicCamera";
