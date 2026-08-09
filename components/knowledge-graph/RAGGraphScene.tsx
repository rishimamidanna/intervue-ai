"use client";

/**
 * components/knowledge-graph/RAGGraphScene.tsx
 *
 * 3D RAG Knowledge Graph Observability Scene Component.
 * Uses React Three Fiber to render internal AI knowledge structures:
 * Curriculum DB -> Chunking Engine -> Embedding Space -> Vector Retrieval -> Reranking Engine -> LLM Context Window -> Evaluation Matrix.
 * Features live animated cyan data packets flowing across all 7 RAG processing nodes.
 *
 * Owner: Member 1 (Frontend / 3D Experience)
 */

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Cylinder, Box, Plane } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { Scene } from "../3d/Scene";
import { Lighting } from "../3d/Lighting";
import { Particles } from "../3d/Particles";
import { NeuralConnections } from "../3d/NeuralConnections";

/**
 * Animated Glowing Data Packets Flowing Through All 7 RAG Nodes
 * 1. Curriculum DB -> 2. Chunking -> 3. Embeddings -> 4. Retrieval -> 5. Rerank -> 6. LLM Context -> 7. Evaluation
 */
function RAGDataPackets3D() {
  const packetRef1 = useRef<Mesh>(null!);
  const packetRef2 = useRef<Mesh>(null!);
  const packetRef3 = useRef<Mesh>(null!);

  const pathPoints = [
    [-3.2, 0.5, 0],     // Node 1: Curriculum DB
    [-2.1, -0.4, 0.2],  // Node 2: Chunking Engine
    [-1.0, 0.2, -0.1],  // Node 3: Embedding Space
    [0, 0, 0],          // Node 4: Vector Retrieval
    [1.1, -0.3, 0.1],   // Node 5: Reranking Engine
    [2.1, 0.3, -0.2],   // Node 6: LLM Context Window
    [3.2, -0.2, 0],     // Node 7: Evaluation Matrix
  ];

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Stream 1 (Cyan Vector Data Packet)
    const t1 = (time * 0.4) % 1;
    const idx1 = Math.floor(t1 * (pathPoints.length - 1));
    const subT1 = (t1 * (pathPoints.length - 1)) % 1;
    const p1Start = pathPoints[idx1];
    const p1End = pathPoints[Math.min(idx1 + 1, pathPoints.length - 1)];

    if (packetRef1.current) {
      packetRef1.current.position.set(
        p1Start[0] + (p1End[0] - p1Start[0]) * subT1,
        p1Start[1] + (p1End[1] - p1Start[1]) * subT1,
        p1Start[2] + (p1End[2] - p1Start[2]) * subT1
      );
      packetRef1.current.rotation.x = time * 2.5;
      packetRef1.current.rotation.y = time * 2.5;
    }

    // Stream 2 (Purple Vector Data Packet with offset)
    const t2 = (time * 0.4 + 0.33) % 1;
    const idx2 = Math.floor(t2 * (pathPoints.length - 1));
    const subT2 = (t2 * (pathPoints.length - 1)) % 1;
    const p2Start = pathPoints[idx2];
    const p2End = pathPoints[Math.min(idx2 + 1, pathPoints.length - 1)];

    if (packetRef2.current) {
      packetRef2.current.position.set(
        p2Start[0] + (p2End[0] - p2Start[0]) * subT2,
        p2Start[1] + (p2End[1] - p2Start[1]) * subT2,
        p2Start[2] + (p2End[2] - p2Start[2]) * subT2
      );
      packetRef2.current.rotation.y = time * 3.0;
    }

    // Stream 3 (Emerald Vector Data Packet with offset)
    const t3 = (time * 0.4 + 0.66) % 1;
    const idx3 = Math.floor(t3 * (pathPoints.length - 1));
    const subT3 = (t3 * (pathPoints.length - 1)) % 1;
    const p3Start = pathPoints[idx3];
    const p3End = pathPoints[Math.min(idx3 + 1, pathPoints.length - 1)];

    if (packetRef3.current) {
      packetRef3.current.position.set(
        p3Start[0] + (p3End[0] - p3Start[0]) * subT3,
        p3Start[1] + (p3End[1] - p3Start[1]) * subT3,
        p3Start[2] + (p3End[2] - p3Start[2]) * subT3
      );
      packetRef3.current.rotation.z = time * 3.5;
    }
  });

  return (
    <group>
      <mesh ref={packetRef1}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={3.2}
        />
      </mesh>

      <mesh ref={packetRef2}>
        <boxGeometry args={[0.13, 0.13, 0.13]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#7e22ce"
          emissiveIntensity={3.2}
        />
      </mesh>

      <mesh ref={packetRef3}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#059669"
          emissiveIntensity={3.2}
        />
      </mesh>
    </group>
  );
}

/**
 * 3D RAG Internal Processing Pipeline Mesh Structures (All 7 Nodes)
 */
function RAGSystemPipeline3D() {
  const dbRef = useRef<Group>(null!);
  const chunkRef = useRef<Group>(null!);
  const vectorGridRef = useRef<Mesh>(null!);
  const rerankRef = useRef<Group>(null!);
  const contextWindowRef = useRef<Mesh>(null!);
  const sceneGroupRef = useRef<Group>(null!);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (dbRef.current) {
      dbRef.current.rotation.y += delta * 0.4;
    }
    if (chunkRef.current) {
      chunkRef.current.rotation.y -= delta * 0.5;
    }
    if (vectorGridRef.current) {
      vectorGridRef.current.rotation.z = Math.sin(time * 0.5) * 0.15 + time * 0.1;
    }
    if (rerankRef.current) {
      rerankRef.current.rotation.y += delta * 0.4;
    }
    if (contextWindowRef.current) {
      contextWindowRef.current.rotation.y += delta * 0.6;
    }
    if (sceneGroupRef.current) {
      sceneGroupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
      sceneGroupRef.current.rotation.x = Math.cos(time * 0.2) * 0.03;
    }
  });

  return (
    <group ref={sceneGroupRef}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
        {/* NODE 1: Curriculum Knowledge Base (Holographic Database) */}
        <group ref={dbRef} position={[-3.2, 0.5, 0]}>
          <Cylinder args={[0.6, 0.6, 1.1, 32]}>
            <meshStandardMaterial
              color="#7e22ce"
              emissive="#a855f7"
              emissiveIntensity={0.8}
              wireframe
            />
          </Cylinder>
          <Cylinder args={[0.45, 0.45, 1.2, 16]}>
            <meshBasicMaterial color="#38bdf8" wireframe />
          </Cylinder>
        </group>

        {/* NODE 2: Chunking Engine (Document Sections Splitting) */}
        <group ref={chunkRef} position={[-2.1, -0.4, 0.2]}>
          <Box args={[0.7, 0.08, 0.7]} position={[0, 0.25, 0]}>
            <meshStandardMaterial color="#c084fc" transparent opacity={0.85} />
          </Box>
          <Box args={[0.7, 0.08, 0.7]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} />
          </Box>
          <Box args={[0.7, 0.08, 0.7]} position={[0, -0.25, 0]}>
            <meshStandardMaterial color="#a78bfa" transparent opacity={0.85} />
          </Box>
        </group>

        {/* NODE 3: Embedding Space (Dimensional Vector Grid) */}
        <group position={[-1.0, 0.2, -0.1]}>
          <Plane ref={vectorGridRef} args={[1.8, 1.8, 10, 10]} rotation={[-Math.PI / 3, 0, 0]}>
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.75} />
          </Plane>
        </group>

        {/* NODE 4: Vector Retrieval (Search Beams Center) */}
        <group position={[0, 0, 0]}>
          <Cylinder args={[0.4, 0.4, 0.6, 16]}>
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} wireframe />
          </Cylinder>
        </group>

        {/* NODE 5: Reranking Engine (Cross-Encoder Layers) */}
        <group ref={rerankRef} position={[1.1, -0.3, 0.1]}>
          <Box args={[0.7, 0.08, 0.7]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#a855f7" transparent opacity={0.85} />
          </Box>
          <Box args={[0.7, 0.08, 0.7]} position={[0, -0.2, 0]}>
            <meshStandardMaterial color="#34d399" transparent opacity={0.85} />
          </Box>
        </group>

        {/* NODE 6: LLM Context Window (Glowing Reasoning Core) */}
        <mesh ref={contextWindowRef} position={[2.1, 0.3, -0.2]}>
          <octahedronGeometry args={[0.75, 2]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.3}
            wireframe
          />
        </mesh>

        {/* NODE 7: Evaluation Engine (Scoring Matrix) */}
        <group position={[3.2, -0.2, 0]}>
          <Cylinder args={[0.55, 0.55, 0.75, 16]}>
            <meshBasicMaterial color="#34d399" wireframe />
          </Cylinder>
        </group>
      </Float>

      {/* Live Animated Data Packets Flowing Through All 7 RAG Pipeline Nodes */}
      <RAGDataPackets3D />
    </group>
  );
}

export function RAGGraphScene() {
  return (
    <div className="relative w-full h-[480px] rounded-3xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-2xl p-4 overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.18)] flex flex-col justify-between group">
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wider font-mono uppercase">
              Internal RAG Knowledge System
            </h2>
            <p className="text-xs text-purple-300/80 font-mono">
              7-Stage Vector Processing & Context Retrieval Observability Mesh
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-300 text-xs font-mono tracking-widest uppercase shadow-lg">
          Live RAG Datastream
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="w-full h-full">
        <Scene className="w-full h-full min-h-[400px]">
          <Lighting keyLightIntensity={2.0} purpleGlowIntensity={3.5} />
          <Particles count={240} color="#38bdf8" size={0.035} />
          <NeuralConnections origin={[-3.2, 0.5, 0]} pulseSpeed={0.3} />
          <RAGSystemPipeline3D />
        </Scene>
      </div>

      {/* Bottom Status Bar Overlay */}
      <div className="absolute bottom-4 left-6 right-6 z-10 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-purple-500/20 pt-3 pointer-events-none">
        <span className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>RAG PIPELINE: ACTIVE DATASTREAM</span>
        </span>
        <span>RETRIEVAL LATENCY: 8ms</span>
        <span className="text-purple-400">FPS: 60</span>
      </div>
    </div>
  );
}
