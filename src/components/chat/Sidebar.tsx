import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Menu, X, Gavel } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navMenuItems } from "./mockChatData";
import type { Chat } from "./mockChatData";
import axios from "axios";
import { NODE_API_URL } from "@/config";

interface Law {
  crime: string;
  law: string;
  section: string;
  description: string;
  punishment: string;
}

interface LawCategory {
  category: string;
  laws: Law[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  activeNavTab: string;
  onNavTabChange: (tab: string) => void;
  activeChatId: string | null;
  chats: Chat[];
  hideNavMenu?: boolean;
}

export default function Sidebar({
  isOpen,
  onToggle,
  onSelectChat,
  onNewChat,
  activeNavTab,
  onNavTabChange,
  activeChatId,
  chats,
  hideNavMenu = false,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({
    group: true,
    personal: true,
  });
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [chats, searchQuery]);

  const [lawsData, setLawsData] = useState<LawCategory[]>([]);
  const [expandedLawCategories, setExpandedLawCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (hideNavMenu) {
      axios.get(`${NODE_API_URL}/api/chat/laws`)
        .then(res => {
          if (res.data.success) {
            setLawsData(res.data.data);
          }
        })
        .catch(err => console.error("Failed to fetch laws:", err));
    }
  }, [hideNavMenu]);

  const filteredLaws = useMemo(() => {
    if (!searchQuery) return lawsData;
    const lowerQ = searchQuery.toLowerCase();
    
    return lawsData.map(cat => ({
      category: cat.category,
      laws: cat.laws.filter(law => 
        law.crime.toLowerCase().includes(lowerQ) || 
        law.description.toLowerCase().includes(lowerQ) ||
        law.section.toLowerCase().includes(lowerQ)
      )
    })).filter(cat => cat.laws.length > 0);
  }, [lawsData, searchQuery]);

  const toggleLawCategory = (category: string) => {
    setExpandedLawCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 lg:hidden z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isDesktop ? 0 : isOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed lg:static left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900/50 via-gray-900/50 to-black/50 border-r border-gray-700 z-40 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <span className="text-white font-bold hidden sm:inline">
                ChatBot
              </span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              onToggle();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 border border-white/10"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>

        {/* Search Chats */}
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        {!hideNavMenu && (
          <div className="px-3 py-4 border-b border-gray-700">
            <div className="space-y-1">
              {navMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeNavTab === item.id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">


          {/* Content Swapper */}
          {!hideNavMenu ? (
            <div className="px-3 py-4">
              <button
                onClick={() =>
                  setExpandedGroups((p) => ({ ...p, personal: !p.personal }))
                }
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                <span>Your Chats</span>
                <span>{expandedGroups.personal ? "▼" : "▶"}</span>
              </button>

              <AnimatePresence>
                {expandedGroups.personal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-2"
                  >
                    {filteredChats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => {
                          onSelectChat(chat);
                          onToggle();
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 truncate ${
                          activeChatId === chat.id
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                        title={chat.title}
                      >
                        {chat.title}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="px-3 py-4 space-y-4">
              <div className="flex items-center gap-2 px-3 py-1 mb-2">
                <Gavel className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-white tracking-wide">BROWSE LAWS</span>
              </div>
              
              {filteredLaws.map(cat => (
                <div key={cat.category} className="space-y-1">
                  <button 
                    onClick={() => toggleLawCategory(cat.category)} 
                    className="w-full flex justify-between items-center px-3 py-2 text-xs font-semibold text-emerald-400/80 hover:text-emerald-300 transition-colors uppercase tracking-wider bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <span>{cat.category} ({cat.laws.length})</span>
                    <span>{expandedLawCategories[cat.category] ? "▼" : "▶"}</span>
                  </button>
                  <AnimatePresence>
                    {expandedLawCategories[cat.category] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-2 px-1"
                      >
                        {cat.laws.map((law, idx) => (
                          <div key={idx} className="p-3 bg-gray-800/60 rounded-lg border border-gray-700 shadow-sm">
                            <div className="text-white font-medium text-sm capitalize">{law.crime}</div>
                            <div className="text-xs text-gray-400 mt-1">{law.law} - Sec {law.section}</div>
                            <div className="text-xs text-emerald-400/90 mt-1.5 font-medium">{law.punishment}</div>
                            <div className="text-xs text-gray-500 mt-1 leading-relaxed">{law.description}</div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              {filteredLaws.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-500">
                  No laws match your search.
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-700 p-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            <div className="flex-1 text-left hidden sm:block">
              <p className="text-sm font-medium text-white">User</p>
              <p className="text-xs text-gray-400">Free Plan</p>
            </div>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 left-6 lg:hidden z-30 p-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
