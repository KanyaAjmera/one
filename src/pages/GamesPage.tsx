import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Car, Grid3x3, Puzzle, Type, Trophy } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamesPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen text-foreground font-sans overflow-x-hidden relative flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <AnoAI />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col flex-1">
        
        {/* Header */}
        <header className="relative z-50 flex flex-col gap-6 mb-8 backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/demo')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Games Hub
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
                 <motion.div
                    key="games-grid"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4"
                >
                    {[
                        { name: 'Snake and Ladder', icon: Gamepad2, color: 'from-green-500 to-emerald-700', path: '/games/snake-ladder' },
                        { name: 'Car Racing', icon: Car, color: 'from-red-500 to-orange-700', path: '/games/car-racing' },
                        { name: 'X and 0', icon: Grid3x3, color: 'from-blue-500 to-indigo-700', path: '/games/tic-tac-toe' },
                        { name: 'Puzzle', icon: Puzzle, color: 'from-purple-500 to-pink-700', path: '/games/puzzle' },
                        { name: 'Guess the Captcha', icon: Type, color: 'from-yellow-500 to-amber-700', path: '/games/captcha' },
                        { name: 'Cricket (Live)', icon: Trophy, color: 'from-cyan-500 to-blue-700', path: '/games/cricket' },
                    ].map((game) => (
                        <Link
                            key={game.name}
                            to={game.path}
                            className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 hover:bg-white/10 shadow-lg hover:shadow-2xl z-50 cursor-pointer"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <game.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-white/90 group-hover:text-white">{game.name}</h3>
                            <p className="text-sm text-white/50">Play offline & online</p>
                        </Link>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
