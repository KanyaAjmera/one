import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dices, Trophy, RefreshCw, Info, RotateCcw } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';
import { useGameScores } from '@/hooks/useGameScores';

const SNAKES: Record<number, number> = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const LADDERS: Record<number, number> = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

export default function SnakeLadder() {
  const navigate = useNavigate();
  const { best, history, submitScore, resetScores } = useGameScores('snake-ladder');

  const [position, setPosition] = useState(0);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Roll the dice to start!');
  const [isRolling, setIsRolling] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const rollDice = useCallback(() => {
    if (isWon || isRolling) return;
    setIsRolling(true);
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const currentMoves = moves + 1;
      setMoves(currentMoves);

      let newPos = position + roll;
      if (newPos > 100) {
        setMessage(`Rolled a ${roll}, need exactly ${100 - position} to win!`);
        setIsRolling(false);
        return;
      }
      if (newPos === 100) {
        setPosition(100);
        setIsWon(true);
        setMessage(`Rolled a ${roll}. YOU WIN! 🎉`);
        setIsRolling(false);
        const score = Math.max(1, 500 - currentMoves);
        submitScore(score, currentMoves);
        return;
      }
      let msg = `Rolled a ${roll}. `;
      if (SNAKES[newPos]) { msg += `Snake! Sliding to ${SNAKES[newPos]} 🐍`; newPos = SNAKES[newPos]; }
      else if (LADDERS[newPos]) { msg += `Ladder! Climbing to ${LADDERS[newPos]} 🪜`; newPos = LADDERS[newPos]; }
      else { msg += `Moved to ${newPos}.`; }
      setPosition(newPos);
      setMessage(msg);
      setIsRolling(false);
    }, 500);
  }, [position, isWon, isRolling, moves, submitScore]);

  const resetGame = () => {
    setPosition(0); setMoves(0); setIsWon(false);
    setMessage('Roll the dice to start!');
  };

  const handleReset = () => {
    if (resetConfirm) { resetScores(); setResetConfirm(false); }
    else { setResetConfirm(true); setTimeout(() => setResetConfirm(false), 3000); }
  };

  const cells = [];
  for (let row = 9; row >= 0; row--)
    for (let col = 0; col < 10; col++)
      cells.push(row % 2 !== 0 ? row * 10 + col + 1 : row * 10 + (9 - col) + 1);

  return (
    <div className="w-full min-h-screen text-foreground p-4 md:p-8 relative flex flex-col">
      <div className="fixed inset-0 z-0"><AnoAI /></div>
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 flex-1">

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <header className="flex items-center gap-4">
            <button onClick={() => navigate('/games')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Snake & Ladder</h1>
          </header>

          {/* Best Score Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-yellow-400 text-xs uppercase tracking-wider">Best Score</div>
              <div className="text-2xl font-bold text-yellow-400">{best}</div>
            </div>
            <Trophy className="w-8 h-8 text-yellow-400/60" />
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="text-center">
              <div className="text-white/50 text-sm uppercase tracking-widest mb-1">Position</div>
              <div className="text-6xl font-bold font-mono text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                {position === 0 ? 'Start' : position}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center min-h-[60px] flex items-center justify-center border border-white/5 text-sm">{message}</div>
            <div className="flex justify-between items-center px-2">
              <span className="text-white/50">Rolls: {moves}</span>
              <span className="text-white/50 flex items-center gap-1"><Trophy className="w-4 h-4 text-yellow-500" /> Target: 100</span>
            </div>
            <button onClick={rollDice} disabled={isWon || isRolling}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg
                ${isWon || isRolling ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95'}`}>
              <Dices className={`w-6 h-6 ${isRolling ? 'animate-spin' : ''}`} />
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
            {isWon && (
              <button onClick={resetGame} className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors">
                <RefreshCw className="w-5 h-5" /> Play Again
              </button>
            )}
          </div>

          {/* History + Reset */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setShowHistory(v => !v)} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                {showHistory ? 'Hide' : 'Show'} History ({history.length})
              </button>
              <button onClick={handleReset}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${resetConfirm ? 'bg-red-500/30 text-red-400 border border-red-500/50' : 'bg-white/5 text-white/40 hover:text-white/70 border border-white/10'}`}>
                <RotateCcw className="w-3 h-3" /> {resetConfirm ? 'Confirm?' : 'Reset'}
              </button>
            </div>
            {showHistory && history.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {history.map((entry, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-white/40">{new Date(entry.date).toLocaleDateString()} — {entry.moves} rolls</span>
                    <span className={entry.score === best ? 'text-yellow-400 font-bold' : 'text-white/60'}>{entry.score} {entry.score === best && '⭐'}</span>
                  </div>
                ))}
              </div>
            )}
            {showHistory && history.length === 0 && <p className="text-white/30 text-xs text-center">No history yet</p>}
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-xs text-white/50 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white/70 mb-1"><Info className="w-4 h-4" /> Game Info</div>
            <p>• Reach exactly 100 to win.</p>
            <p>• <span className="text-emerald-400 font-bold">Ladders</span> go up, <span className="text-red-400 font-bold">Snakes</span> go down.</p>
            <p>• Fewer rolls = higher score!</p>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-4 sm:p-8 flex items-center justify-center shadow-2xl overflow-hidden relative">
          <div className="w-full max-w-2xl aspect-square grid grid-cols-10 grid-rows-10 gap-1 sm:gap-2">
            {cells.map(num => {
              const isSnake = Object.keys(SNAKES).includes(num.toString());
              const isLadder = Object.keys(LADDERS).includes(num.toString());
              const isCurrentPos = position === num;
              return (
                <div key={num} className={`relative flex items-center justify-center rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all
                  ${isCurrentPos ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.8)] scale-110 z-10' : 'bg-white/5 text-white/40 border border-white/5'}
                  ${isSnake && !isCurrentPos ? 'border-red-500/30 text-red-400/70' : ''}
                  ${isLadder && !isCurrentPos ? 'border-emerald-500/30 text-emerald-400/70' : ''}`}>
                  {num}
                  {!isCurrentPos && isSnake && <span className="absolute bottom-0.5 right-0.5 text-[7px] sm:text-[9px]">🐍</span>}
                  {!isCurrentPos && isLadder && <span className="absolute bottom-0.5 right-0.5 text-[7px] sm:text-[9px]">🪜</span>}
                  {isCurrentPos && <span className="absolute inset-0 rounded-xl ring-2 ring-white animate-ping opacity-50" />}
                </div>
              );
            })}
          </div>
          {isWon && (
            <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
              <Trophy className="w-32 h-32 text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-bounce" />
              <h2 className="text-5xl font-bold text-white mb-4 text-center">VICTORY!</h2>
              <p className="text-2xl text-white/70 mb-2">Finished in {moves} rolls</p>
              <p className="text-lg text-yellow-400">Score: {Math.max(1, 500 - moves)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
