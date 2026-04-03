import { useState, useEffect } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import Navbar from "@/components/chat/Navbar";
import AnoAI from "@/components/ui/animated-shader-background";
import { mockChats, aiResponses } from "@/components/chat/mockChatData";
import type { Chat, Message } from "@/components/chat/mockChatData";
import { useTheme } from "@/contexts/ThemeContext";

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

  // Generate mock AI response (simulating different responses)
  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Check for keyword matches
    for (const [key, response] of Object.entries(aiResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Generic responses based on message type
    if (lowerMessage.endsWith("?")) {
      const responses = [
        `That's a great question! Based on your inquiry about "${userMessage.slice(0, 30)}...", here are some key insights:\n\n• This is a complex topic that requires careful consideration\n• There are multiple approaches to address this\n• The best solution depends on your specific context and requirements`,
        `Interesting! I'd suggest:\n\n1. **Research** - Look into the fundamentals\n2. **Practice** - Hands-on experience is crucial\n3. **Iterate** - Keep refining your approach\n4. **Collaborate** - Seek feedback from others`,
        `Great question! Here's my take:\n\n**Key Points:**\n- Understanding the problem is the first step\n- Break it down into smaller components\n- Test your assumptions with real data\n- Document your findings for future reference`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        `That's interesting! I understand you're saying "${userMessage.slice(0, 40)}...". Here are some thoughts:\n\nThis approach makes sense because it \n- Addresses the core issue\n- Is scalable and maintainable\n- Follows best practices`,
        `Thanks for sharing! Building on that idea:\n\n✓ You're on the right track\n✓ Consider adding more context\n✓ Test thoroughly before implementing`,
        `Good point! To expand on that:\n\nThe key is to focus on what matters most. By prioritizing tasks and breaking them into manageable chunks, you can make steady progress toward your goals.`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

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

    // Simulate AI thinking delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000),
    );

    // Generate AI response
    const aiResponse = generateAIResponse(userMessage);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);

    // Save to active chat if one is selected
    if (activeChatId) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, userMsg, aiMsg] }
            : chat,
        ),
      );
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
