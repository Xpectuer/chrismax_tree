import { EffectComposer, Bloom } from '@react-three/postprocessing';

export function Effects() {
    return (
        <EffectComposer>
            <Bloom
                luminanceThreshold={0.8}
                luminanceSmoothing={0.3}
                intensity={1.2}
                mipmapBlur
            />
        </EffectComposer>
    );
}
