import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

const TREE_HEIGHT = 8;

export function TreeStar() {
    const groupRef = useRef<THREE.Group>(null!);
    const progress = useAppStore((s) => s.progress);

    const targetY = TREE_HEIGHT + 1.2;
    const chaosY = 12;

    useFrame((state) => {
        const y = THREE.MathUtils.lerp(targetY, chaosY, progress * 0.5);
        groupRef.current.position.y = y;
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;

        // Scale down during chaos
        const scale = THREE.MathUtils.lerp(1, 0.5, progress);
        groupRef.current.scale.setScalar(scale);
    });

    return (
        <group ref={groupRef} position={[0, targetY, 0]}>
            {/* Main star body */}
            <mesh>
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    color="#FFD700"
                    emissive="#FFD700"
                    emissiveIntensity={1.5}
                    metalness={1}
                    roughness={0}
                    toneMapped={false}
                />
            </mesh>

            {/* Glow sphere */}
            <mesh>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshBasicMaterial color="#FFD700" transparent opacity={0.15} />
            </mesh>

            {/* Point light for glow effect */}
            <pointLight color="#FFD700" intensity={2} distance={5} />
        </group>
    );
}
