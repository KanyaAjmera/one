import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Download,
  Shuffle,
  Image as ImageIcon,
} from "lucide-react";
import AnoAI from "@/components/ui/animated-shader-background";
import { motion } from "framer-motion";

export default function AvatarCreator() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("anime");
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [enhancedTitle, setEnhancedTitle] = useState("");

  // History storage (keeping it simple with local state here)
  const [history, setHistory] = useState<string[]>([]);

  const presets = [
    "anime boy with blue hair",
    "cyberpunk hacker",
    "fantasy elf warrior",
    "astronaut riding a horse",
    "steampunk engineer",
  ];

  const randomAvatar = () => {
    const randomOption = presets[Math.floor(Math.random() * presets.length)];
    setPrompt(randomOption);
  };

  const generateAvatar = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setEnhancedPrompt("");
    setEnhancedTitle("");

    try {
      const baseUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://127.0.0.1:8000';

      // First, enhance the prompt
      try {
        const enhanceResponse = await fetch(
          `${baseUrl}/api/enhance_avatar_prompt?prompt=${encodeURIComponent(prompt)}&style=${encodeURIComponent(style)}`,
        );
        if (enhanceResponse.ok) {
          const enhancedData = await enhanceResponse.json();
          setEnhancedTitle(enhancedData.title || "");
          setEnhancedPrompt(enhancedData.enhancedPrompt || "");
          console.log("[Avatar] Enhanced prompt received:", enhancedData);
        }
      } catch (enhanceErr) {
        console.warn("Could not fetch enhanced prompt:", enhanceErr);
      }

      // Then generate the image
      const response = await fetch(
        `${baseUrl}/api/generate_avatar?prompt=${encodeURIComponent(prompt)}&style=${encodeURIComponent(style)}`,
      );

      if (!response.ok) {
        let errorText = await response.text();
        try {
          const data = JSON.parse(errorText);
          errorText = data.detail || data.error || errorText;
        } catch (e) {
          if (
            !errorText ||
            errorText.includes("proxy") ||
            errorText.includes("HTML")
          ) {
            errorText =
              "Backend API is unreachable. Please ensure your Python backend is running!";
          }
        }
        setError(`Failed: ${errorText}`);
        setLoading(false);
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setAvatarUrl(objectUrl);
      setHistory((prev) => [objectUrl, ...prev].slice(0, 5)); // Keep last 5 history items
    } catch (err: any) {
      setError("Error connecting to generator: " + err.message);
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (!avatarUrl) return;
    const link = document.createElement("a");
    link.href = avatarUrl;
    link.download = `avatar_${prompt.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen text-foreground font-sans overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 z-0">
        <AnoAI />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col flex-1">
        <header className="relative z-50 flex flex-col gap-6 mb-8 backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/create")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Avatar Creator
            </h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-start min-h-[400px]">
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col lg:flex-row gap-8"
          >
            {/* Inputs Area */}
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Create Your Avatar</h2>
                <p className="text-white/60">
                  Describe your perfect profile picture and select a style. The
                  AI enhancer will optimize your prompt automatically!
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <input
                    id="input"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generateAvatar()}
                    placeholder="Describe avatar (e.g., cyberpunk hacker)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <button
                    onClick={randomAvatar}
                    title="Surprise Me"
                    className="bg-white/10 hover:bg-white/20 p-4 rounded-xl border border-white/10 transition-all flex items-center justify-center shrink-0"
                  >
                    <Shuffle className="w-5 h-5 text-purple-400" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                    Style
                  </label>
                  <select
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
                  >
                    <option className="bg-slate-900" value="anime">
                      🌸 Anime
                    </option>
                    <option className="bg-slate-900" value="realistic">
                      📸 Realistic
                    </option>
                    <option className="bg-slate-900" value="3d">
                      🧊 3D Render
                    </option>
                  </select>
                </div>

                <button
                  onClick={generateAvatar}
                  disabled={loading || !prompt.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] mt-4"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {loading
                    ? "Generating... (First time may take ~30s)"
                    : "Generate Avatar"}
                </button>

                {error && (
                  <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Avatar Display Area */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white/10 bg-black/40 overflow-hidden shadow-2xl flex items-center justify-center">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                  </div>
                )}

                {avatarUrl ? (
                  <img
                    id="output"
                    src={avatarUrl}
                    alt="Generated Avatar"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <ImageIcon className="w-16 h-16" />
                    <span>No Avatar Yet</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownload}
                disabled={!avatarUrl || loading}
                className="mt-8 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 py-3 px-8 rounded-full border border-white/10 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Avatar
              </button>

              {/* Enhanced Prompt Display */}
              {enhancedPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 w-full max-w-md bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm"
                >
                  {enhancedTitle && (
                    <h3 className="text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wider">
                      {enhancedTitle}
                    </h3>
                  )}
                  <p className="text-xs text-white/70 leading-relaxed line-clamp-3">
                    {enhancedPrompt}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* History Section */}
          {history.length > 1 && (
            <div className="w-full max-w-4xl mt-8">
              <h3 className="text-xl font-bold mb-4 opacity-80">
                Recent Avatars
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {history.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setAvatarUrl(url)}
                    className="w-20 h-20 shrink-0 rounded-full border-2 border-white/20 overflow-hidden cursor-pointer hover:border-purple-500 transition-all opacity-70 hover:opacity-100"
                  >
                    <img
                      src={url}
                      alt={`History item ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
