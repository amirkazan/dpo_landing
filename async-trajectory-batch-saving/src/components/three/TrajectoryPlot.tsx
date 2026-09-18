"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Line, OrbitControls, Stars } from "@react-three/drei";
import { Color, type Group } from "three";

type Vec3 = [number, number, number];

interface Props {
  coordinates: number[][];
  speeds: number[];
  withManeuvers: boolean;
}

const DISPLAY_RADIUS = 6.2;

function lineGradient(speeds: number[]): Vec3[] {
  const min = Math.min(...speeds);
  const max = Math.max(...speeds);
  const span = Math.max(1e-9, max - min);
  const cold = new Color("#1d5f8a");
  const mid = new Color("#3df5a6");
  const hot = new Color("#eafff5");
  const c = new Color();
  return speeds.map((s) => {
    const k = (s - min) / span;
    if (k < 0.65) c.lerpColors(cold, mid, k / 0.65);
    else c.lerpColors(mid, hot, (k - 0.65) / 0.35);
    return [c.r, c.g, c.b] as Vec3;
  });
}

function PlotContent({ coordinates, speeds, withManeuvers }: Props) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06;
  });

  const { pts, meanRadius } = useMemo(() => {
    let max = 0;
    let sum = 0;
    for (const c of coordinates) {
      const n = Math.hypot(c[0], c[1], c[2]);
      sum += n;
      if (n > max) max = n;
    }
    const k = max > 0 ? DISPLAY_RADIUS / max : 0;
    return {
      pts: coordinates.map((c) => [c[0] * k, c[2] * k, c[1] * k] as Vec3),
      meanRadius: coordinates.length ? (sum / coordinates.length) * k : DISPLAY_RADIUS,
    };
  }, [coordinates]);

  const colors = useMemo(() => lineGradient(speeds), [speeds]);

  const burnIndex = useMemo(() => {
    if (!withManeuvers || speeds.length < 3) return -1;
    let best = 0;
    let idx = -1;
    for (let i = 1; i < speeds.length; i++) {
      const d = Math.abs(speeds[i] - speeds[i - 1]);
      if (d > best) {
        best = d;
        idx = i;
      }
    }
    return idx;
  }, [speeds, withManeuvers]);

  const start = pts[0];
  const end = pts[pts.length - 1];
  const planetRadius = Math.max(0.5, meanRadius * 0.93);

  return (
    <>
      <fog attach="fog" args={["#04070d", 22, 52]} />
      <ambientLight intensity={0.5} />
      <group ref={group}>
        <mesh>
          <sphereGeometry args={[planetRadius, 48, 48]} />
          <meshStandardMaterial color="#05080f" roughness={1} emissive="#0a1622" emissiveIntensity={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[planetRadius * 1.005, 20, 20]} />
          <meshBasicMaterial color="#2c5f8a" wireframe transparent opacity={0.09} />
        </mesh>

        <Line points={pts} vertexColors={colors} lineWidth={2.2} transparent opacity={0.98} />

        {start && (
          <mesh position={start}>
            <sphereGeometry args={[0.1, 14, 14]} />
            <meshBasicMaterial color="#3df5a6" />
          </mesh>
        )}
        {end && (
          <mesh position={end}>
            <sphereGeometry args={[0.1, 14, 14]} />
            <meshBasicMaterial color="#ff5c7a" />
          </mesh>
        )}
        {burnIndex >= 0 && pts[burnIndex] && (
          <group position={pts[burnIndex]}>
            <mesh>
              <octahedronGeometry args={[0.16]} />
              <meshBasicMaterial color="#ffb454" />
            </mesh>
            <mesh>
              <octahedronGeometry args={[0.32]} />
              <meshBasicMaterial color="#ffb454" wireframe transparent opacity={0.35} />
            </mesh>
          </group>
        )}
      </group>

      <Grid
        position={[0, -DISPLAY_RADIUS - 2.6, 0]}
        args={[50, 50]}
        cellSize={1.1}
        cellThickness={0.55}
        cellColor="#152740"
        sectionSize={5.5}
        sectionThickness={0.9}
        sectionColor="#1f3a5c"
        fadeDistance={36}
        fadeStrength={2.4}
        infiniteGrid
      />
      <Stars radius={80} depth={35} count={1800} factor={3} saturation={0.3} fade speed={0.5} />
      <OrbitControls makeDefault enablePan={false} autoRotate autoRotateSpeed={0.5} minDistance={8} maxDistance={30} />
    </>
  );
}

export default function TrajectoryPlot(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [9, 6.5, 11], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <PlotContent {...props} />
    </Canvas>
  );
}
