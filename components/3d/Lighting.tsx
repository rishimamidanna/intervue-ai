"use client";

export interface LightingProps {
  /** Main directional key light intensity */
  keyLightIntensity?: number;
  /** Primary purple AI glow point light intensity */
  purpleGlowIntensity?: number;
  /** Secondary cyan AI glow point light intensity */
  blueGlowIntensity?: number;
  /** Ambient light intensity */
  ambientIntensity?: number;
}

/**
 * Cinematic Lighting component for INTERVUE AI.
 * Configures soft key directional light with shadow mapping, ambient background fill,
 * cool blue rim light, and signature purple/blue AI glow point lights.
 */
export function Lighting({
  keyLightIntensity = 1.2,
  purpleGlowIntensity = 2.5,
  blueGlowIntensity = 1.5,
  ambientIntensity = 0.4,
}: LightingProps) {
  return (
    <group name="cinematic-lighting">
      {/* Soft Low-Intensity Ambient Fill */}
      <ambientLight intensity={ambientIntensity} color="#1e1b4b" />

      {/* Main Soft Key Light with Shadows */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={keyLightIntensity}
        color="#f8fafc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-bias={-0.0001}
      />

      {/* Cool Blue Fill Light */}
      <directionalLight
        position={[-5, -2, -3]}
        intensity={0.6}
        color="#3b82f6"
      />

      {/* Signature Purple AI Glow Point Light */}
      <pointLight
        position={[0, 1, 2]}
        intensity={purpleGlowIntensity}
        color="#7c3aed"
        distance={10}
        decay={2}
      />

      {/* Secondary Cyan/Blue AI Glow Accent Light */}
      <pointLight
        position={[-2, -1, 1]}
        intensity={blueGlowIntensity}
        color="#38bdf8"
        distance={8}
        decay={2}
      />

      {/* Deep Rim Light from behind */}
      <directionalLight
        position={[0, 4, -8]}
        intensity={0.8}
        color="#8b5cf6"
      />
    </group>
  );
}
