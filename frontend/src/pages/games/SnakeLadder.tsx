import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dices, Trophy, RefreshCw, Info } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';

// Board is 1-100.
const SNAKES: Record<number, number> = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const LADDERS: Record<number, number> = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

export default function SnakeLadder() {
  const navigate = useNavigate();
  const [position, setPosition] = useState(0); 
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Roll the dice to start!');
  const [isRolling, setIsRolling] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const rollDice = useCallback(() => {
    if (isWon || isRolling) return;
    
    setIsRolling(true);
    // Fake rolling animation delay
    setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setMoves(m => m + 1);

        let newPos = position + roll;
        
        if (newPos > 100) {
            setMessage(`Rolled a ${roll}, but you need exactly ${100 - position} to win!`);
            setIsRolling(false);
            return;
        }

        if (newPos === 100) {
            setPosition(100);
            setIsWon(true);
            setMessage(`Rolled a ${roll}. YOU WIN! 🎉`);
            setIsRolling(false);
            return;
        }

        let currentMsg = `Rolled a ${roll}. `;
        
        // Check for Snakes or Ladders
        if (SNAKES[newPos]) {
            currentMsg += `Oh no! Bitten by a snake. Sliding down to ${SNAKES[newPos]}! 🐍`;
            newPos = SNAKES[newPos];
        } else if (LADDERS[newPos]) {
            currentMsg += `Yay! Found a ladder. Climbing up to ${LADDERS[newPos]}! 🪜`;
            newPos = LADDERS[newPos];
        } else {
            currentMsg += `Moved to ${newPos}.`;
        }

        setPosition(newPos);
        setMessage(currentMsg);
        setIsRolling(false);

    }, 500);
  }, [position, isWon, isRolling]);

  const resetGame = () => {
      setPosition(0);
      setMoves(0);
      setIsWon(false);
      setMessage('Roll the dice to start!');
  };

  // Generate board cells (10x10) bottom to top, alternating directions
  const cells = [];
  for (let row = 9; row >= 0; row--) {
      for (let col = 0; col < 10; col++) {
          const num = row % 2 !== 0 
            ? (row * 10) + col + 1  // Left to Right
            : (row * 10) + (9 - col) + 1; // Right to Left
          cells.push(num);
      }
  }

  return (
    <div className="w-full min-h-screen text-foreground p-4 md:p-8 relative flex flex-col">
      <div className="fixed inset-0 z-0"><AnoAI /></div>
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Sidebar / Controls */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
            <header className="flex items-center gap-4">
            <button onClick={() => navigate('/games')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95">
                <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Snake & Ladder</h1>
            </header>

            <div className="bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col gap-6 shadow-2xl">
                
                <div className="text-center">
                    <div className="text-white/50 text-sm uppercase tracking-widest mb-1">Current Position</div>
                    <div className="text-6xl font-bold font-mono text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                        {position === 0 ? 'Start' : position}
                    </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 text-center min-h-[80px] flex items-center justify-center border border-white/5 text-sm">
                    {message}
                </div>

                <div className="flex justify-between items-center px-2">
                    <span className="text-white/50">Rolls: {moves}</span>
                    <span className="text-white/50 flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" /> Target: 100
                    </span>
                </div>

                <button
                    onClick={rollDice}
                    disabled={isWon || isRolling}
                    className={`
                        w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg
                        ${isWon || isRolling 
                            ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95'}
                    `}
                >
                    <Dices className={`w-6 h-6 ${isRolling ? 'animate-spin' : ''}`} />
                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                </button>

                {isWon && (
                    <button onClick={resetGame} className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors">
                        <RefreshCw className="w-5 h-5"/> Play Again
                    </button>
                )}
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-xs text-white/50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/70 mb-1"><Info className="w-4 h-4"/> Game Info</div>
                <p>• Reach exactly 100 to win.</p>
                <p>• <span className="text-emerald-400 font-bold">Ladders</span> go up, <span className="text-red-400 font-bold">Snakes</span> go down.</p>
                <p>• This is a solo time-attack mode to finish in minimum rolls!</p>
            </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-4 sm:p-8 flex items-center justify-center shadow-2xl overflow-hidden relative">
            
            <div className="w-full max-w-2xl aspect-square grid grid-cols-10 grid-rows-10 gap-1 sm:gap-2">
                {cells.map(num => {
                    const isSnake = Object.keys(SNAKES).includes(num.toString());
                    const snakeDest = SNAKES[num];
                    const isLadder = Object.keys(LADDERS).includes(num.toString());
                    const ladderDest = LADDERS[num];
                    
                    const isCurrentPos = position === num;

                    return (
                        <div 
                            key={num}
                            className={`
                                relative flex items-center justify-center rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all
                                ${isCurrentPos ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.8)] scale-110 z-10' : 'bg-white/5 text-white/40 border border-white/5'}
                                ${isSnake && !isCurrentPos ? 'border-red-500/30 text-red-400/70' : ''}
                                ${isLadder && !isCurrentPos ? 'border-emerald-500/30 text-emerald-400/70' : ''}
                            `}
                        >
                            {num}
                            
                            {/* Indicators */}
                            {!isCurrentPos && isSnake && <span className="absolute bottom-1 right-1 text-[8px] sm:text-[10px] opacity-70">🐍{snakeDest}</span>}
                            {!isCurrentPos && isLadder && <span className="absolute bottom-1 right-1 text-[8px] sm:text-[10px] opacity-70">🪜{ladderDest}</span>}
                            
                            {/* Player piece pulse */}
                            {isCurrentPos && (
                                <span className="absolute inset-0 rounded-xl ring-2 ring-white animate-ping opacity-50"></span>
                            )}
                        </div>
                    );
                })}
            </div>

            {isWon && (
                <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <Trophy className="w-32 h-32 text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-bounce" />
                    <h2 className="text-5xl font-bold text-white mb-4 text-center">VICTORY!</h2>
                    <p className="text-2xl text-white/70">You finished in {moves} rolls.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
