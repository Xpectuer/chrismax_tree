import './index.css';
import { Scene } from './components/Scene';
import { GestureControl } from './components/GestureControl';

function App() {
  return (
    <div className="w-full h-full relative bg-black">
      {/* 3D Scene */}
      <Scene />

      {/* Gesture Control Overlay */}
      <GestureControl />

      {/* Title Overlay */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-lg tracking-wide">
          Grand Luxury
        </h1>
        <h2 className="text-2xl md:text-3xl font-serif text-christmas-gold/80 tracking-widest mt-1">
          Christmas Tree
        </h2>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 text-white/60 text-sm font-mono">
        <p>✋ Open Palm → Unleash Chaos</p>
        <p>✊ Closed Fist → Form Tree</p>
        <p>🖐️ Move Hand → Control Camera</p>
      </div>
    </div>
  );
}

export default App;
