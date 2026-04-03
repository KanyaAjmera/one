import { useState } from "react";
import { Menu, Settings, LogOut, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { models } from "./mockChatData";

interface NavbarProps {
  onMenuClick: () => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isLightMode?: boolean;
  onToggleTheme?: () => void;
}

export default function Navbar({
  onMenuClick,
  selectedModel,
  onModelChange,
  isLightMode,
  onToggleTheme,
}: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentModel = models.find((m) => m.id === selectedModel);

  return (
    <nav className="sticky top-0 z-20 border-b border-gray-700 bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600" />
              <span className="font-semibold text-white">ChatBot</span>
            </div>
          </div>

          {/* Center Section - Model Selector */}
          <div className="relative">
            <motion.button
              onClick={() => setShowDropdown(!showDropdown)}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-all border border-gray-700"
            >
              <span>{currentModel?.name || "Select Model"}</span>
              <span className="text-xs text-gray-400">
                {currentModel?.description}
              </span>
              <span className="text-xs">▼</span>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-30"
                >
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelChange(model.id);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 ${
                        selectedModel === model.id
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-gray-200"
                      }`}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-400">
                        {model.description}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                U
              </div>

              {/* Profile Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-30"
                  >
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2 border-b border-gray-700">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTheme?.();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2 border-b border-gray-700"
                    >
                      {isLightMode ? (
                        <>
                          <Moon className="w-4 h-4" />
                          Dark Mode
                        </>
                      ) : (
                        <>
                          <Sun className="w-4 h-4" />
                          Light Mode
                        </>
                      )}
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}
