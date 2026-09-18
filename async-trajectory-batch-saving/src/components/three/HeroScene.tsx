"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Line, Stars } from "@react-three/drei";
import type { Group } from "three";

type Vec3 = [number, number, number];

function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Decorative orbital lane used as background. */
function proceduralArc(seed: number, displayRadius: number, samples = 260): Vec3[] {
  const rnd = seededRandom(seed);
  const r = displayRadius * (0.92 + rnd() * 0.62);
  const incl = (10 + rnd() * 70) * (Math.PI / 180);
  const phase = rnd() * Math.PI * 2;
  const span = (80 + rnd() * 160) * (Math.PI / 180);
  const wobble = r * 0.03 * rnd();
  const cosI = Math.cos(incl);
  const sinI = Math.sin(incl);
  const pts: Vec3[] = [];
  for (let i = 0; i < samples; i++) {
    const th = phase + (i / (samples - 1) - 0.5) * span;
    const rr = r + wobble * Math.sin(3 * th + phase);
    pts.push([rr * Math.cos(th), rr * Math.sin(th) * sinI * 0.9, rr * Math.sin(th) * cosI]);
  }
  return pts;
}

/** Small bright comet travelling around a ring. */
function Comet({ radius, speed, offset, color, tilt, paused }: { radius: number; speed: number; offset: number; color: string; tilt: number; paused: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime * speed + offset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t) * radius * Math.sin(tilt);
    ref.current?.position.set(x, y, z);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function SceneContent({ paused }: { paused: boolean }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!paused && group.current) group.current.rotation.y += delta * 0.045;
  });

  const ghostArcs = useMemo(
    () => Array.from({ length: 5 }, (_, i) => proceduralArc(1000 + i * 77, 8.6)),
    [],
  );

  return (
    <>
      <fog attach="fog" args={["#04070d", 20, 46]} />
      <ambientLight intensity={0.4} />
      <group ref={group}>
        {/* planet core */}
        <mesh>
          <sphereGeometry args={[4.1, 48, 48]} />
          <meshStandardMaterial color="#060b14" roughness={0.95} metalness={0.1} emissive="#0a1826" emissiveIntensity={0.55} />
        </mesh>
        <mesh>
          <sphereGeometry args={[4.16, 24, 24]} />
          <meshBasicMaterial color="#45d8ff" wireframe transparent opacity={0.075} />
        </mesh>
        <mesh>
          <sphereGeometry args={[4.6, 32, 32]} />
          <meshBasicMaterial color="#45d8ff" transparent opacity={0.035} />
        </mesh>

        {/* background ghost lanes */}
        {ghostArcs.map((pts, i) => (
          <Line key={`g${i}`} points={pts} color="#24405f" lineWidth={0.75} transparent opacity={0.85} />
        ))}

        <Comet radius={9.6} speed={0.11} offset={0} color="#3df5a6" tilt={0.32} paused={paused} />
        <Comet radius={11.4} speed={0.07} offset={2.4} color="#45d8ff" tilt={-0.18} paused={paused} />
        <Comet radius={10.3} speed={0.09} offset={4.6} color="#ffb454" tilt={0.55} paused={paused} />
      </group>

      <Grid
        position={[0, -9.5, 0]}
        args={[60, 60]}
        cellSize={1.2}
        cellThickness={0.55}
        cellColor="#14243c"
        sectionSize={6}
        sectionThickness={0.9}
        sectionColor="#1e3a5c"
        fadeDistance={40}
        fadeStrength={2.5}
        infiniteGrid
      />
      <Stars radius={70} depth={40} count={2600} factor={3.2} saturation={0.35} fade speed={paused ? 0 : 0.6} />
    </>
  );
}

export default function HeroScene() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 4.4, 17.5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <SceneContent paused={paused} />
    </Canvas>
  );
}
