import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import Navbar from "@/components/chat/Navbar";
import type { Chat, Message } from "@/components/chat/mockChatData";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChatHistory } from "@/hooks/useChatHistory";
import axios from "axios";
import { NODE_API_URL, PYTHON_API_URL } from "@/config";

export default function AskPage() {
  const { isLightMode, setMode } = useTheme();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState("explore");
  const [selectedModel, setSelectedModel] = useState("Gemini 2.0");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const { chats, activeChatId, setActiveChatId, createChat, addMessages, deleteChat } =
    useChatHistory("general");

  // Convert stored chats to Chat[] for Sidebar
  const sidebarChats: Chat[] = chats.map((c) => ({
    id: c.id,
    title: c.title,
    messages: c.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    })),
    timestamp: new Date(c.updatedAt),
    group: false,
  }));

  const handleSendMessage = async (userMessage: string) => {
    setShowWelcome(false);

    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes("light mode") || lowerMsg.includes("make it bright") || lowerMsg.includes("switch vibe")) {
      setMode("light"); return;
    }
    if (lowerMsg.includes("dark mode") || lowerMsg.includes("make it dark")) {
      setMode("dark"); return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let aiResponse = "";
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/chat/ask`,
        { message: userMessage, mode: "general" },
        { timeout: 30000 },
      );
      aiResponse = res.data.response;
    } catch (nodeError) {
      console.warn("Node AI backend unavailable, trying Python fallback:", nodeError);
      try {
        const res = await axios.post(
          `${PYTHON_API_URL}/api/chat/ask`,
          { message: userMessage, mode: "general" },
          { timeout: 30000 },
        );
        aiResponse = res.data.response;
      } catch {
        aiResponse = "Sorry, I couldn't reach the AI engine. Please try again.";
      }
    }

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: aiResponse };
    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);

    // Save to localStorage history
    let chatId = activeChatId;
    if (!chatId) {
      chatId = createChat(userMessage);
    }
    addMessages(chatId, 
      { id: userMsg.id, role: "user", content: userMessage, timestamp: new Date().toISOString() },
      { id: aiMsg.id, role: "assistant", content: aiResponse, timestamp: new Date().toISOString() }
    );
  };

  const handleSelectChat = (chat: Chat) => {
    setActiveChatId(chat.id);
    setMessages(chat.messages);
    setShowWelcome(false);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setShowWelcome(true);
    setSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen w-screen relative overflow-hidden transition-colors duration-1000 ${isLightMode ? "bg-white/0" : "bg-black/0"}`}>
      <div className="relative z-10 flex w-full h-full max-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          activeNavTab={activeNavTab}
          onNavTabChange={setActiveNavTab}
          activeChatId={activeChatId}
          chats={sidebarChats}
        />
        <div className={`flex-1 flex flex-col backdrop-blur-sm transition-colors duration-500 ${isLightMode ? "bg-white/30" : "bg-gray-950/60"}`}>
          <Navbar
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isLightMode={isLightMode}
            onToggleTheme={() => setMode(isLightMode ? "dark" : "light")}
          />
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            showWelcome={showWelcome}
            onWelcomeSelect={handleSendMessage}
            isLightMode={isLightMode}
          />
        </div>
      </div>
    </div>
  );
}
