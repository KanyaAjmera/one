import { useState, useRef, useCallback } from "react";
import { ChevronLeft, RotateCw, Download } from "lucide-react";
import AnoAI from "@/components/ui/animated-shader-background";
import Fake3D from "@/components/3d/Fake3D";
import Real3D from "@/components/3d/Real3D";
import Depth3D from "@/components/3d/Depth3D";
import Insane4D from "@/components/3d/Insane4D";

type RenderMode = "fake" | "real" | "depth" | "4d";

interface VisualPageProps {
  initialMode?: RenderMode;
  initialImage?: string;
  onBack?: () => void;
}

export default function BlankPage({
  initialMode = "real",
  initialImage = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
  onBack,
}: VisualPageProps) {
  const [mode, setMode] = useState<RenderMode>(initialMode);
  const [image, setImage] = useState(initialImage);
  const [inputValue, setInputValue] = useState(image);
  const [isDownloading, setIsDownloading] = useState(false);
  const renderAreaRef = useRef<HTMLDivElement>(null);

  const handleImageChange = () => {
    if (inputValue.trim()) setImage(inputValue);
  };

  const handleRegenerate = () => {
    const randomId = Math.random().toString(36).substring(7);
    const newImage = `https://picsum.photos/seed/${randomId}/400`;
    setImage(newImage);
    setInputValue(newImage);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleImageChange();
  };

  // Download: capture the WebGL canvas or take a screenshot of the render area
  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      // Try to grab a WebGL canvas inside the render area
      const canvas = renderAreaRef.current?.querySelector("canvas");
      if (canvas) {
        // For WebGL canvases (Real3D, Insane4D) — need to trigger a render first
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `infinity-${mode}-${Date.now()}.png`;
        link.click();
      } else {
        // For CSS-based modes (Fake3D, Depth3D) — use html2canvas-like approach
        // Fallback: download the source image
        const response = await fetch(image);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `infinity-${mode}-${Date.now()}.jpg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // Last resort: open image in new tab
      window.open(image, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }, [mode, image]);

  const modeLabels: Record<RenderMode, { label: string; icon: string; desc: string }> = {
    fake: { label: "FAKE 3D", icon: "🎨", desc: "CSS Perspective Tilt" },
    real: { label: "REAL 3D", icon: "🎲", desc: "Three.js Cube" },
    depth: { label: "DEPTH 3D", icon: "👁️", desc: "Parallax Effect" },
    "4d": { label: "INSANE 4D", icon: "🔥", desc: "Advanced Reactive Engine" },
  };

  return (
    <div className="flex h-screen w-screen relative overflow-hidden text-white font-sans">
      <div className="fixed inset-0 z-0"><AnoAI /></div>

      <div className="relative z-10 flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Back">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <span className="text-2xl">{modeLabels[mode].icon}</span>
                  {modeLabels[mode].label}
                </h1>
                <p className="text-sm text-white/60 mt-1">{modeLabels[mode].desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg transition-all text-blue-300 hover:text-blue-200 text-sm font-medium disabled:opacity-50"
                title="Download current view"
              >
                <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
                {isDownloading ? "Saving..." : "Download"}
              </button>
              <button
                onClick={handleRegenerate}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Regenerate image"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-16 z-30">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex gap-3 overflow-x-auto">
            {(Object.entries(modeLabels) as [RenderMode, { label: string; icon: string }][]).map(([m, { label, icon }]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  mode === m
                    ? "bg-blue-500/30 border-2 border-blue-400 text-blue-200"
                    : "bg-white/5 border border-white/20 hover:border-white/40 text-white/70"
                }`}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto py-8 px-4 md:px-8">
          <div className="w-full max-w-5xl flex flex-col gap-8">
            {/* Image URL Input */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">Image URL</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter image URL and press Enter"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <button
                  onClick={handleImageChange}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  Load
                </button>
              </div>
            </div>

            {/* Render Area — ref attached for download capture */}
            <div ref={renderAreaRef} className="flex items-center justify-center min-h-96">
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative">
                {mode === "fake" && <Fake3D image={image} />}
                {mode === "real" && <Real3D image={image} />}
                {mode === "depth" && <Depth3D image={image} />}
                {mode === "4d" && <Insane4D image={image} />}

                {/* Floating download button on render area */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 border border-white/20 rounded-lg transition-all text-white/70 hover:text-white"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Mode Info</h3>
              <div className="text-sm text-white/70 space-y-3">
                {mode === "fake" && <>
                  <p>🎨 CSS-based perspective tilt effect</p>
                  <p>✨ Move your mouse to see the parallax effect</p>
                  <p>⚡ Lightweight and performant — pure CSS</p>
                </>}
                {mode === "real" && <>
                  <p>🎲 True 3D rotating cube rendered with Three.js</p>
                  <p>✨ Each face displays your image with auto-rotation</p>
                  <p>⚡ Hardware-accelerated WebGL rendering</p>
                </>}
                {mode === "depth" && <>
                  <p>👁️ AI-style parallax depth illusion</p>
                  <p>✨ Creates depth layers without AI models</p>
                  <p>⚡ Pure CSS and JavaScript — fully frontend</p>
                </>}
                {mode === "4d" && <>
                  <p>🔥 Advanced reactive 4D engine with 800 particles</p>
                  <p>✨ Mouse-reactive distortion, breathing pulse, color shifting, geometry waves</p>
                  <p>⚡ Premium immersive experience</p>
                </>}
                <p className="text-white/40 text-xs mt-4 pt-3 border-t border-white/10">
                  💡 Tip: For WebGL modes (Real 3D, 4D), download captures the canvas directly as PNG. For CSS modes, the source image is saved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
