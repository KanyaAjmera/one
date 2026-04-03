import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';

const SOLVED_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export default function Puzzle() {
  const navigate = useNavigate();
  const [tiles, setTiles] = useState<number[]>([...SOLVED_STATE]);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const shuffle = useCallback(() => {
    let current = [...SOLVED_STATE];
    // Make 100 random valid moves to ensure solvability
    for (let i = 0; i < 100; i++) {
      const zeroIdx = current.indexOf(0);
      const validMoves = [];
      if (zeroIdx >= 3) validMoves.push(zeroIdx - 3); // up
      if (zeroIdx < 6) validMoves.push(zeroIdx + 3);  // down
      if (zeroIdx % 3 !== 0) validMoves.push(zeroIdx - 1); // left
      if (zeroIdx % 3 !== 2) validMoves.push(zeroIdx + 1); // right
      
      const moveIdx = validMoves[Math.floor(Math.random() * validMoves.length)];
      [current[zeroIdx], current[moveIdx]] = [current[moveIdx], current[zeroIdx]];
    }
    setTiles(current);
    setIsWon(false);
    setMoves(0);
  }, []);

  useEffect(() => {
    shuffle();
  }, [shuffle]);

  const handleTileClick = (index: number) => {
    if (isWon) return;
    
    const zeroIdx = tiles.indexOf(0);
    const isAdjacent = 
        (index === zeroIdx - 1 && zeroIdx % 3 !== 0) || // left
        (index === zeroIdx + 1 && zeroIdx % 3 !== 2) || // right
        (index === zeroIdx - 3) || // up
        (index === zeroIdx + 3);   // down

    if (isAdjacent) {
        const newTiles = [...tiles];
        [newTiles[index], newTiles[zeroIdx]] = [newTiles[zeroIdx], newTiles[index]];
        setTiles(newTiles);
        setMoves(m => m + 1);
        
        // Check win
        if (newTiles.every((val, i) => val === SOLVED_STATE[i])) {
            setIsWon(true);
        }
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 md:p-8 relative flex flex-col">
      <div className="fixed inset-0 z-0"><AnoAI /></div>
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/games')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Numbers Puzzle</h1>
          </div>
          <div className="text-xl font-mono bg-white/10 px-4 py-2 rounded-xl">Moves: {moves}</div>
        </header>

        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
            
            {isWon && (
                <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <Trophy className="w-24 h-24 text-yellow-400 mb-6 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce" />
                    <h2 className="text-4xl font-bold text-white mb-2 text-center">You solved it!</h2>
                    <p className="text-xl text-white/70 mb-8">in {moves} moves</p>
                    <button 
                        onClick={shuffle}
                        className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)]"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Play Again
                    </button>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] w-full max-w-md relative z-10">
                {tiles.map((tile, i) => (
                    <button
                        key={i}
                        onClick={() => handleTileClick(i)}
                        disabled={tile === 0 || isWon}
                        className={`
                            relative w-full aspect-square text-4xl sm:text-5xl font-bold rounded-xl flex items-center justify-center transition-all duration-200
                            ${tile === 0 
                                ? 'bg-transparent shadow-inner' 
                                : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:bg-white/20 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg'}
                            ${tile === SOLVED_STATE[i] && tile !== 0 ? 'ring-2 ring-green-400/50 bg-green-500/10' : ''}
                        `}
                    >
                        {tile !== 0 && (
                            <span className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent drop-shadow-md">
                                {tile}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <button 
                onClick={shuffle}
                className="mt-10 flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors z-10"
            >
                <RefreshCw className="w-4 h-4" />
                Shuffle Puzzle
            </button>
        </div>
      </div>
    </div>
  );
}
