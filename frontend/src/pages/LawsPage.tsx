import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import AnoAI from "@/components/ui/animated-shader-background";
import { useTheme } from "@/contexts/ThemeContext";

interface Punishment {
  type: string[];
  duration?: string;
  fine?: string;
  note?: string;
}

interface Law {
  law: string;
  section: string;
  title: string;
  category: string;
  description: string;
  elements: string[];
  punishment: Punishment;
  bailable: boolean;
  cognizable: boolean;
  compoundable: boolean;
  triable_by: string;
  keywords: string[];
}

interface LawCategory {
  category: string;
  laws: Law[];
}

export default function LawsPage() {
  const { isLightMode } = useTheme();
  const navigate = useNavigate();

  const [lawsData, setLawsData] = useState<LawCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchLaws = async () => {
      const { NODE_API_URL } = await import("../config");
      axios
        .get(`${NODE_API_URL}/api/chat/laws`)
        .then((res) => {
          if (res.data.success) {
            setLawsData(res.data.data);
          }
        })
        .catch((err) => console.error("Failed to fetch laws:", err));
    };
    fetchLaws();
  }, []);

  const categories = ["All", ...lawsData.map((c) => c.category)];

  const filteredLaws = useMemo(() => {
    let filtered = lawsData;

    // Filter by category chip
    if (selectedCategory !== "All") {
      filtered = filtered.filter((cat) => cat.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered
        .map((cat) => ({
          category: cat.category,
          laws: cat.laws.filter((law) => {
            const searchString =
              `${law.title} ${law.description} ${law.section} ${law.law} ${law.keywords.join(" ")}`.toLowerCase();
            return searchString.includes(lowerQ);
          }),
        }))
        .filter((cat) => cat.laws.length > 0);
    }

    return filtered;
  }, [lawsData, searchQuery, selectedCategory]);

  return (
    <div
      className={`flex flex-col h-screen w-screen relative overflow-hidden transition-colors duration-1000 ${isLightMode ? "bg-white/0 text-black" : "bg-black/0 text-white"}`}
    >
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <AnoAI />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-full overflow-y-auto pb-20">
        {/* Search Bar */}
        <div className="flex justify-center mt-10 px-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laws, sections, crimes..."
            className={`w-full max-w-2xl p-4 rounded-full shadow-lg backdrop-blur-md outline-none transition-all ${isLightMode ? "bg-white/80 border border-gray-300 text-black placeholder-gray-500 focus:ring-2 focus:ring-emerald-400" : "bg-zinc-900/80 border border-zinc-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"}`}
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-3 justify-center mt-6 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-200 shadow-sm ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-white scale-105"
                  : isLightMode
                    ? "bg-white/70 hover:bg-white text-gray-700 hover:text-black border border-gray-200"
                    : "bg-zinc-800/80 hover:bg-zinc-700 text-gray-300 hover:text-white border border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Laws Content */}
        <div className="mt-10 flex w-full justify-center px-4">
          <div className="w-full max-w-6xl space-y-10">
            {filteredLaws.length === 0 ? (
              <div className="text-center mt-20 opacity-60">
                <p className="text-xl">No laws found matching your criteria.</p>
              </div>
            ) : (
              filteredLaws.map((categoryData) => (
                <div key={categoryData.category} className="mb-8">
                  {/* Category Title */}
                  <h2 className="text-xl font-bold text-emerald-400 mb-6 uppercase tracking-wider drop-shadow-sm border-b border-emerald-500/20 pb-2">
                    {categoryData.category}
                  </h2>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryData.laws.map((law, idx) => (
                      <div
                        key={idx}
                        className={`p-6 flex flex-col rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-lg backdrop-blur-sm border ${
                          isLightMode
                            ? "bg-white/80 hover:bg-white border-gray-200 hover:shadow-xl"
                            : "bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800/50 hover:border-zinc-700"
                        }`}
                      >
                        <h3 className="text-xl font-bold capitalize mb-1">
                          {law.title}
                        </h3>
                        <p
                          className={`text-sm font-medium ${isLightMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                          {law.law} <span className="opacity-50 mx-1">•</span>{" "}
                          Sec {law.section}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${law.bailable ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}
                          >
                            {law.bailable ? "Bailable" : "Non-Bailable"}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${law.cognizable ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400"}`}
                          >
                            {law.cognizable ? "Cognizable" : "Non-Cognizable"}
                          </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-500/20 flex-1">
                          <p
                            className={`text-sm leading-relaxed ${isLightMode ? "text-gray-700" : "text-gray-300"}`}
                          >
                            {law.description}
                          </p>

                          {law.elements && law.elements.length > 0 && (
                            <div className="mt-3">
                              <p
                                className={`text-xs font-semibold uppercase ${isLightMode ? "text-gray-400" : "text-gray-500"} mb-1`}
                              >
                                Elements
                              </p>
                              <ul className="list-disc list-inside text-xs space-y-0.5 opacity-80">
                                {law.elements.map((el, i) => (
                                  <li key={i}>{el}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-4 inline-flex flex-col px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20 w-full">
                            <span className="font-bold uppercase tracking-wide mb-1">
                              Punishment
                            </span>
                            <span>{law.punishment.type.join(", ")}</span>
                            {law.punishment.duration && (
                              <span>Duration: {law.punishment.duration}</span>
                            )}
                            {law.punishment.fine && (
                              <span>Fine: {law.punishment.fine}</span>
                            )}
                            {law.punishment.note && (
                              <span>Note: {law.punishment.note}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => navigate("/lawsai")}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-110 ${isLightMode ? "bg-emerald-500 text-white" : "bg-emerald-500 text-white hover:bg-emerald-400"}`}
            title="Chat with Laws AI"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
