import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

const POLAROID_COUNT = 12;
const TREE_HEIGHT = 8;
const TREE_RADIUS = 3;
const CHAOS_RADIUS = 10;

interface PolaroidData {
    targetPos: THREE.Vector3;
    chaosPos: THREE.Vector3;
    rotation: THREE.Euler;
    imageIndex: number;
}

function generatePolaroids(): PolaroidData[] {
    const polaroids: PolaroidData[] = [];

    for (let i = 0; i < POLAROID_COUNT; i++) {
        const t = (i + 0.5) / POLAROID_COUNT;
        const y = 2 + t * (TREE_HEIGHT - 3);
        const radiusAtHeight = (TREE_RADIUS * (1 - t * 0.7)) * 1.1;
        const angle = i * (Math.PI * 2) / POLAROID_COUNT + Math.PI / 6;
        const x = Math.cos(angle) * radiusAtHeight;
        const z = Math.sin(angle) * radiusAtHeight;

        // Chaos position
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = CHAOS_RADIUS * Math.cbrt(Math.random());

        polaroids.push({
            targetPos: new THREE.Vector3(x, y, z),
            chaosPos: new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta) + 4,
                r * Math.cos(phi)
            ),
            rotation: new THREE.Euler(
                (Math.random() - 0.5) * 0.3,
                angle + Math.PI,
                (Math.random() - 0.5) * 0.2
            ),
            imageIndex: i,
        });
    }

    return polaroids;
}

// Polaroid frame component
function Polaroid({ data, progress }: { data: PolaroidData; progress: number }) {
    const groupRef = useRef<THREE.Group>(null!);
    const currentPos = useRef(data.targetPos.clone());

    useFrame(() => {
        currentPos.current.lerpVectors(data.targetPos, data.chaosPos, progress * 0.7);
        groupRef.current.position.copy(currentPos.current);

        // Rotate to face outward from tree center + chaos rotation
        const baseRotation = Math.atan2(currentPos.current.x, currentPos.current.z);
        groupRef.current.rotation.y = baseRotation + progress * Math.PI * 2;
        groupRef.current.rotation.x = data.rotation.x * (1 + progress);
        groupRef.current.rotation.z = data.rotation.z * (1 + progress * 2);
    });

    // Generate a gradient/pattern as placeholder for photo
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;

        // Create a festive gradient
        const hue = (data.imageIndex * 30) % 360;
        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
        gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
        gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 40%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        // Add some festive shapes
        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            ctx.beginPath();
            ctx.arc(x, y, 10 + Math.random() * 20, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }, [data.imageIndex]);

    return (
        <group ref={groupRef}>
            {/* White polaroid frame */}
            <mesh>
                <boxGeometry args={[0.5, 0.6, 0.02]} />
                <meshStandardMaterial color="#FAFAFA" roughness={0.3} />
            </mesh>

            {/* Photo area */}
            <mesh position={[0, 0.05, 0.011]}>
                <planeGeometry args={[0.4, 0.4]} />
                <meshBasicMaterial map={texture} />
            </mesh>

            {/* Gold clip at top */}
            <mesh position={[0, 0.32, 0]}>
                <boxGeometry args={[0.15, 0.04, 0.04]} />
                <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}

export function Polaroids() {
    const polaroids = useMemo(() => generatePolaroids(), []);
    const progress = useAppStore((s) => s.progress);

    return (
        <group>
            {polaroids.map((data, i) => (
                <Polaroid key={i} data={data} progress={progress} />
            ))}
        </group>
    );
}
