import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Hyperspeed from '@/components/ui/Hyperspeed';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreatePage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen text-foreground font-sans overflow-x-hidden relative flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Hyperspeed 
          effectOptions={{
            "onSpeedUp": () => {},
            "onSlowDown": () => {},
            "distortion": "turbulentDistortion",
            "length": 400,
            "roadWidth": 10,
            "islandWidth": 2,
            "lanesPerRoad": 3,
            "fov": 90,
            "fovSpeedUp": 150,
            "speedUp": 2,
            "carLightsFade": 0.4,
            "totalSideLightSticks": 20,
            "lightPairsPerRoadWay": 40,
            "shoulderLinesWidthPercentage": 0.05,
            "brokenLinesWidthPercentage": 0.1,
            "brokenLinesLengthPercentage": 0.5,
            "lightStickWidth": [0.12, 0.5],
            "lightStickHeight": [1.3, 1.7],
            "movingAwaySpeed": [60, 80],
            "movingCloserSpeed": [-120, -160],
            "carLightsLength": [12, 80],
            "carLightsRadius": [0.05, 0.14],
            "carWidthPercentage": [0.3, 0.5],
            "carShiftX": [-0.8, 0.8],
            "carFloorSeparation": [0, 5],
            "colors": {
              "roadColor": 526344,
              "islandColor": 657930,
              "background": 0,
              "shoulderLines": 1250072,
              "brokenLines": 1250072,
              "leftCars": [14177983, 6770850, 12732332],
              "rightCars": [242627, 941733, 3294549],
              "sticks": 242627
            }
          }} 
        />
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
                Create Hub
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
                 <motion.div
                    key="content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-2xl bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md text-center shadow-2xl"
                >
                    <h2 className="text-3xl font-bold mb-4">Create Hub Features</h2>
                    <p className="text-white/60">
                        Select what you would like to create today.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                        <Link to="/create/pdf" className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10">PDF Creator</Link>
                        <Link to="/create/ppt" className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10">PPT Creator</Link>
                        <Link to="/create/image" className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10">Image Creator</Link>
                        <Link to="/create/avatar" className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10">Avatar Creator</Link>
                    </div>

                </motion.div>
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
