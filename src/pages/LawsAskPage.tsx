import { useState, useEffect } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import Navbar from "@/components/chat/Navbar";
import type { Chat, Message } from "@/components/chat/mockChatData";
import { useTheme } from "@/contexts/ThemeContext";
import axios from "axios";

const initialLawsChats: Chat[] = [
  {
    id: "1",
    title: "Welcome to LawsAsk",
    messages: [
      {
        id: "m1",
        role: "assistant",
        content: "Hello! I am LawsAsk, your Indian Law Reference Bot. You can ask me questions about the IPC, IT Act, Cyber Crime, and other legal topics.\n\nTry asking: 'What is the punishment for hacking?' or 'IPC 302'"
      }
    ],
    timestamp: new Date(),
    group: false
  }
];

export default function LawsAskPage() {
  const { isLightMode, setMode } = useTheme();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState("explore");
  const [selectedModel, setSelectedModel] = useState("LawsAsk");

  // Chat State
  const [_chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem("lawsAskChats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        }));
      } catch (e) {
        return initialLawsChats;
      }
    }
    return initialLawsChats;
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(_chats[0]?.id || null);
  const [messages, setMessages] = useState<Message[]>(_chats[0]?.messages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(messages.length === 0);

  useEffect(() => {
    localStorage.setItem("lawsAskChats", JSON.stringify(_chats));
  }, [_chats]);

  // Handle sending messages
  const handleSendMessage = async (userMessage: string) => {
    setShowWelcome(false);

    // Switch Vibe & Light Mode Detect
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
      const res = await axios.post("/api/lawsask", {
        query: userMessage,
      });
      aiResponse = res.data.response;
    } catch (error) {
      console.error("Error communicating with AI engine:", error);
      aiResponse = "Error connecting to server. Please ensure backend is running.";
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
