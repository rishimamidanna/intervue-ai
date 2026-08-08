"use client";

import {
  Scene,
  CinematicCamera,
  Lighting,
  Environment,
  Particles,
  AIIntelligenceCore,
  HolographicNode,
  NeuralNetwork,
} from "@/components/3d";

export function Hero3DScene() {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden">
      <Scene className="w-full h-full">
        {/* Cinematic Breathing & Parallax Camera */}
        <CinematicCamera
          position={[0, 0.4, 6]}
          lookAt={[0, 0, 0]}
          enableDrift
          driftSpeed={0.35}
          driftAmount={[0.15, 0.1]}
          enableParallax
          parallaxAmount={[0.2, 0.15]}
        />

        {/* Lighting & Volumetric Atmosphere Environment */}
        <Lighting
          keyLightIntensity={1.8}
          purpleGlowIntensity={3.8}
          blueGlowIntensity={2.6}
          ambientIntensity={0.4}
          enablePulse
        />
        <Environment backgroundColor="#050508" fogBounds={[4, 25]} />
        <Particles count={400} color="#a78bfa" size={0.06} bounds={[22, 14, 18]} speed={0.03} />

        {/* Hero Focus Element: Central 3D AI Intelligence Core */}
        <AIIntelligenceCore position={[0, 0.1, -0.4]} />

        {/* 3D Neural Network Pathways & Flowing Data Pulses */}
        <NeuralNetwork
          origin={[0, 0.1, -0.4]}
          targets={[
            { id: "adaptive", position: [0, 2.1, -0.8], color: "#c084fc" },
            { id: "rag", position: [-3.2, -0.4, 0.1], color: "#38bdf8" },
            { id: "digital-twin", position: [2.8, 0.4, 0.1], color: "#38bdf8" },
            { id: "reflection", position: [0.8, -1.5, 0.2], color: "#a78bfa" },
          ]}
          pulseSpeed={0.22}
        />

        {/* TOP: Adaptive Engine Node */}
        <HolographicNode
          id="adaptive"
          nodeType="adaptive"
          title="ADAPTIVE ENGINE"
          subtext="Real-time difficulty adjustment"
          position={[0, 2.1, -0.8]}
          floatSpeed={0.35}
          floatAmplitude={0.07}
          floatOffset={Math.PI / 3}
        />

        {/* LEFT: Hybrid RAG Node (Moved left & down away from headline) */}
        <HolographicNode
          id="rag"
          nodeType="rag"
          title="HYBRID RAG"
          subtext="Semantic + Keyword"
          position={[-3.2, -0.4, 0.1]}
          floatSpeed={0.4}
          floatAmplitude={0.08}
          floatOffset={0}
        />

        {/* RIGHT: Digital Twin Node */}
        <HolographicNode
          id="digital-twin"
          nodeType="digital-twin"
          title="DIGITAL TWIN"
          subtext="Candidate profile model"
          position={[2.8, 0.4, 0.1]}
          floatSpeed={0.4}
          floatAmplitude={0.08}
          floatOffset={(2 * Math.PI) / 3}
        />

        {/* BOTTOM: Self Reflection Node */}
        <HolographicNode
          id="reflection"
          nodeType="reflection"
          title="SELF REFLECTION"
          subtext="AI evaluation loop"
          position={[0.8, -1.5, 0.2]}
          floatSpeed={0.3}
          floatAmplitude={0.06}
          floatOffset={Math.PI}
        />
      </Scene>
    </div>
  );
}
