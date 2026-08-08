"use client";

import {
  Scene,
  CinematicCamera,
  Lighting,
  Environment,
  Particles,
  HeroFocalCore,
  FloatingObject,
} from "@/components/3d";

export function Hero3DScene() {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden">
      <Scene className="w-full h-full">
        {/* Cinematic Breathing Camera */}
        <CinematicCamera
          position={[0, 0.4, 6]}
          lookAt={[0, 0, 0]}
          enableDrift
          driftSpeed={0.35}
          driftAmount={[0.15, 0.1]}
        />

        {/* Lighting & Environment */}
        <Lighting
          keyLightIntensity={1.8}
          purpleGlowIntensity={3.5}
          blueGlowIntensity={2.2}
          ambientIntensity={0.4}
        />
        <Environment backgroundColor="#050508" fogBounds={[4, 25]} />
        <Particles count={350} color="#a78bfa" size={0.07} bounds={[22, 14, 18]} />

        {/* Center 3D Focal Area */}
        <HeroFocalCore />

        {/* Mid-ground Floating Titanium / Glass Nodes */}
        <FloatingObject
          position={[-3.4, 0.9, 0.2]}
          floatSpeed={0.65}
          floatAmplitude={0.15}
          floatOffset={0}
        />
        <FloatingObject
          position={[3.4, -0.6, 0.4]}
          floatSpeed={0.75}
          floatAmplitude={0.12}
          floatOffset={Math.PI / 2}
        />
        <FloatingObject
          position={[0, 1.8, -1.2]}
          floatSpeed={0.5}
          floatAmplitude={0.1}
          floatOffset={Math.PI / 4}
        />
      </Scene>
    </div>
  );
}
