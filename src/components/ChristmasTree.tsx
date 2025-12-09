import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Polaroids } from './Polaroids';
import { TreeStar } from './TreeStar';

export function ChristmasTree() {
    return (
        <group position={[0, 0, 0]}>
            {/* Tree Trunk */}
            <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
                <meshStandardMaterial color="#4a3728" roughness={0.9} />
            </mesh>

            {/* Foliage Particles */}
            <Foliage />

            {/* Ornaments */}
            <Ornaments />

            {/* Polaroid Photos */}
            <Polaroids />

            {/* Tree Star */}
            <TreeStar />
        </group>
    );
}
