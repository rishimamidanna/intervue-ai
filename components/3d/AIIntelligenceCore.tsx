"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  IcosahedronGeometry,
  MathUtils,
  type Group,
  type Mesh,
  type Points,
  type ShaderMaterial,
} from "three";
import { heroInteractionStore } from "./heroInteractionStore";

export interface AIIntelligenceCoreProps {
  position?: [number, number, number];
}

/* ─── Deterministic PRNG — SSR safe ────────────────────────────── */
function pr(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7 * Math.cos(n * 0.17)) * 43758.5453;
  return x - Math.floor(x);
}

/* ─── Shell-distributed points ─────────────────────────────────── */
function shellPts(count: number, radius: number, seed: number) {
  const p = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u   = pr(seed + i * 5.77) * 2 - 1;
    const phi = pr(seed + i * 5.77 + 3.11) * Math.PI * 2;
    const s   = Math.sqrt(Math.max(0, 1 - u * u));
    p[i * 3]     = radius * s * Math.cos(phi);
    p[i * 3 + 1] = radius * u;
    p[i * 3 + 2] = radius * s * Math.sin(phi);
  }
  return p;
}

/* ─── Volumetric points inside sphere ──────────────────────────── */
function volPts(count: number, radius: number, seed: number) {
  const p = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u   = pr(seed + i * 7.13) * 2 - 1;
    const phi = pr(seed + i * 7.13 + 1.37) * Math.PI * 2;
    const r   = radius * Math.cbrt(pr(seed + i * 7.13 + 2.91));
    const s   = Math.sqrt(Math.max(0, 1 - u * u));
    p[i * 3]     = r * s * Math.cos(phi);
    p[i * 3 + 1] = r * u;
    p[i * 3 + 2] = r * s * Math.sin(phi);
  }
  return p;
}

/* ─── Fresnel rim glow shader ───────────────────────────────────── */
const rimVert = /* glsl */`
  varying vec3 vNorm;
  varying vec3 vView;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNorm = normalize(normalMatrix * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const rimFrag = /* glsl */`
  uniform vec3  uColor;
  uniform float uStr;
  varying vec3  vNorm;
  varying vec3  vView;
  void main() {
    float rim = pow(1.0 - abs(dot(vNorm, vView)), 3.2);
    gl_FragColor = vec4(uColor * rim * uStr, rim * 0.8);
  }
`;

/* ─── Radial glow billboard shader ─────────────────────────────── */
const glowVert = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const glowFrag = /* glsl */`
  uniform vec3  uC;
  uniform float uA;
  varying vec2  vUv;
  void main(){
    float d = length(vUv-0.5);
    float a = pow(smoothstep(0.5,0.0,d),1.5)*uA;
    gl_FragColor = vec4(uC,a);
  }
`;

/* ─── Animated plasma inner-core shader ────────────────────────── */
const plasmaVert = /* glsl */`varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const plasmaFrag = /* glsl */`
  uniform float uT;
  varying vec3  vP;

  float noise(vec3 p){
    p=fract(p*0.3183099+0.1); p*=17.0;
    return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
  }
  float fbm(vec3 p){
    float v=0.0,a=0.5;
    for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.1+vec3(1.7,9.2,8.3); a*=0.5; }
    return v;
  }
  void main(){
    vec3 p = vP*2.5 + vec3(uT*0.25, uT*0.18, uT*0.12);
    float f = fbm(p);
    float f2= fbm(p*1.8+vec3(4.1,1.3,2.9));
    vec3 purple=vec3(0.55,0.10,0.95);
    vec3 cyan  =vec3(0.05,0.80,1.00);
    vec3 white =vec3(1.00,0.95,1.00);
    vec3 col = mix(purple,cyan,f);
    col = mix(col,white,pow(f2,3.0)*0.6);
    float a = 0.4+0.3*f;
    gl_FragColor = vec4(col*2.5, clamp(a,0.0,0.95));
  }
`;

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export function AIIntelligenceCore({ position = [0.3, 0.0, -0.4] }: AIIntelligenceCoreProps) {

  /* ── Refs ────────────────────────────────────────────────────── */
  const rootRef       = useRef<Group>(null);
  const floatRef      = useRef<Group>(null);
  const assemblyRef   = useRef<Group>(null);
  const deepIcoRef    = useRef<Group>(null);   // finest geodesic — counter-rotates
  const midIcoRef     = useRef<Group>(null);   // medium geodesic
  const outerIcoRef   = useRef<Group>(null);   // coarse outer shell
  const particleRef   = useRef<Points>(null);
  const surfPtRef     = useRef<Points>(null);
  const plasmaRef     = useRef<ShaderMaterial>(null);
  const rimRef        = useRef<ShaderMaterial>(null);
  const glowRef       = useRef<ShaderMaterial>(null);
  const nucleusRef    = useRef<Mesh>(null);

  /* ── Icosahedron geometries (3 concentric lattices) ─────────── */
  // Using THREE IcosahedronGeometry with wireframe material = beautiful geodesic triangular lattice
  const deepIcoGeo  = useMemo(() => new IcosahedronGeometry(0.36, 3), []); // finest — 320 faces
  const midIcoGeo   = useMemo(() => new IcosahedronGeometry(0.58, 2), []); // medium — 80 faces
  const outerIcoGeo = useMemo(() => new IcosahedronGeometry(0.80, 1), []); // coarse — 20 faces

  /* ── Node points at each shell radius ───────────────────────── */
  const deepNodes  = useMemo(() => shellPts(80,  0.38, 42),  []);
  const midNodes   = useMemo(() => shellPts(50,  0.60, 777), []);
  const outerNodes = useMemo(() => shellPts(30,  0.82, 333), []);

  /* ── Volumetric particle cloud ───────────────────────────────── */
  const innerCloud = useMemo(() => volPts(2000, 0.76, 100), []);

  /* ── Shader uniforms ─────────────────────────────────────────── */
  const plasmaUni = useMemo(() => ({ uT: { value: 0 } }), []);
  const rimUni    = useMemo(() => ({
    uColor: { value: new Color("#a78bfa") },
    uStr:   { value: 1.4 },
  }), []);
  const glowUni   = useMemo(() => ({
    uC: { value: new Color("#6d28d9") },
    uA: { value: 0.55 },
  }), []);
  const cyanGlowUni = useMemo(() => ({
    uC: { value: new Color("#0891b2") },
    uA: { value: 0.22 },
  }), []);

  /* ── Animation frame ─────────────────────────────────────────── */
  useFrame((state, delta) => {
    const t     = state.clock.getElapsedTime();
    const hover = heroInteractionStore.getCtaHovered();
    const la    = 1 - Math.exp(-5 * delta);

    /* Entrance ease-out */
    const ent = MathUtils.clamp((t - 0.2) / 1.0, 0, 1);
    if (rootRef.current) rootRef.current.scale.setScalar(1 - Math.pow(1 - ent, 3));

    /* Vertical float */
    if (floatRef.current) floatRef.current.position.y = Math.sin(t * 0.48) * 0.10;

    /* Main assembly: slow rotation */
    if (assemblyRef.current) assemblyRef.current.rotation.y += 0.04 * delta;

    /* Deep icosahedron: counter-rotation + organic tilt */
    if (deepIcoRef.current) {
      deepIcoRef.current.rotation.y -= 0.03 * delta;
      deepIcoRef.current.rotation.x  = Math.sin(t * 0.19) * 0.08;
      deepIcoRef.current.rotation.z  = Math.cos(t * 0.14) * 0.05;
    }

    /* Mid icosahedron: own axis drift */
    if (midIcoRef.current) {
      midIcoRef.current.rotation.y += 0.025 * delta;
      midIcoRef.current.rotation.x  = Math.cos(t * 0.22) * 0.06;
    }

    /* Outer icosahedron: very slow counter */
    if (outerIcoRef.current) {
      outerIcoRef.current.rotation.y -= 0.018 * delta;
      outerIcoRef.current.rotation.z  = Math.sin(t * 0.11) * 0.04;
    }

    /* Particles: independent swirl */
    if (particleRef.current) {
      particleRef.current.rotation.y += 0.10 * delta;
      particleRef.current.rotation.z += 0.04 * delta;
    }
    if (surfPtRef.current) surfPtRef.current.rotation.y -= 0.06 * delta;

    /* Nucleus pulse */
    if (nucleusRef.current) {
      const ps = hover ? 1 + 0.3 * Math.sin(t * 3.0) : 1 + 0.12 * Math.sin(t * 0.9);
      nucleusRef.current.scale.setScalar(MathUtils.lerp(nucleusRef.current.scale.x, ps, la));
    }

    /* Plasma uTime */
    if (plasmaRef.current) plasmaRef.current.uniforms.uT.value = t;

    /* Rim glow pulse */
    if (rimRef.current) {
      rimRef.current.uniforms.uStr.value = MathUtils.lerp(
        rimRef.current.uniforms.uStr.value,
        hover ? 2.5 : 1.3 + 0.3 * Math.sin(t * 0.75),
        la,
      );
    }

    /* Background glow pulse */
    if (glowRef.current) {
      glowRef.current.uniforms.uA.value = MathUtils.lerp(
        glowRef.current.uniforms.uA.value,
        hover ? 0.72 : 0.48 + 0.10 * Math.sin(t * 0.6),
        la,
      );
    }
  });

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <group ref={rootRef} name="ai-neural-core" position={position}>

      {/* ── BACKGROUND VOLUMETRIC GLOW SPRITES ── */}
      <mesh position={[0, 0.1, -1.1]}>
        <planeGeometry args={[5.5, 5.5]} />
        <shaderMaterial ref={glowRef} vertexShader={glowVert} fragmentShader={glowFrag}
          uniforms={glowUni} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh position={[0.25, 0.3, -0.9]}>
        <planeGeometry args={[3.0, 3.0]} />
        <shaderMaterial vertexShader={glowVert} fragmentShader={glowFrag}
          uniforms={cyanGlowUni} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>

      {/* ── FLOATING ASSEMBLY ── */}
      <group ref={floatRef}>
        <group ref={assemblyRef}>

          {/* === LAYER 0: Bright nucleus === */}
          <mesh ref={nucleusRef}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#ffffff" emissive="#e9d5ff" emissiveIntensity={10} />
          </mesh>

          {/* Nucleus halo — tiny emissive orb */}
          <mesh>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#18103a" emissive="#9333ea" emissiveIntensity={5}
              transparent opacity={0.55} roughness={0} metalness={0} />
          </mesh>

          {/* === LAYER 1: Animated plasma core (fBm noise shader) === */}
          <mesh>
            <sphereGeometry args={[0.28, 24, 24]} />
            <shaderMaterial ref={plasmaRef}
              vertexShader={plasmaVert} fragmentShader={plasmaFrag}
              uniforms={plasmaUni} transparent depthWrite={false}
              blending={AdditiveBlending} />
          </mesh>

          {/* === LAYER 2: DEEP NEURAL LATTICE — finest geodesic (r=0.36, detail=3) === */}
          {/* 320 triangular faces → dense cyan wireframe grid = unmistakable AI brain pattern */}
          <group ref={deepIcoRef}>
            <mesh geometry={deepIcoGeo}>
              <meshBasicMaterial wireframe color="#22d3ee"
                transparent opacity={0.70} blending={AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* Node points at this radius */}
            <points>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[deepNodes, 3]} />
              </bufferGeometry>
              <pointsMaterial size={0.040} color="#67e8f9"
                transparent opacity={0.90} sizeAttenuation
                blending={AdditiveBlending} depthWrite={false} />
            </points>
          </group>

          {/* === LAYER 3: MID NEURAL LATTICE (r=0.58, detail=2) === */}
          {/* 80 faces → medium density purple grid */}
          <group ref={midIcoRef}>
            <mesh geometry={midIcoGeo}>
              <meshBasicMaterial wireframe color="#a78bfa"
                transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} />
            </mesh>
            <points>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[midNodes, 3]} />
              </bufferGeometry>
              <pointsMaterial size={0.050} color="#c4b5fd"
                transparent opacity={0.85} sizeAttenuation
                blending={AdditiveBlending} depthWrite={false} />
            </points>
          </group>

          {/* === LAYER 4: OUTER NEURAL SHELL (r=0.80, detail=1) === */}
          {/* 20 faces → coarse angular outer cage */}
          <group ref={outerIcoRef}>
            <mesh geometry={outerIcoGeo}>
              <meshBasicMaterial wireframe color="#8b5cf6"
                transparent opacity={0.38} blending={AdditiveBlending} depthWrite={false} />
            </mesh>
            <points>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[outerNodes, 3]} />
              </bufferGeometry>
              <pointsMaterial size={0.065} color="#f0abfc"
                transparent opacity={0.80} sizeAttenuation
                blending={AdditiveBlending} depthWrite={false} />
            </points>
          </group>

          {/* === LAYER 5: Dense volumetric particle cloud (2000 particles) === */}
          <points ref={particleRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[innerCloud, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.010} color="#a78bfa"
              transparent opacity={0.50} sizeAttenuation
              blending={AdditiveBlending} depthWrite={false} />
          </points>

          {/* Surface particle drift */}
          <points ref={surfPtRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={outerNodes ? [outerNodes, 3] : [new Float32Array(0), 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.014} color="#38bdf8"
              transparent opacity={0.65} sizeAttenuation
              blending={AdditiveBlending} depthWrite={false} />
          </points>

          {/* === LAYER 6: Holographic glass outer shell (Fresnel rim only) === */}
          <mesh>
            <sphereGeometry args={[0.90, 64, 64]} />
            <shaderMaterial ref={rimRef}
              vertexShader={rimVert} fragmentShader={rimFrag}
              uniforms={rimUni} transparent depthWrite={false}
              blending={AdditiveBlending} side={2} />
          </mesh>

          {/* Very faint inner glass — adds depth/refraction feeling without blocking view */}
          <mesh>
            <sphereGeometry args={[0.88, 48, 48]} />
            <meshPhysicalMaterial
              color="#04021a" roughness={0.0} metalness={0.0}
              transmission={0.98} thickness={0.3} transparent opacity={0.08}
              clearcoat={1.0} ior={1.45}
            />
          </mesh>

          {/* === VOLUMETRIC POINT LIGHTS === */}
          <pointLight color="#a855f7" intensity={9}  distance={7}  decay={2} />
          <pointLight color="#22d3ee" intensity={3}  distance={5}  decay={2} position={[0.28, 0.18, 0.28]} />
          <pointLight color="#e879f9" intensity={2}  distance={3}  decay={2} position={[-0.22, -0.15, 0.30]} />

        </group>
      </group>

      {/* ── GROUND UPLIGHTING (subtle glow below, no platform ring) ── */}
      <mesh position={[0, -1.20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 2.8]} />
        <shaderMaterial
          vertexShader={glowVert} fragmentShader={glowFrag}
          uniforms={{ uC: { value: new Color("#6d28d9") }, uA: { value: 0.28 } }}
          transparent depthWrite={false} blending={AdditiveBlending}
        />
      </mesh>
      <pointLight color="#7c3aed" intensity={2.5} distance={4} decay={2} position={[0, -1.0, 0]} />
    </group>
  );
}
