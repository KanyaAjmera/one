import { useState } from "react";
import { ArrowLeft, RotateCcw, Search, Mic, ImageIcon } from "lucide-react";
import AnoAI from "@/components/ui/animated-shader-background";
import axios from "axios";

interface SearchResult {
  title: string;
  url: string;
  description: string;
}

const mockResultsMap: { [key: string]: SearchResult[] } = {
  nodejs: [
    {
      title: "Node.js",
      url: "nodejs.org",
      description:
        "Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser. Build fast and scalable network applications.",
    },
    {
      title: "Node.js Documentation - Getting Started",
      url: "nodejs.org › docs › guides › getting-started-guide",
      description:
        "Official documentation for Node.js. Learn how to set up Node.js, understand modules, work with npm, and build applications with Node.js.",
    },
    {
      title: "Node.js vs Python - Comparison Guide",
      url: "dev.to › nodejs-vs-python",
      description:
        "Comprehensive comparison between Node.js and Python for backend development. Explore performance, use cases, and ecosystem differences.",
    },
  ],
  python: [
    {
      title: "Python.org - Official Python Website",
      url: "python.org",
      description:
        "The official Python website. Download Python, access documentation, and join the Python community. Python is a high-level programming language.",
    },
    {
      title: "Python Tutorial - W3Schools",
      url: "w3schools.com › python",
      description:
        "Learn Python programming with interactive examples. Covers basics, data types, functions, classes, and more with hands-on exercises.",
    },
    {
      title: "Django Framework - Python Web Development",
      url: "djangoproject.com",
      description:
        "Django is a high-level Python web framework that encourages rapid development and clean pragmatic design. Build secure, scalable web applications.",
    },
  ],
  react: [
    {
      title: "React - JavaScript Library",
      url: "react.dev",
      description:
        "React is a JavaScript library for building user interfaces with reusable components. Learn about JSX, hooks, state management, and component lifecycle.",
    },
    {
      title: "React Documentation",
      url: "react.dev › docs",
      description:
        "Official React documentation with guides, API reference, and best practices. Master React hooks, context API, and performance optimization.",
    },
    {
      title: "Create React App - Setup Your Project",
      url: "create-react-app.dev",
      description:
        "Create React App is a command-line tool that helps you build React applications with no build configuration required.",
    },
  ],
};

export default function SearchPage({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [generalAiResponse, setGeneralAiResponse] = useState<string | null>(
    null,
  );
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSearch = async (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    const foundResults =
      mockResultsMap[normalizedQuery as keyof typeof mockResultsMap] ||
      mockResultsMap["react"];
    setResults(foundResults);
    setSearchQuery(query);

    setIsAiLoading(true);
    setGeneralAiResponse(null);
    try {
      const { NODE_API_URL } = await import("../config");
      const res = await axios.post(`${NODE_API_URL}/api/chat/ask`, {
        message: query,
        mode: "general",
      });
      setGeneralAiResponse(res.data.response);
    } catch (error) {
      console.error("Error communicating with AI engine:", error);
      setGeneralAiResponse("Failed to connect to the General AI engine.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  const tabs = [
    "ALL",
    "SEARCH",
    "IMAGES",
    "VIDEOS",
    "MAPS",
    "NEWS",
    "COPILOT",
    "MORE",
  ];

  return (
    <div className="min-h-screen text-foreground font-sans overflow-x-hidden relative flex flex-col">
      {/* Background Aurora */}
      <div className="fixed inset-0 z-0">
        <AnoAI />
      </div>

      <div className="relative z-10 w-full flex flex-col flex-1">
        {/* Header with Back & Refresh */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-white/10">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar Section */}
        <div className="sticky top-0 bg-black/60 backdrop-blur-md border-b border-white/10 z-20">
          <div className="max-w-6xl mx-auto px-6 py-4">
            {/* Centered Search Bar */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-5 py-3 shadow-sm hover:shadow-md transition-shadow w-full max-w-2xl mx-auto mb-4">
              <Search className="w-4 h-4 text-white/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search"
                className="flex-1 outline-none text-base text-white placeholder-white/40 bg-transparent"
              />
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                  <Mic className="w-4 h-4 text-white/60" />
                </button>
                <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                  <ImageIcon className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="relative">
              <div className="flex gap-6 text-sm overflow-x-auto">
                {tabs.map((tab) =>
                  tab === "MORE" ? (
                    <div key={tab} className="relative">
                      <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className={`pb-3 pt-2 whitespace-nowrap transition-all border-b-2 font-medium ${
                          showMoreMenu
                            ? "border-blue-400 text-blue-400"
                            : "border-transparent text-white/60 hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    </div>
                  ) : (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setShowMoreMenu(false);
                      }}
                      className={`pb-3 pt-2 whitespace-nowrap transition-all border-b-2 font-medium ${
                        activeTab === tab
                          ? "border-blue-400 text-blue-400"
                          : "border-transparent text-white/60 hover:text-white"
                      }`}
                    >
                      {tab === "SEARCH" && "🔍 "}
                      {tab}
                    </button>
                  ),
                )}
              </div>

              {/* Dropdown Menu */}
              {showMoreMenu && (
                <div className="absolute top-full left-0 mt-2 bg-black/95 border border-white/20 rounded-lg shadow-xl py-2 min-w-max z-50">
                  {["SHOPPING", "FLIGHTS", "TRAVEL", "TOOLS"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setActiveTab(option);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm whitespace-nowrap"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Results Section */}
            {results.length > 0 ? (
              <div className="max-w-2xl mx-auto">
                {/* Result count */}
                <div className="text-sm text-white/50 mb-6 border-b border-white/10 pb-4">
                  About 1.2B web results (0.42 seconds)
                </div>

                {/* AI Answer Section */}
                {(isAiLoading || generalAiResponse) && (
                  <div className="mb-8 p-6 bg-blue-900/20 border border-blue-500/30 rounded-xl backdrop-blur-md shadow-xl flex flex-col">
                    <div className="flex items-center gap-3 mb-4 border-b border-blue-500/20 pb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <h3 className="text-xl font-semibold text-blue-400 tracking-wide">
                        AI Overview
                      </h3>
                    </div>
                    {isAiLoading ? (
                      <div className="animate-pulse flex flex-col space-y-4 mt-2">
                        <div className="h-4 bg-blue-400/20 rounded w-full"></div>
                        <div className="h-4 bg-blue-400/20 rounded w-5/6"></div>
                        <div className="h-4 bg-blue-400/20 rounded w-4/6"></div>
                      </div>
                    ) : generalAiResponse ? (
                      <div className="text-white/90 whitespace-pre-wrap leading-relaxed text-base">
                        {generalAiResponse}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Results list */}
                <div className="space-y-8">
                  {results.map((result, idx) => (
                    <div key={idx} className="group">
                      <a
                        href="#"
                        className="text-sm text-white/50 hover:text-white/70 hover:underline"
                      >
                        {result.url}
                      </a>
                      <h3 className="text-xl text-blue-400 hover:text-blue-300 hover:underline cursor-pointer mt-1">
                        {result.title}
                      </h3>
                      <p className="text-sm text-white/70 mt-2 leading-relaxed">
                        {result.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-12">
                <h2 className="text-2xl text-white/40 mb-4">Start searching</h2>
                <p className="text-white/50 mb-6">
                  Try: node.js, python, or react
                </p>
                <div className="flex gap-3">
                  {["node.js", "python", "react"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSearch(suggestion)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white/80 text-sm transition-colors border border-white/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
