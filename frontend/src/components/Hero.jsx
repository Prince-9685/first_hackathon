import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text3D, Center } from '@react-three/drei';
import { ArrowRight, Activity } from 'lucide-react';
import gsap from 'gsap';

function FloatingCity() {
  const groupRef = useRef();

  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[2, 1]} />
          <meshStandardMaterial color="#00FFA3" wireframe transparent opacity={0.3} />
        </mesh>
        <mesh position={[0, 0, 0]} scale={0.95}>
          <boxGeometry args={[2.5, 2.5, 2.5]} />
          <meshStandardMaterial color="#8B5CF6" wireframe transparent opacity={0.15} />
        </mesh>
      </Float>
    </group>
  );
}

export function Hero({ onEnter }) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00FFA3" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#8B5CF6" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <FloatingCity />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center select-none pointer-events-none">
        
        <div className="glass-panel px-6 py-2 mb-8 flex items-center gap-3 text-primary text-sm font-medium tracking-widest uppercase">
          <Activity size={16} className="animate-pulse" />
          <span>Live Traffic AI Core Online</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          SMART <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">NEXUS</span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-white/60 mb-12 font-light leading-relaxed">
          The next generation of urban mobility. Adaptive signal arrays, predictive violation detection, and automated green corridors powered by real-time intelligence.
        </p>

        <button 
          onClick={onEnter}
          className="pointer-events-auto flex items-center justify-center gap-2 group relative px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10 group-hover:text-white transition-colors duration-300">Initialize System</span>
          <ArrowRight size={20} className="relative z-10 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
        </button>

      </div>
    </div>
  );
}
