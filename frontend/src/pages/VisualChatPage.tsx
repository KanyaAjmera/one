import { useState } from "react";
import { Send, ArrowRight } from "lucide-react";
import AnoAI from "@/components/ui/animated-shader-background";
import BlankPage from "./BlankPage";

type PageMode = "chat" | "visual" | "loading";
type RenderMode = "fake" | "real" | "depth" | "4d";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function VisualChatPage() {
  const [page, setPage] = useState<PageMode>("chat");
  const [visualMode, setVisualMode] = useState<RenderMode>("real");
  const [visualImage, setVisualImage] = useState(
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hey! 👋 I can create 3D and 4D visuals for you. Try saying things like:\n\n💬 'generate 4D image of galaxy'\n💬 'show me a real 3d cube'\n💬 'create depth effect image'\n\nOr just chat with me!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Detect rendering mode from user input
  function detectRenderMode(message: string): RenderMode | null {
    const msg = message.toLowerCase();

    if (msg.includes("4d") || msg.includes("insane")) return "4d";
    if (msg.includes("depth")) return "depth";
    if (msg.includes("fake")) return "fake";
    if (msg.includes("real") || msg.includes("3d")) return "real";

    return null;
  }

  // Generate a themed image based on user request
  function generateImageSeed(message: string): string {
    // Extract keywords for seeded image generation
    const keywords = message
      .toLowerCase()
      .match(
        /\b(galaxy|space|tree|mountain|ocean|fire|ice|neon|cyber|abstract|nature|urban)\b/,
      );
    const seed = keywords ? keywords[0] : message.substring(0, 10);
    return `https://picsum.photos/seed/${seed}/400`;
  }

  function handleSendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Check if user wants visual mode
    const mode = detectRenderMode(input);

    if (mode) {
      // Switch to loading state
      setIsLoading(true);
      setPage("loading");

      // Simulate loading
      setTimeout(() => {
        setVisualMode(mode);
        setVisualImage(generateImageSeed(input));
        setPage("visual");
        setIsLoading(false);
      }, 800);

      setInput("");
    } else {
      // Regular chat response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Got it! You said: "${input}"\n\nTry asking me to "generate 4D image", "show real 3D", "create depth effect", or "fake 3D effect" to see the visual modes! 🎨`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setInput("");
    }
  }

  if (page === "loading") {
    return (
      <div className="flex h-screen w-screen relative overflow-hidden text-foreground flex-col items-center justify-center gap-4">
        <div className="fixed inset-0 z-0">
          <AnoAI />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-lg font-semibold">Generating visual...</p>
        </div>
      </div>
    );
  }

  if (page === "visual") {
    return (
      <BlankPage
        initialMode={visualMode}
        initialImage={visualImage}
        onBack={() => setPage("chat")}
      />
    );
  }

  // Chat View
  return (
    <div className="flex h-screen w-screen relative overflow-hidden text-foreground font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <AnoAI />
      </div>

      <div className="relative z-10 flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Infinity Visual Engine
            </h1>
            <p className="text-white/60 mt-1">
              Chat-based 3D & 4D visual generation — all frontend
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full px-4 md:px-8 py-8 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl px-6 py-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-blue-500/20 border border-blue-400/30 text-white"
                    : "bg-white/5 border border-white/10 text-white/90"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                <p className="text-xs text-white/40 mt-2">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-2xl px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/50 backdrop-blur-md sticky bottom-0 z-40">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Try: generate 4D image of space... or just chat!"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Commands */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { text: "Generate 4D", mode: "4d" },
                { text: "Real 3D Cube", mode: "real" },
                { text: "Depth Effect", mode: "depth" },
                { text: "Fake 3D", mode: "fake" },
              ].map((cmd) => (
                <button
                  key={cmd.mode}
                  onClick={() => {
                    setInput(`generate ${cmd.text}`);
                  }}
                  className="px-3 py-2 bg-white/5 border border-white/20 hover:bg-white/10 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-3 h-3" />
                  {cmd.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
