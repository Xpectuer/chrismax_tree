import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

const ORNAMENT_COUNT = 120;
const TREE_HEIGHT = 8;
const TREE_RADIUS = 3;
const CHAOS_RADIUS = 10;

// Ornament types with colors and weights
const ORNAMENT_TYPES = [
    { type: 'ball', colors: ['#FFD700', '#C41E3A', '#1E90FF', '#FFD700', '#FF69B4'], weight: 0.5 },
    { type: 'gift', colors: ['#C41E3A', '#228B22', '#4169E1', '#FFD700'], weight: 1.5 },
    { type: 'light', colors: ['#FFD700', '#FFFFFF', '#FFE4B5'], weight: 0.2 },
];

interface OrnamentData {
    targetPos: THREE.Vector3;
    chaosPos: THREE.Vector3;
    color: THREE.Color;
    scale: number;
    type: string;
    weight: number;
}

function generateOrnaments(): OrnamentData[] {
    const ornaments: OrnamentData[] = [];

    for (let i = 0; i < ORNAMENT_COUNT; i++) {
        const typeIndex = Math.floor(Math.random() * ORNAMENT_TYPES.length);
        const ornamentType = ORNAMENT_TYPES[typeIndex];
        const colorIndex = Math.floor(Math.random() * ornamentType.colors.length);

        // Position on tree (spiral pattern)
        const t = i / ORNAMENT_COUNT;
        const y = 1.5 + t * (TREE_HEIGHT - 1);
        const radiusAtHeight = TREE_RADIUS * (1 - t * 0.85) * 0.85;
        const angle = i * 0.5;
        const x = Math.cos(angle) * radiusAtHeight;
        const z = Math.sin(angle) * radiusAtHeight;

        // Chaos position (spherical)
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = CHAOS_RADIUS * Math.cbrt(Math.random());

        const scale = ornamentType.type === 'light' ? 0.08 : ornamentType.type === 'gift' ? 0.25 : 0.15;

        ornaments.push({
            targetPos: new THREE.Vector3(x, y, z),
            chaosPos: new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta) + 4,
                r * Math.cos(phi)
            ),
            color: new THREE.Color(ornamentType.colors[colorIndex]),
            scale: scale * (0.8 + Math.random() * 0.4),
            type: ornamentType.type,
            weight: ornamentType.weight,
        });
    }

    return ornaments;
}

function BallOrnaments({ ornaments }: { ornaments: OrnamentData[] }) {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const progress = useAppStore((s) => s.progress);
    const balls = ornaments.filter((o) => o.type === 'ball');

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        balls.forEach((ornament, i) => {
            const pos = new THREE.Vector3().lerpVectors(
                ornament.targetPos,
                ornament.chaosPos,
                progress * ornament.weight
            );
            dummy.position.copy(pos);
            dummy.scale.setScalar(ornament.scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, ornament.color);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, balls.length]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial metalness={0.8} roughness={0.2} />
        </instancedMesh>
    );
}

function GiftOrnaments({ ornaments }: { ornaments: OrnamentData[] }) {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const progress = useAppStore((s) => s.progress);
    const gifts = ornaments.filter((o) => o.type === 'gift');

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        gifts.forEach((ornament, i) => {
            const pos = new THREE.Vector3().lerpVectors(
                ornament.targetPos,
                ornament.chaosPos,
                progress * ornament.weight
            );
            dummy.position.copy(pos);
            dummy.rotation.y = state.clock.elapsedTime * 0.5 + i;
            dummy.scale.setScalar(ornament.scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, ornament.color);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, gifts.length]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial metalness={0.3} roughness={0.5} />
        </instancedMesh>
    );
}

function LightOrnaments({ ornaments }: { ornaments: OrnamentData[] }) {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const progress = useAppStore((s) => s.progress);
    const lights = ornaments.filter((o) => o.type === 'light');

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        lights.forEach((ornament, i) => {
            const pos = new THREE.Vector3().lerpVectors(
                ornament.targetPos,
                ornament.chaosPos,
                progress * ornament.weight
            );
            dummy.position.copy(pos);
            // Pulsing scale for lights
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.3;
            dummy.scale.setScalar(ornament.scale * pulse);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            meshRef.current.setColorAt(i, ornament.color);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, lights.length]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial emissive="#FFD700" emissiveIntensity={2} toneMapped={false} />
        </instancedMesh>
    );
}

export function Ornaments() {
    const ornaments = useMemo(() => generateOrnaments(), []);

    return (
        <group>
            <BallOrnaments ornaments={ornaments} />
            <GiftOrnaments ornaments={ornaments} />
            <LightOrnaments ornaments={ornaments} />
        </group>
    );
}
