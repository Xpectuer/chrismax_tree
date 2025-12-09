import { create } from 'zustand';

type TreeState = 'FORMED' | 'CHAOS';

interface AppState {
    treeState: TreeState;
    progress: number; // 0 = FORMED, 1 = CHAOS
    targetProgress: number;
    setTreeState: (state: TreeState) => void;
    setTargetProgress: (progress: number) => void;
    tick: (delta: number) => void;

    // Camera control from hand tracking
    cameraOffset: { x: number; y: number };
    setCameraOffset: (offset: { x: number; y: number }) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    treeState: 'FORMED',
    progress: 0,
    targetProgress: 0,
    cameraOffset: { x: 0, y: 0 },

    setTreeState: (state) => set({ treeState: state, targetProgress: state === 'CHAOS' ? 1 : 0 }),
    setTargetProgress: (targetProgress) => set({ targetProgress }),
    setCameraOffset: (cameraOffset) => set({ cameraOffset }),

    tick: (delta) => {
        const { progress, targetProgress } = get();
        const lerpSpeed = 2.5;
        const newProgress = progress + (targetProgress - progress) * Math.min(1, delta * lerpSpeed);
        if (Math.abs(newProgress - progress) > 0.0001) {
            set({ progress: newProgress });
        }
    },
}));
