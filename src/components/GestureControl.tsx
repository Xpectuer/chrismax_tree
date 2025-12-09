import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import type { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { useAppStore } from '../store/useAppStore';

export function GestureControl() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
    const animationFrameRef = useRef<number>(0);

    const setTreeState = useAppStore((s) => s.setTreeState);
    const setCameraOffset = useAppStore((s) => s.setCameraOffset);
    const treeState = useAppStore((s) => s.treeState);

    const processResults = useCallback(
        (results: GestureRecognizerResult) => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            // Clear and draw video
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];

                // Draw hand landmarks
                ctx.fillStyle = '#FFD700';
                landmarks.forEach((lm) => {
                    ctx.beginPath();
                    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3, 0, 2 * Math.PI);
                    ctx.fill();
                });

                // Calculate hand center for camera control
                const centerX = landmarks.reduce((sum, lm) => sum + lm.x, 0) / landmarks.length;
                const centerY = landmarks.reduce((sum, lm) => sum + lm.y, 0) / landmarks.length;

                // Map to camera offset (-1 to 1, inverted for natural feel)
                setCameraOffset({
                    x: -(centerX - 0.5) * 2,
                    y: (centerY - 0.5) * 2,
                });

                // Check gesture (Open_Palm = Chaos, Closed_Fist = Formed)
                if (results.gestures && results.gestures.length > 0) {
                    const gesture = results.gestures[0][0];
                    if (gesture.categoryName === 'Open_Palm' && treeState !== 'CHAOS') {
                        setTreeState('CHAOS');
                    } else if (gesture.categoryName === 'Closed_Fist' && treeState !== 'FORMED') {
                        setTreeState('FORMED');
                    }
                }
            }
        },
        [setCameraOffset, setTreeState, treeState]
    );

    const predictWebcam = useCallback(() => {
        const video = videoRef.current;
        const gestureRecognizer = gestureRecognizerRef.current;

        if (!video || !gestureRecognizer || video.readyState < 2) {
            animationFrameRef.current = requestAnimationFrame(predictWebcam);
            return;
        }

        const results = gestureRecognizer.recognizeForVideo(video, performance.now());
        processResults(results);

        animationFrameRef.current = requestAnimationFrame(predictWebcam);
    }, [processResults]);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                // Initialize MediaPipe
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );

                const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numHands: 1,
                });

                if (!mounted) return;
                gestureRecognizerRef.current = gestureRecognizer;

                // Get webcam
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: 'user' },
                });

                if (!mounted) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                setIsLoading(false);
                predictWebcam();
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to initialize gesture control');
                    setIsLoading(false);
                }
            }
        };

        init();

        return () => {
            mounted = false;
            cancelAnimationFrame(animationFrameRef.current);
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
            }
        };
    }, [predictWebcam]);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="relative rounded-xl overflow-hidden border-2 border-christmas-gold/50 shadow-2xl bg-black/80">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <div className="text-christmas-gold animate-pulse">🎄 Loading Camera...</div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                        <div className="text-red-400 text-xs text-center">{error}</div>
                    </div>
                )}
                <video
                    ref={videoRef}
                    className="w-40 h-30 object-cover opacity-50"
                    playsInline
                    muted
                    style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={240}
                    className="absolute inset-0 w-full h-full"
                    style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute bottom-1 left-1 text-[10px] text-christmas-gold/70 font-mono">
                    {treeState === 'CHAOS' ? '✋ UNLEASH' : '✊ FORMED'}
                </div>
            </div>
        </div>
    );
}
