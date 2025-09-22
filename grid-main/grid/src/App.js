import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const speedRef = useRef(0.15);
  const waveXRef = useRef(0);
  const directionRef = useRef(1);
  const displayHueRef = useRef(180);
  const targetHueRef = useRef(180);
  const animationFrameIdRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [bounceCount, setBounceCount] = useState(0);
  useEffect(() => {
    document.title = "Grid Animation";
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let rows = 15;
    let cols = 20;
    let cellSize;

    function resizeCanvas() {
      const availableWidth = window.innerWidth * 0.7;
      const availableHeight = window.innerHeight * 0.7;
      const cellWidth = Math.floor(availableWidth / cols);
      const cellHeight = Math.floor(availableHeight / rows);
      cellSize = Math.min(cellWidth, cellHeight);
      canvas.width = cols * cellSize;
      canvas.height = rows * cellSize;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const trail = 6;

    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let x = 0; x < cols; x++) {
        let dist = directionRef.current === 1 ? waveXRef.current - x : x - waveXRef.current;
        for (let y = 0; y < rows; y++) {
          if (dist >= 0 && dist < trail) {
            let brightness = 1 - dist / trail;
            ctx.fillStyle = `hsla(${displayHueRef.current}, 100%, 50%, ${brightness})`;
          } else {
            ctx.fillStyle = "black";
          }
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - 2, cellSize - 2);
        }
      }
    }
    
    function animate() {
      const hueDifference = targetHueRef.current - displayHueRef.current;
      displayHueRef.current += hueDifference * 0.005;

      drawGrid();
      waveXRef.current += speedRef.current * directionRef.current;

      if (waveXRef.current >= cols - 1 || waveXRef.current <= 0) {
        directionRef.current *= -1;
        targetHueRef.current = (targetHueRef.current + 60) % 360;
        setBounceCount(prevCount => prevCount + 1);
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    }
    
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []); 
  // --- Animation Trigger ---
  const triggerInteraction = () => {
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 300);
  };

  // --- Button Handlers ---
  const handleReset = () => {
    speedRef.current = 0.15;
    waveXRef.current = 0;
    directionRef.current = 1;
    displayHueRef.current = 180;
    targetHueRef.current = 180;
    setBounceCount(0); // Reset the counter
    triggerInteraction();
  };

  const handleFast = () => {
    speedRef.current = Math.min(speedRef.current * 1.5, 1); // Cap speed
    triggerInteraction();
  };

  const handleSlow = () => {
    speedRef.current = Math.max(speedRef.current / 1.5, 0.05); // Set a minimum speed
    triggerInteraction();
  };

  const retroButtonStyles = "px-6 py-2 font-mono text-white bg-gray-700 border-2 border-gray-600 rounded-md shadow-[4px_4px_0px_#222] hover:bg-gray-600 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all";
  const animationStyles = `@keyframes pulse-grid { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.01); } } .animate-pulse-grid { animation: pulse-grid 0.3s ease-in-out; }`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-4">
      <style>{animationStyles}</style>
      
      {/* Main container for grid and counter */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
        <div className={`bg-gray-700 p-4 border-4 border-gray-600 rounded-lg shadow-lg transition-transform duration-300 ${isInteracting ? 'animate-pulse-grid' : ''}`}>
          <canvas ref={canvasRef} />
        </div>
        
        <div className="flex flex-col items-center justify-center p-4 bg-gray-700 border-4 border-gray-600 rounded-lg shadow-lg h-32 w-48">
          <span className="text-sm font-mono text-gray-400 tracking-widest">BOUNCES</span>
          <span className="text-6xl font-mono text-white font-bold mt-2">{bounceCount}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex space-x-4 mt-8">
        <button onClick={handleSlow} className={retroButtonStyles}>Slow</button>
        <button onClick={handleReset} className={retroButtonStyles}>Reset</button>
        <button onClick={handleFast} className={retroButtonStyles}>Fast</button>
      </div>
    </div>
  );
}
