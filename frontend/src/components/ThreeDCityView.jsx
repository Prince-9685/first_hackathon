import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

// Maps node IDs to abstract 3D grid layout
const CITY_GRID_POSITIONS = {
  'MNIT Jaipur': [4, 0, 4],
  'World Trade Park': [-4, 0, 4],
  'Rajasthan University': [-4, 0, -4],
  'Jhalana': [4, 0, -4],
  'Sindhi Camp': [0, 0, 0],
  'MI Road': [2, 0, 0],
  'Ajmeri Gate': [2, 0, 2],
  'Badi Choupad': [0, 0, 2],
  'SMS Hospital': [-2, 0, 2],
  'Rambagh Circle': [-2, 0, 0],
  'C-Scheme': [0, 0, -2]
};

function CityBuilding({ position, density, signal }) {
  const meshRef = useRef();
  
  // Height responds dynamically to traffic density
  const targetHeight = 1 + (density / 100) * 8;
  const color = signal === 'red' ? '#ef4444' : signal === 'yellow' ? '#f59e0b' : '#22c55e';

  useFrame(() => {
    if (meshRef.current) {
      // Smooth interpolation for building height bounds
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetHeight, 0.05);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.6} 
          roughness={0.2} 
          metalness={0.9} 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Decorative inner core */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[0.5, 4, 0.5]} />
        <meshBasicMaterial color="#ffffff" opacity={0.1} transparent />
      </mesh>
    </group>
  );
}

export function ThreeDCityView({ nodes }) {
  return (
    <div className="w-full h-full bg-[#030303] relative border-t border-white/5">
      <div className="absolute top-4 left-4 z-10">
        <div className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">
          मार्गदर्शक AI 3D Digital Twin
        </div>
        <div className="text-white/40 text-xs">
          Interactive WebGL Smart City Visualization
        </div>
      </div>
      
      <Canvas camera={{ position: [8, 10, 8], fov: 45 }}>
        <color attach="background" args={['#030303']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, 5, -10]} intensity={2} color="#8b5cf6" />
        <directionalLight position={[0, 10, 5]} intensity={0.5} color="#00FFA3" />
        
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          sectionColor="#333333" 
          cellColor="#111111" 
          sectionSize={4}
          cellSize={1}
        />

        {nodes.map((node) => (
          <CityBuilding 
            key={node.id} 
            position={CITY_GRID_POSITIONS[node.id] || [0,0,0]} 
            density={node.density} 
            signal={node.signal} 
          />
        ))}

        <OrbitControls 
          autoRotate 
          autoRotateSpeed={0.8} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1} 
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
