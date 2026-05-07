import { useState, useEffect } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import Navbar from "@/components/chat/Navbar";
import AnoAI from "@/components/ui/animated-shader-background";
import { mockChats, aiResponses } from "@/components/chat/mockChatData";
import type { Chat, Message } from "@/components/chat/mockChatData";
import { useTheme } from "@/contexts/ThemeContext";
import axios from "axios";
import { NODE_API_URL } from "@/config";

export default function AskPage() {
  const { isLightMode, setMode } = useTheme();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState("explore");
  const [selectedModel, setSelectedModel] = useState("gpt-4");

  // Chat State
  const [_chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // The backend now handles the generation with the SYSTEM_PROMPT.

  // Handle sending messages
  const handleSendMessage = async (userMessage: string) => {
    setShowWelcome(false);

    // ✨ Switch Vibe & Light Mode Detect ✨
    const lowerMsg = userMessage.toLowerCase();
    if (
      lowerMsg.includes("light mode") ||
      lowerMsg.includes("make it bright") ||
      lowerMsg.includes("switch vibe")
    ) {
      setMode("light");
      return;
    }

    if (lowerMsg.includes("dark mode") || lowerMsg.includes("make it dark")) {
      setMode("default");
      return;
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Generate AI response by calling backend
    let aiResponse = "";
    try {
      const res = await axios.post(`${NODE_API_URL}/api/chat/ask`, {
        message: userMessage,
      });
      aiResponse = res.data.response;
    } catch (error) {
      console.error("Error communicating with AI engine:", error);
      aiResponse = "[ANSWER]\nI'm sorry, I couldn't process your request at this time.\n\n[EXPLANATION]\nThere was an error communicating with the backend API.\n\n[SOURCE BASIS]\n- System Error";
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);

    // Save to active chat if one is selected, else create a new chat
    if (activeChatId) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, userMsg, aiMsg] }
            : chat,
        ),
      );
    } else {
      const newChatId = Date.now().toString();
      const newChatTitle = userMessage.slice(0, 25) + (userMessage.length > 25 ? "..." : "");
      const newChat: Chat = {
        id: newChatId,
        title: newChatTitle,
        messages: [userMsg, aiMsg],
        timestamp: new Date(),
        group: false,
      };
      setChats((prevChats) => [newChat, ...prevChats]);
      setActiveChatId(newChatId);
    }
  };

  // Handle chat selection
  const handleSelectChat = (chat: Chat) => {
    setActiveChatId(chat.id);
    setMessages(chat.messages);
    setShowWelcome(false);
    setSidebarOpen(false);
  };

  // Handle new chat
  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setShowWelcome(true);
    setSidebarOpen(false);
  };

  // Handle welcome suggestion click
  const handleWelcomeSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className={`flex h-screen w-screen relative overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-white/0' : 'bg-black/0'}`}>
      {/* Background is now managed globally by App.tsx */}

      {/* Content Layer */}
      <div className="relative z-10 flex w-full h-full max-h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          activeNavTab={activeNavTab}
          onNavTabChange={setActiveNavTab}
          activeChatId={activeChatId}
          chats={_chats}
        />

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col backdrop-blur-sm transition-colors duration-500 ${isLightMode ? 'bg-white/30' : 'bg-gray-950/60'}`}>
          {/* Navbar */}
          <Navbar
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isLightMode={isLightMode}
            onToggleTheme={() => {
              setMode(isLightMode ? 'default' : 'light');
            }}
          />

          {/* Chat Window */}
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            showWelcome={showWelcome}
            onWelcomeSelect={handleWelcomeSuggestion}
            isLightMode={isLightMode}
          />
        </div>
      </div>
    </div>
  );
}
