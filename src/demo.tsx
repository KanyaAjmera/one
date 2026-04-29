import { useNavigate, Link } from "react-router-dom";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import RetroGrid from "@/components/ui/retro-grid";
import { TubesBackground } from "@/components/ui/neon-flow";

export default function Demo() {
  const navigate = useNavigate();

  return (
    <div className="w-full text-foreground font-sans overflow-x-hidden min-h-screen">
      {/* Main Content Scrollable Context */}
      <div className="relative z-10 w-full">
        {/* Fixed Background Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <RetroGrid gridColor="#ffffff" />
        </div>

        {/* Hero Section Content */}
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-4">
          <TubesBackground className="absolute inset-0 z-10 bg-transparent pointer-events-none mix-blend-screen">
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4 cursor-default pointer-events-auto text-center relative z-20">
              <p className="text-xl text-gray-300 uppercase tracking-widest relative z-20 mix-blend-difference">
                one begins one ends
              </p>
              <h1
                onClick={() => navigate("/blank")}
                className="text-5xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-[0_0_20px_rgba(0,0,0,1)] select-none cursor-pointer hover:scale-105 transition-transform relative z-20 mix-blend-difference"
                title="Go to Next Page"
              >
                INFINITY
              </h1>
            </div>
          </TubesBackground>
        </div>

        {/* Scroll Animation Section */}
        <div className="flex flex-col overflow-hidden">
          <ContainerScroll
            titleComponent={
              <>
                <h1 className="text-2xl md:text-6xl font-semibold text-white drop-shadow-md">
                  <span className="text-2xl md:text-7xl font-bold mt-1 leading-none">
                    Beyond Search. Beyond Chat.
                  </span>
                  <br />
                  <span className="text-2xl md:text-7xl font-bold">
                    The Future Starts Here
                  </span>
                </h1>
              </>
            }
          >
            <div className="w-full h-full overflow-y-auto scrollbar-thin flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 pb-12">
              {/* Create Card - Interactive */}
              <div
                className="border border-white/[0.2] flex flex-col items-center justify-center w-full mx-auto p-4 relative min-h-[300px] lg:h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] hover:shadow-xl"
                onClick={() => navigate("/create")}
              >
                <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

                <div className="flex-1 w-full flex items-center justify-center">
                  <EvervaultCard text="Create" />
                </div>
              </div>

              <Link
                to="/ask"
                className="border border-white/[0.2] flex flex-col items-center justify-center w-full mx-auto p-4 relative min-h-[300px] lg:h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] hover:shadow-xl z-20"
              >
                <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

                <div className="flex-1 w-full flex items-center justify-center">
                  <EvervaultCard text="Ask" />
                </div>
              </Link>
              <Link
                to="/ai"
                className="border border-white/[0.2] flex flex-col items-center justify-center w-full mx-auto p-4 relative min-h-[300px] lg:h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] hover:shadow-xl z-20"
              >
                <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

                <div className="flex-1 w-full flex items-center justify-center">
                  <EvervaultCard text="Ai" />
                </div>
              </Link>
              <Link
                to="/games"
                className="border border-white/[0.2] flex flex-col items-center justify-center w-full mx-auto p-4 relative min-h-[300px] lg:h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02] hover:shadow-xl z-20"
              >
                <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
                <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

                <div className="flex-1 w-full flex items-center justify-center">
                  <EvervaultCard text="Games" />
                </div>
              </Link>
            </div>
          </ContainerScroll>
        </div>
      </div>
    </div>
  );
}
