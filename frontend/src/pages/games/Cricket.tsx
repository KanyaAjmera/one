import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Trophy, PlayCircle } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';

export default function Cricket() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(0);
  const [isOut, setIsOut] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [highScore, setHighScore] = useState(0);

  const flipPage = () => {
    if (isOut) return;
    
    // Outcomes: 0 (Out), 1, 2, 3, 4, 6
    const outcomes = [0, 1, 2, 3, 4, 6];
    const weights = [0.15, 0.35, 0.2, 0.05, 0.15, 0.1]; // Probabilities
    
    const random = Math.random();
    let sum = 0;
    let runs = 0;
    for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (random <= sum) {
            runs = outcomes[i];
            break;
        }
    }

    setBalls(b => b + 1);

    if (runs === 0) {
        setIsOut(true);
        setLastAction('OUT!');
        if (score > highScore) setHighScore(score);
    } else {
        setScore(s => s + runs);
        if (runs === 6) setLastAction('SIX! What a hit! 🏏');
        else if (runs === 4) setLastAction('FOUR! Boundary! 🚀');
        else setLastAction(`+${runs} Runs!`);
    }
  };

  const resetGame = () => {
      setScore(0);
      setBalls(0);
      setIsOut(false);
      setLastAction(null);
  };

  return (
    <div className="w-full min-h-screen text-foreground p-4 md:p-8 relative flex flex-col">
      <div className="fixed inset-0 z-0"><AnoAI /></div>
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col flex-1">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/games')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">Book Cricket</h1>
          </div>
          <div className="flex items-center gap-2 text-xl font-bold text-yellow-400 bg-white/10 px-4 py-2 rounded-xl">
             <Trophy className="w-5 h-5"/> High: {highScore}
          </div>
        </header>

        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
            
            {/* Scoreboard */}
            <div className="w-full max-w-sm bg-gradient-to-b from-white/10 to-transparent border border-white/20 rounded-3xl p-6 mb-12 relative">
                <div className="text-center">
                    <div className="text-sm text-white/50 uppercase tracking-widest mb-1">Total Score</div>
                    <div className="text-7xl font-bold font-mono tracking-tighter mb-4">{score}</div>
                    <div className="text-lg text-white/70">Balls Played: <span className="text-white font-bold">{balls}</span></div>
                </div>

                {lastAction && (
                    <div className={`
                        absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-6 py-2 rounded-full font-bold text-xl shadow-xl animate-in fade-in slide-in-from-bottom-4
                        ${isOut ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}
                    `}>
                        {lastAction}
                    </div>
                )}
            </div>

            {/* Action Area */}
            {isOut ? (
                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                    <h2 className="text-4xl font-bold text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">WICKET DOWN!</h2>
                    <p className="text-xl text-white/70 text-center max-w-xs">You scored {score} runs off {balls} balls.</p>
                    <button 
                        onClick={resetGame}
                        className="mt-4 flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    >
                        <PlayCircle className="w-6 h-6" />
                        Play Again
                    </button>
                </div>
            ) : (
                <button 
                    onClick={flipPage}
                    className="group relative flex flex-col items-center justify-center w-48 h-48 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 p-1 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all hover:scale-105 active:scale-95"
                >
                    <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3 group-hover:bg-black/30 transition-colors">
                        <BookOpen className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-2xl font-bold tracking-wider">FLIP PAGE</span>
                    </div>
                </button>
            )}

            <div className="mt-12 text-center text-white/40 text-sm max-w-sm">
                Press the button to flip a page in the "book". The page number determines your runs! (0 ends your innings).
            </div>
        </div>
      </div>
    </div>
  );
}
