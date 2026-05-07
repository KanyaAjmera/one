import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Message } from "./mockChatData";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  showWelcome: boolean;
  onWelcomeSelect?: (suggestion: string) => void;
  isLightMode?: boolean;
}

const welcomeSuggestions = [
  {
    icon: "💡",
    title: "Explain something",
    subtitle: "I can explain complex topics in simple terms",
  },
  {
    icon: "✍️",
    title: "Write something",
    subtitle: "Help with writing essays, code, or creative content",
  },
  {
    icon: "🐛",
    title: "Debug code",
    subtitle: "Help identify and fix errors in your code",
  },
  {
    icon: "🎨",
    title: "Brainstorm ideas",
    subtitle: "Generate creative ideas for projects",
  },
];

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  showWelcome,
  onWelcomeSelect,
  isLightMode,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 ${isLightMode ? 'bg-white/40 backdrop-blur-md' : 'bg-gradient-to-b from-gray-950/20 to-black/20'}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 px-4 pt-8 pb-6">
        {showWelcome ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto"
          >
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">🤖</span>
              </div>
              <h1 className={`text-4xl sm:text-5xl font-bold mb-4 transition-colors ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                Hello,{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                  User
                </span>
              </h1>
              <p className={`text-lg max-w-xl transition-colors ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                How can I assist you today? Ask me anything or explore these
                suggestions to get started.
              </p>
            </motion.div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              {welcomeSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onWelcomeSelect?.(suggestion.title)}
                  className={`p-4 rounded-2xl border transition-all text-left group shadow-sm hover:shadow-md ${
                    isLightMode 
                      ? 'bg-white/80 border-gray-200 hover:border-blue-400 hover:bg-white' 
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800/80'
                  }`}
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                    {suggestion.icon}
                  </div>
                  <h3 className={`font-semibold mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                    {suggestion.title}
                  </h3>
                  <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{suggestion.subtitle}</p>
                </motion.button>
              ))}
            </div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 grid grid-cols-3 sm:grid-cols-4 gap-4 text-center"
            >
              {[
                { icon: "⚡", label: "Fast" },
                { icon: "🔒", label: "Secure" },
                { icon: "🎯", label: "Accurate" },
                { icon: "♾️", label: "Unlimited" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                isLightMode={isLightMode}
              />
            ))}
            {isLoading && <ChatMessage role="assistant" content="" isTyping isLightMode={isLightMode} />}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} isLightMode={isLightMode} />
    </div>
  );
}
