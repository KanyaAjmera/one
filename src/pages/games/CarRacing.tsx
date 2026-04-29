import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';

export default function CarRacing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game state refs for animation loop
  const gameState = useRef({
    carX: 150, // center (canvas width 300)
    speed: 5,
    obstacles: [] as {x: number, y: number, width: number, height: number, color: string}[],
    linesY: 0,
    score: 0,
    lastObstacleTime: 0,
    keys: { ArrowLeft: false, ArrowRight: false }
  });

  const animationRef = useRef<number>(0);

  const initGame = useCallback(() => {
    gameState.current = {
      carX: 150,
      speed: 6,
      obstacles: [],
      linesY: 0,
      score: 0,
      lastObstacleTime: 0,
      keys: { ArrowLeft: false, ArrowRight: false }
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const state = gameState.current;

    // Clear background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);

    // Draw road edges
    ctx.fillStyle = '#555';
    ctx.fillRect(0, 0, 20, height);
    ctx.fillRect(width - 20, 0, 20, height);

    // Draw dashed center line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    state.linesY += state.speed;
    if (state.linesY > 40) state.linesY = 0;
    
    for (let i = -40; i < height; i += 40) {
        ctx.fillRect(width / 2 - 2, i + state.linesY, 4, 20);
    }

    // Draw player car
    const carY = height - 80;
    const carWidth = 40;
    const carHeight = 60;
    
    // Car body
    ctx.fillStyle = '#ef4444'; // Red
    ctx.fillRect(state.carX - carWidth/2, carY, carWidth, carHeight);
    
    // Car details (windshield)
    ctx.fillStyle = '#93c5fd'; // Light blue
    ctx.fillRect(state.carX - carWidth/2 + 5, carY + 10, carWidth - 10, 15);
    ctx.fillRect(state.carX - carWidth/2 + 5, carY + 40, carWidth - 10, 10);

    // Draw obstacles
    state.obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Yellow windshield for enemy cars
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(obs.x + 5, obs.y + 10, obs.width - 10, 15);
        ctx.fillRect(obs.x + 5, obs.y + obs.height - 20, obs.width - 10, 10);
    });

  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlaying || isGameOver) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;
    
    // Update car position
    if (state.keys.ArrowLeft) state.carX -= 6;
    if (state.keys.ArrowRight) state.carX += 6;
    
    // Clamp to road bounds
    if (state.carX < 40) state.carX = 40;
    if (state.carX > canvas.width - 40) state.carX = canvas.width - 40;

    // Update score
    state.score += 1;
    if (state.score % 10 === 0) setScore(state.score);

    // Increase speed gradually
    if (state.score % 500 === 0 && state.speed < 15) {
        state.speed += 1;
    }

    // Add obstacles
    if (Date.now() - state.lastObstacleTime > (1500 - (state.speed * 50))) {
        const obsWidth = 40;
        const obsHeight = 60;
        // Random X position between road edges
        const obsX = 30 + Math.random() * (canvas.width - 60 - obsWidth);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        const obsColor = colors[Math.floor(Math.random() * colors.length)];
        
        state.obstacles.push({
            x: obsX, y: -obsHeight, width: obsWidth, height: obsHeight, color: obsColor
        });
        state.lastObstacleTime = Date.now();
    }

    // Update obstacles and check collisions
    const carWidth = 40;
    const carHeight = 60;
    const carY = canvas.height - 80;

    for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.y += state.speed;

        // Collision logic
        const hitX = state.carX - carWidth/2 < obs.x + obs.width && state.carX + carWidth/2 > obs.x;
        const hitY = carY < obs.y + obs.height && carY + carHeight > obs.y;
        
        if (hitX && hitY) {
            setIsPlaying(false);
            setIsGameOver(true);
            setHighScore(prev => Math.max(prev, state.score));
            return; // end loop early
        }

        // Remove off-screen
        if (obs.y > canvas.height) {
            state.obstacles.splice(i, 1);
        }
    }

    draw(ctx, canvas.width, canvas.height);
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isGameOver, draw]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            gameState.current.keys[e.key] = true;
            e.preventDefault();
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            gameState.current.keys[e.key] = false;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Start/Stop animation loop
  useEffect(() => {
    if (isPlaying && !isGameOver) {
        animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, isGameOver, gameLoop]);

  return (
    <div className="w-full min-h-screen text-foreground p-4 md:p-8 relative flex flex-col">
      <div className="fixed inset-0 z-0"><AnoAI /></div>
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/games')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Car Racing</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-lg bg-white/10 px-4 py-2 rounded-xl">Score: <span className="font-bold">{score}</span></div>
             <div className="text-sm bg-yellow-500/20 text-yellow-500 px-3 py-2 rounded-xl border border-yellow-500/30">High: {highScore}</div>
          </div>
        </header>

        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-4 md:p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
            
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <canvas 
                    ref={canvasRef}
                    width={320}
                    height={450}
                    className="block bg-neutral-900"
                />

                {!isPlaying && !isGameOver && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Play className="w-16 h-16 text-white mb-4 animate-pulse" />
                        <button 
                            onClick={initGame}
                            className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                        >
                            Start Engine
                        </button>
                        <p className="mt-6 text-white/50 text-sm">Use ← → arrow keys to steer</p>
                    </div>
                )}

                {isGameOver && (
                    <div className="absolute inset-0 bg-red-900/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <AlertCircle className="w-20 h-20 text-red-400 mb-4 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
                        <h2 className="text-4xl font-black text-white mb-2">CRASHED!</h2>
                        <p className="text-xl text-white/80 mb-8">Final Score: {score}</p>
                        
                        <button 
                            onClick={initGame}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 hover:scale-105 transition-all shadow-xl"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Restart Race
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Controls mapping */}
            {isPlaying && !isGameOver && (
                <div className="mt-8 flex gap-8 md:hidden">
                    <button 
                        onPointerDown={(e) => { e.preventDefault(); gameState.current.keys.ArrowLeft = true; }}
                        onPointerUp={(e) => { e.preventDefault(); gameState.current.keys.ArrowLeft = false; }}
                        onPointerLeave={() => gameState.current.keys.ArrowLeft = false}
                        className="w-20 h-20 rounded-full bg-white/10 active:bg-white/30 flex items-center justify-center touch-manipulation"
                    >
                        <ChevronLeft className="w-10 h-10 text-white" />
                    </button>
                    <button 
                        onPointerDown={(e) => { e.preventDefault(); gameState.current.keys.ArrowRight = true; }}
                        onPointerUp={(e) => { e.preventDefault(); gameState.current.keys.ArrowRight = false; }}
                        onPointerLeave={() => gameState.current.keys.ArrowRight = false}
                        className="w-20 h-20 rounded-full bg-white/10 active:bg-white/30 flex items-center justify-center touch-manipulation"
                    >
                        <ChevronRight className="w-10 h-10 text-white" />
                    </button>
                </div>
            )}
            
        </div>
      </div>
    </div>
  );
}
