import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WaveRingProps {
  radius: number;
  audioLevel: number;
  offset: number;
  color: THREE.Color;
}

function WaveRing({ radius, audioLevel, offset, color }: WaveRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.TorusGeometry(radius, 0.02, 16, 100);
    return geo;
  }, [radius]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const wave = Math.sin(time * 3 + offset) * 0.5 + 0.5;
    const scale = 1 + audioLevel * wave * 0.5;
    
    meshRef.current.scale.set(scale, scale, scale);
    meshRef.current.rotation.z = time * 0.2 + offset;
    
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = (0.3 + audioLevel * 0.7) * (1 - wave * 0.5);
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

interface SoundWaveProps {
  audioLevel: number;
  frequency: number;
  robotState: string;
}

function SoundWaves({ audioLevel, frequency, robotState }: SoundWaveProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const getWaveColor = () => {
    switch (robotState) {
      case "speaking":
        return new THREE.Color(0.2, 1, 1);
      case "thinking":
        return new THREE.Color(1, 0.8, 0.2);
      case "error":
        return new THREE.Color(1, 0.2, 0.2);
      default:
        return new THREE.Color(0.4, 0.8, 1);
    }
  };

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.3;
    groupRef.current.position.y = Math.sin(time * 2) * 0.1;
  });

  const color = getWaveColor();
  const numRings = 8;

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {Array.from({ length: numRings }).map((_, i) => (
        <WaveRing
          key={i}
          radius={0.3 + i * 0.15}
          audioLevel={audioLevel}
          offset={i * Math.PI * 0.25}
          color={color}
        />
      ))}
    </group>
  );
}

interface FrequencyBarsProps {
  audioLevel: number;
  frequency: number;
}

function FrequencyBars({ audioLevel, frequency }: FrequencyBarsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const numBars = 32;
  
  const bars = useMemo(() => {
    return Array.from({ length: numBars }).map((_, i) => ({
      angle: (i / numBars) * Math.PI * 2,
      height: Math.random() * 0.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [numBars]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    groupRef.current.children.forEach((child, i) => {
      const bar = bars[i];
      const freqModifier = Math.sin(time * 5 + bar.phase + frequency) * 0.5 + 0.5;
      const height = bar.height * (1 + audioLevel * freqModifier * 2);
      
      child.scale.y = height;
      child.position.y = height / 2;
    });
    
    groupRef.current.rotation.y = time * 0.5;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {bars.map((bar, i) => {
        const x = Math.cos(bar.angle) * 1.5;
        const z = Math.sin(bar.angle) * 1.5;
        
        return (
          <mesh key={i} position={[x, 0, z]}>
            <boxGeometry args={[0.05, 1, 0.05]} />
            <meshBasicMaterial 
              color={new THREE.Color(0.2, 1, 1)} 
              transparent 
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

interface SoundWaveVisualizationProps {
  audioLevel: number;
  frequency: number;
  isSpeaking: boolean;
  robotState: string;
}

export default function SoundWaveVisualization({ 
  audioLevel, 
  frequency, 
  isSpeaking,
  robotState 
}: SoundWaveVisualizationProps) {
  if (!isSpeaking) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <SoundWaves 
          audioLevel={audioLevel} 
          frequency={frequency}
          robotState={robotState}
        />
        <FrequencyBars audioLevel={audioLevel} frequency={frequency} />
      </Canvas>
    </div>
  );
}
