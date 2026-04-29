import { motion } from "framer-motion";
import { LampContainer } from "../components/ui/lamp";
import AuthCard from "../components/ui/AuthCard";
import Hyperspeed from "../components/ui/Hyperspeed";

export default function GridScanPage() {
  return (
    <div className="w-full relative text-foreground overflow-x-hidden min-h-screen">
      {/* Hyperspeed Background - Fixed toViewport */}
      <div className="fixed inset-0 w-full h-screen z-0 pointer-events-none mix-blend-screen">
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => {},
            onSlowDown: () => {},
            distortion: "turbulentDistortion",
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 3,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 20,
            lightPairsPerRoadWay: 40,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [12, 80],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.8, 0.8],
            carFloorSeparation: [0, 5],
            colors: {
              roadColor: 526344,
              islandColor: 657930,
              background: 0,
              shoulderLines: 1250072,
              brokenLines: 1250072,
              leftCars: [14177983, 6770850, 12732332],
              rightCars: [242627, 941733, 3294549],
              sticks: 242627,
            },
          }}
        />
      </div>

      <div className="w-full min-h-[200vh] flex flex-col items-center justify-start relative z-10">
        {/* Top Header Section with Lamp Effect */}
        <div className="w-full h-screen relative flex flex-col items-center justify-center">
          <LampContainer>
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="mt-8 py-4 text-center text-6xl font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(0,190,255,0.8)] md:text-9xl mb-32"
            >
              INFINITY
            </motion.h1>
          </LampContainer>
        </div>

        {/* Scroll Down Section */}
        <div className="w-full min-h-screen flex items-center justify-center py-12 relative">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-950/80 to-transparent z-10 pointer-events-none"></div>
          <div className="w-full max-w-md mx-auto px-4 md:px-8 z-20 hover:scale-[1.02] transition-transform duration-500 relative">
            {/* Merged Lighting Glowing Orb behind AuthCard */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] bg-cyan-700 opacity-20 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen"></div>

            <AuthCard />
          </div>
        </div>
      </div>
    </div>
  );
}
