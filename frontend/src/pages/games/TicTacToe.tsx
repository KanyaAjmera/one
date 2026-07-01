import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, RotateCcw } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';
import { useGameScores } from '@/hooks/useGameScores';

export default function TicTacToe() {
  const navigate = useNavigate();
  const { best, history, submitScore, resetScores } = useGameScores('tic-tac-toe');
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line: lines[i] };
        }
    }
    return null;
  };

  const winData = calculateWinner(board);
  const winner = winData?.winner;
  const isDraw = !winner && board.every(square => square !== null);

  // Submit score when game ends
  const handleClick = (i: number) => {
    if (calculateWinner(board) || board[i]) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
    // Check if this move wins
    const result = calculateWinner(newBoard);
    if (result) submitScore(100); // Win = 100 points
    else if (newBoard.every(s => s !== null)) submitScore(50); // Draw = 50 points
  };

  const handleReset = () => {
    if (resetConfirm) { resetScores(); setResetConfirm(false); }
    else { setResetConfirm(true); setTimeout(() => setResetConfirm(false), 3000); }
  };

  return (
    <div className="w-full min-h-screen text-foreground p-4 md:p-8 relative flex flex-col">
      <div className="fixed inset-0 z-0"><AnoAI /></div>
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col flex-1">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/games')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">X and 0 (Tic Tac Toe)</h1>
        </header>

        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center shadow-2xl">

            {/* Best score */}
            <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Best: {best}</span>
              <span className="text-white/30 text-xs ml-2">({history.length} games)</span>
            </div>
            
            <div className="mb-8 text-2xl font-bold min-h-[40px] flex items-center justify-center">
                {winner ? (
                    <span className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                        Player {winner} Wins! 🎉
                    </span>
                ) : isDraw ? (
                    <span className="text-yellow-400">It's a Draw! 🤝</span>
                ) : (
                    <span>Next Player: <span className={xIsNext ? 'text-blue-400' : 'text-red-400'}>{xIsNext ? 'X' : 'O'}</span></span>
                )}
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-white/5 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {board.map((square, i) => {
                    const isWinningSquare = winData?.line.includes(i);
                    return (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            className={`
                                w-24 h-24 sm:w-32 sm:h-32 text-6xl font-bold rounded-2xl flex items-center justify-center transition-all duration-300
                                ${square ? 'bg-white/5' : 'bg-white/10 hover:bg-white/20 hover:scale-[1.02] active:scale-95 cursor-pointer'}
                                ${isWinningSquare ? 'ring-4 ring-green-400 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.3)] bg-green-500/20' : ''}
                            `}
                            disabled={!!square || !!winner}
                        >
                            <span className={`
                                transition-all duration-300 scale-0 origin-center
                                ${square ? 'scale-100' : ''}
                                ${square === 'X' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' : ''}
                                ${square === 'O' ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : ''}
                            `}>
                                {square}
                            </span>
                        </button>
                    );
                })}
            </div>

            <button 
                onClick={() => {setBoard(Array(9).fill(null)); setXIsNext(true);}}
                className={`
                    mt-10 flex items-center gap-3 px-8 py-4 rounded-full font-bold transition-all
                    ${winner || isDraw 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105' 
                        : 'bg-white/10 text-white hover:bg-white/20'}
                `}
            >
                <RefreshCw className={`w-5 h-5 ${winner || isDraw ? 'animate-spin-slow' : ''}`} />
                {winner || isDraw ? 'Play Again' : 'Restart Game'}
            </button>

            {/* History + Reset */}
            <div className="mt-6 w-full max-w-sm">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowHistory(v => !v)} className="text-sm text-white/50 hover:text-white transition-colors">
                  {showHistory ? 'Hide' : 'Show'} History
                </button>
                <button onClick={handleReset}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all ${resetConfirm ? 'bg-red-500/30 text-red-400 border border-red-500/50' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'}`}>
                  <RotateCcw className="w-3 h-3" /> {resetConfirm ? 'Confirm?' : 'Reset'}
                </button>
              </div>
              {showHistory && history.length > 0 && (
                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto bg-black/20 rounded-xl p-2">
                  {history.slice(0, 6).map((e, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-white/40">{new Date(e.date).toLocaleDateString()}</span>
                      <span className={e.score === best ? 'text-yellow-400' : 'text-white/60'}>{e.score === 100 ? 'Win ⭐' : 'Draw'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
