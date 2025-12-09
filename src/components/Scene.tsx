import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { Effects } from './Effects';
import { ChristmasTree } from './ChristmasTree';
import { useAppStore } from '../store/useAppStore';
import { useFrame } from '@react-three/fiber';

function AnimationDriver() {
    const tick = useAppStore((s) => s.tick);
    useFrame((_, delta) => {
        tick(delta);
    });
    return null;
}

function CameraRig() {
    const cameraOffset = useAppStore((s) => s.cameraOffset);
    useFrame(({ camera }) => {
        // Subtle camera rotation based on hand position
        camera.position.x += (cameraOffset.x * 5 - camera.position.x) * 0.02;
        camera.position.y += (4 + cameraOffset.y * 3 - camera.position.y) * 0.02;
        camera.lookAt(0, 3, 0);
    });
    return null;
}

export function Scene() {
    return (
        <Canvas gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
            <color attach="background" args={['#050505']} />
            <fog attach="fog" args={['#050505', 15, 40]} />

            <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={45} />
            <OrbitControls
                enablePan={false}
                enableZoom={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
                target={[0, 3, 0]}
            />

            <ambientLight intensity={0.1} />
            <pointLight position={[5, 10, 5]} intensity={0.5} color="#FFD700" />
            <pointLight position={[-5, 8, -5]} intensity={0.3} color="#046307" />

            <Suspense fallback={null}>
                <Environment preset="lobby" background={false} />
                <ChristmasTree />
            </Suspense>

            <AnimationDriver />
            <CameraRig />
            <Effects />
        </Canvas>
    );
}
