import { Link } from "react-router-dom";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import Hyperspeed from '@/components/ui/Hyperspeed';

export default function AiPage() {
  return (
    <div className="w-full text-foreground font-sans overflow-x-hidden min-h-screen flex items-center justify-center p-4 relative">
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

      <div className="relative z-20 w-full max-w-7xl mx-auto p-4 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] text-center">
          Innovative AI Future
        </h1>
        
        <div className="w-full max-w-5xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-8">
          
          <Link
            to="/search"
            className="border border-white/[0.2] flex flex-col items-center justify-center w-full mx-auto p-4 relative min-h-[400px] bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] hover:shadow-xl z-20"
          >
            <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

            <div className="flex-1 w-full flex items-center justify-center">
              <EvervaultCard text="General AI" />
            </div>
          </Link>

          <Link
            to="/laws"
            className="border border-white/[0.2] flex flex-col items-center justify-center w-full mx-auto p-4 relative min-h-[400px] bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] hover:shadow-xl z-20"
          >
            <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

            <div className="flex-1 w-full flex items-center justify-center">
              <EvervaultCard text="Laws" />
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
