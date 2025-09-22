import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const speedRef = useRef(0.15);
  const waveXRef = useRef(0);
  const directionRef = useRef(1);
  const displayHueRef = useRef(180);
  const targetHueRef = useRef(180);
  const animationFrameIdRef = useRef(null);
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
        let dist =
          directionRef.current === 1
            ? waveXRef.current - x
            : x - waveXRef.current;
        for (let y = 0; y < rows; y++) {
          if (dist >= 0 && dist < trail) {
            let brightness = 1 - dist / trail;
            ctx.fillStyle = `hsla(${displayHueRef.current}, 100%, 50%, ${brightness})`;
          } else {
            // Changed to a light color for light mode
            ctx.fillStyle = "#f0f0f0";
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
        setBounceCount((prevCount) => prevCount + 1);
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Main container for grid and counter */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
        <div className="bg-white p-4 border-4 border-gray-200 rounded-lg shadow-lg">
          <canvas ref={canvasRef} />
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-white border-4 border-gray-200 rounded-lg shadow-lg h-32 w-48">
          <span className="text-sm font-mono text-gray-500 tracking-widest">
            BOUNCES
          </span>
          <span className="text-6xl font-mono text-gray-900 font-bold mt-2">
            {bounceCount}
          </span>
        </div>
      </div>
    </div>
  );
}
