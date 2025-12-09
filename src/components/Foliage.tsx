import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

const PARTICLE_COUNT = 15000;
const TREE_HEIGHT = 8;
const TREE_RADIUS = 3;
const CHAOS_RADIUS = 12;

// Generate positions on a cone surface
function generateConePosition(i: number, total: number): THREE.Vector3 {
    const t = i / total;
    const y = 1 + t * TREE_HEIGHT;
    const radiusAtHeight = TREE_RADIUS * (1 - t * 0.95);
    const angle = i * 2.399963; // Golden angle
    const x = Math.cos(angle) * radiusAtHeight * (0.7 + Math.random() * 0.6);
    const z = Math.sin(angle) * radiusAtHeight * (0.7 + Math.random() * 0.6);
    return new THREE.Vector3(x, y, z);
}

// Generate random position in a sphere
function generateChaosPosition(): THREE.Vector3 {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = CHAOS_RADIUS * Math.cbrt(Math.random());
    return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) + 4,
        r * Math.cos(phi)
    );
}

const vertexShader = `
  attribute vec3 chaosPosition;
  attribute float size;
  uniform float uProgress;
  varying float vBrightness;

  void main() {
    vec3 pos = mix(position, chaosPosition, uProgress);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vBrightness = 0.5 + 0.5 * sin(position.y * 2.0 + uProgress * 3.14159);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vBrightness;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    vec3 color = uColor * (0.8 + vBrightness * 0.4);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function Foliage() {
    const materialRef = useRef<THREE.ShaderMaterial>(null!);
    const progress = useAppStore((s) => s.progress);

    const { positions, chaosPositions, sizes } = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const chaosPositions = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const treePos = generateConePosition(i, PARTICLE_COUNT);
            positions[i * 3] = treePos.x;
            positions[i * 3 + 1] = treePos.y;
            positions[i * 3 + 2] = treePos.z;

            const chaosPos = generateChaosPosition();
            chaosPositions[i * 3] = chaosPos.x;
            chaosPositions[i * 3 + 1] = chaosPos.y;
            chaosPositions[i * 3 + 2] = chaosPos.z;

            sizes[i] = 0.02 + Math.random() * 0.03;
        }

        return { positions, chaosPositions, sizes };
    }, []);

    useFrame(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uProgress.value = progress;
        }
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-chaosPosition"
                    args={[chaosPositions, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    args={[sizes, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    uProgress: { value: 0 },
                    uColor: { value: new THREE.Color('#046307') },
                }}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
