"use client";

import { useEffect, useRef } from "react";

export interface MouseParallaxState {
  /** Normalized X position (-1 to 1) */
  x: number;
  /** Normalized Y position (-1 to 1) */
  y: number;
}

/**
 * Reusable hook that tracks normalized mouse coordinates for subtle 3D parallax effects.
 */
export function useMouseParallax(sensitivity = 0.5) {
  const mouseRef = useRef<MouseParallaxState>({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.x = normalizedX * sensitivity;
      mouseRef.current.y = normalizedY * sensitivity;
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [sensitivity]);

  return mouseRef;
}
