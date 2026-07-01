import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, MessageSquare, Gamepad2, RotateCcw, TrendingUp, Star, Zap } from "lucide-react";
import AnoAI from "@/components/ui/animated-shader-background";
import { getAllGameScores } from "@/hooks/useGameScores";
import { getChatStats } from "@/hooks/useChatHistory";
import { useAuth } from "@/contexts/AuthContext";

const GAME_LABELS: Record<string, string> = {
  "snake-ladder": "Snake & Ladder",
  "car-racing": "Car Racing",
  "tic-tac-toe": "Tic Tac Toe",
  "puzzle": "Puzzle",
  "captcha": "Guess Captcha",
  "cricket": "Cricket",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameScores, setGameScores] = useState<Record<string, { best: number; history: any[] }>>({});
  const [chatStats, setChatStats] = useState({ totalChats: 0, generalChats: 0, lawChats: 0, totalMessages: 0 });
  const [resetConfirm, setResetConfirm] = useState<string | null>(null);

  const loadData = () => {
    setGameScores(getAllGameScores());
    setChatStats(getChatStats());
  };

  useEffect(() => { loadData(); }, []);

  const handleResetGame = (gameName: string) => {
    if (resetConfirm === gameName) {
      const all = JSON.parse(localStorage.getItem('infinity_game_scores') || '{}');
      delete all[gameName];
      localStorage.setItem('infinity_game_scores', JSON.stringify(all));
      setResetConfirm(null);
      loadData();
    } else {
      setResetConfirm(gameName);
      setTimeout(() => setResetConfirm(null), 3000);
    }
  };

  const handleResetChats = (mode: 'general' | 'law' | 'all') => {
    const all: any[] = JSON.parse(localStorage.getItem('infinity_chat_history') || '[]');
    const filtered = mode === 'all' ? [] : all.filter((c: any) => c.mode !== mode);
    localStorage.setItem('infinity_chat_history', JSON.stringify(filtered));
    loadData();
  };

  const totalGamesPlayed = Object.values(gameScores).reduce((s, g) => s + g.history.length, 0);
  const bestOverall = Math.max(0, ...Object.values(gameScores).map(g => g.best));

  return (
    <div className="w-full min-h-screen text-foreground font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 z-0"><AnoAI /></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {user ? `Welcome back, ${user.name}` : 'Your activity at a glance'}
            </p>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Games Played', value: totalGamesPlayed, icon: Gamepad2, color: 'text-green-400', bg: 'from-green-500/10 to-emerald-500/5' },
            { label: 'Best Score', value: bestOverall, icon: Trophy, color: 'text-yellow-400', bg: 'from-yellow-500/10 to-amber-500/5' },
            { label: 'Total Chats', value: chatStats.totalChats, icon: MessageSquare, color: 'text-blue-400', bg: 'from-blue-500/10 to-indigo-500/5' },
            { label: 'Messages Sent', value: chatStats.totalMessages, icon: Zap, color: 'text-purple-400', bg: 'from-purple-500/10 to-pink-500/5' },
          ].map(stat => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} border border-white/10 rounded-2xl p-5 backdrop-blur-md`}>
              <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-white/50 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Game Scores */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Game Scores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(GAME_LABELS).map(game => {
              const gData = gameScores[game] ?? { best: 0, history: [] };
              const isConfirming = resetConfirm === game;
              return (
                <div key={game} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{GAME_LABELS[game]}</h3>
                      <p className="text-white/40 text-xs mt-0.5">{gData.history.length} games played</p>
                    </div>
                    <button
                      onClick={() => handleResetGame(game)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                        isConfirming
                          ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                          : 'bg-white/5 text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      {isConfirming ? 'Confirm?' : 'Reset'}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">{gData.best}</div>
                      <div className="text-white/40 text-xs">Best Score</div>
                    </div>
                  </div>
                  {gData.history.length > 0 ? (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {gData.history.slice(0, 5).map((entry, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-white/50">{new Date(entry.date).toLocaleDateString()}</span>
                          <span className={`font-medium ${entry.score === gData.best ? 'text-yellow-400' : 'text-white/70'}`}>
                            {entry.score} {entry.score === gData.best && '⭐'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-sm text-center py-2">No games played yet</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Chat History Stats */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" /> Chat Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'General AI Chats', value: chatStats.generalChats, mode: 'general' as const, color: 'blue', path: '/ask' },
              { label: 'Laws AI Chats', value: chatStats.lawChats, mode: 'law' as const, color: 'purple', path: '/lawsai' },
            ].map(item => (
              <div key={item.mode} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">{item.label}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(item.path)}
                      className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleResetChats(item.mode)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg text-white/40 hover:text-red-400 transition-all"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{item.value}</div>
                <div className="text-white/40 text-sm">conversations saved</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleResetChats('all')}
              className="flex items-center gap-2 text-sm px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl text-red-400 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Clear All Chat History
            </button>
          </div>
        </section>

        {/* Quick Nav */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" /> Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Play Games', path: '/games', color: 'from-green-500 to-emerald-600' },
              { label: 'Ask AI', path: '/ask', color: 'from-blue-500 to-indigo-600' },
              { label: 'Laws AI', path: '/lawsai', color: 'from-purple-500 to-violet-600' },
              { label: 'Create', path: '/create', color: 'from-orange-500 to-red-600' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`bg-gradient-to-br ${item.color} p-4 rounded-2xl text-white font-semibold hover:scale-105 transition-all shadow-lg`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
