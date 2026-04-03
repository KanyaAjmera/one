## 💻 Developer Customization Guide

This guide shows you how to customize and extend the ChatBot interface.

---

## 🎨 Customization Examples

### 1. Change Color Scheme

**Location:** Any component using Tailwind classes

**Before (Emerald):**

```tsx
className = "bg-emerald-500 hover:bg-emerald-600 text-white";
```

**After (Blue):**

```tsx
className = "bg-blue-500 hover:bg-blue-600 text-white";
```

**All Color Replacements:**

```
emerald-500 → blue-500
emerald-400 → blue-400
emerald-600 → blue-600
emerald-500/20 → blue-500/20
emerald-500/30 → blue-500/30
```

### 2. Modify Welcome Message

**Location:** `src/components/chat/ChatWindow.tsx`

**Find:**

```tsx
<h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
  Hello,{" "}
  <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
    User
  </span>
</h1>
```

**Replace:**

```tsx
<h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
  Welcome back,{" "}
  <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
    {userName}
  </span>
  !
</h1>
```

### 3. Add New AI Response Template

**Location:** `src/components/chat/mockChatData.ts`

**Add to `aiResponses` object:**

```typescript
export const aiResponses: { [key: string]: string } = {
  python:
    "Python is a powerful programming language! Here are some key features:\n\n**Strengths:**\n- Easy to learn syntax\n- Rich ecosystem (pandas, numpy, sklearn)\n- Great for ML and data science\n\n**Popular frameworks:**\n- Django for web development\n- Flask for lightweight apps\n- FastAPI for modern APIs",

  // ... existing responses
};
```

### 4. Add New Navigation Menu Item

**Location:** `src/components/chat/mockChatData.ts`

**Find:**

```typescript
export const navMenuItems = [
  { id: "explore", label: "Explore", icon: "🔍" },
  // ... existing items
];
```

**Add:**

```typescript
export const navMenuItems = [
  { id: "explore", label: "Explore", icon: "🔍" },
  { id: "shop", label: "Shop", icon: "🛍️" }, // NEW
  // ... rest
];
```

**Then in `AskPage.tsx` handleNavTabChange:**

```typescript
case 'shop':
  // Handle shop tab
  break;
```

### 5. Create New Group Chat

**Location:** `src/components/chat/mockChatData.ts`

**Find:**

```typescript
export const mockGroupChats: Chat[] = [
  // ... existing
];
```

**Add:**

```typescript
{
  id: 'g4',
  title: 'AI Enthusiasts',
  messages: [],
  timestamp: new Date(),
  group: true,
  initials: 'AE',
  avatar: 'bg-orange-500'
}
```

### 6. Add New AI Model

**Location:** `src/components/chat/mockChatData.ts`

**Find:**

```typescript
export const models = [
  { id: "gpt-4", name: "GPT-4", description: "Most capable" },
  // ...
];
```

**Add:**

```typescript
{
  id: 'claude-3',
  name: 'Claude 3',
  description: 'Thoughtful & balanced'
}
```

---

## 🚀 Advanced Customizations

### Connect Real Backend API

**Location:** `src/pages/AskPage.tsx`

**Replace:**

```typescript
// Original: generateAIResponse()
const generateAIResponse = (userMessage: string): string => {
  // ... mock logic
};

// In handleSendMessage:
const aiResponse = generateAIResponse(userMessage);
```

**With:**

```typescript
const generateAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch("YOUR_API_ENDPOINT/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        model: selectedModel,
        conversationId: activeChatId,
      }),
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    return "Sorry, I encountered an error. Please try again.";
  }
};

// In handleSendMessage:
const aiResponse = await generateAIResponse(userMessage);
```

### Add Dark/Light Mode Toggle

**Create new file:** `src/hooks/useTheme.ts`

```typescript
import { useState, useEffect } from "react";

export const useTheme = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setIsDark(saved !== "light");
  }, []);

  const toggle = () => {
    setIsDark(!isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  return { isDark, toggle };
};
```

**Use in Component:**

```tsx
const { isDark, toggle } = useTheme();

return <button onClick={toggle}>{isDark ? "☀️" : "🌙"}</button>;
```

### Persist Chats to LocalStorage

**Add to AskPage.tsx:**

```typescript
// Save chats to localStorage
useEffect(() => {
  localStorage.setItem("savedChats", JSON.stringify(chats));
}, [chats]);

// Load on startup
const [chats, setChats] = useState<Chat[]>(() => {
  const saved = localStorage.getItem("savedChats");
  return saved ? JSON.parse(saved) : mockChats;
});
```

### Add Typing Indicator Animation

**Already Implemented!** See in `ChatMessage.tsx`:

```tsx
{isTyping ? (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
  </div>
) : (
  // ... message content
)}
```

### Add Voice Input Feature

**Update ChatInput.tsx button click:**

```typescript
const handleVoiceInput = async () => {
  const recognition = new (
    window.SpeechRecognition || window.webkitSpeechRecognition
  )();

  recognition.onstart = () => {
    console.log("Listening...");
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");

    setMessage(transcript);
  };

  recognition.start();
};
```

### Add Copy Message Button

**Update ChatMessage.tsx:**

```tsx
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const [copied, setCopied] = useState(false);

const copyToClipboard = () => {
  navigator.clipboard.writeText(content);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

return (
  <div className="relative group">
    {/* message content */}
    <button
      onClick={copyToClipboard}
      className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  </div>
);
```

---

## 🎯 Code Snippets

### Add Emoji Reactions to Messages

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reactions?: string[]; // NEW
}

// In ChatMessage component:
<div className="flex gap-1 mt-2">
  {['👍', '❤️', '😂', '😮'].map(emoji => (
    <button
      key={emoji}
      onClick={() => addReaction(message.id, emoji)}
      className="p-1 hover:bg-gray-700 rounded text-sm"
    >
      {emoji}
    </button>
  ))}
</div>
```

### Add Message Timestamp

```typescript
// In mockChatData.ts add:
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;  // NEW
}

// In ChatMessage render:
<p className="text-xs text-gray-500">
  {new Date(message.timestamp || Date.now()).toLocaleTimeString()}
</p>
```

### Add Edit Message Feature

```typescript
const [editingId, setEditingId] = useState<string | null>(null);
const [editText, setEditText] = useState("");

const handleEdit = (messageId: string, content: string) => {
  setEditingId(messageId);
  setEditText(content);
};

const saveEdit = (messageId: string) => {
  setMessages((prev) =>
    prev.map((msg) =>
      msg.id === messageId ? { ...msg, content: editText } : msg,
    ),
  );
  setEditingId(null);
};
```

### Add Search Within Chat

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredMessages = messages.filter(msg =>
  msg.content.toLowerCase().includes(searchQuery.toLowerCase())
);

// In ChatWindow:
<input
  type="text"
  placeholder="Search messages..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="mb-4 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
/>
```

### Add Message Counter

```tsx
<div className="text-sm text-gray-400">{messages.length} messages</div>
```

### Add Export Chat as JSON

```typescript
const exportChat = () => {
  const dataStr = JSON.stringify(messages, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `chat-${new Date().toISOString()}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};
```

---

## 📊 State Management Enhancements

### Add Context for Global State

**Create:** `src/context/ChatContext.tsx`

```typescript
import { createContext, useState } from 'react';
import type { Chat, Message } from '@/components/chat/mockChatData';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <ChatContext.Provider value={{ chats, setChats, activeChatId, setActiveChatId, messages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
};
```

**Use in Component:**

```typescript
import { useContext } from "react";
import { ChatContext } from "@/context/ChatContext";

const { chats, messages } = useContext(ChatContext);
```

---

## 🧪 Testing Examples

### Test Message Sending

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import AskPage from '@/pages/AskPage';

test('sends message and receives response', async () => {
  const { getByPlaceholderText, getByRole } = render(<AskPage />);

  const input = getByPlaceholderText(/Message ChatBot/i);
  fireEvent.change(input, { target: { value: 'Hello' } });
  fireEvent.click(getByRole('button', { name: /send/i }));

  // Wait for response
  await screen.findByText(/response text/i);
});
```

---

## 🚀 Performance Tips

### Memoize Components

```typescript
import { memo } from 'react';

const ChatMessage = memo(({ role, content }: Props) => {
  return <div>{content}</div>;
});

export default ChatMessage;
```

### Lazy Load Components

```typescript
const ChatWindow = lazy(() => import('@/components/chat/ChatWindow'));
const Sidebar = lazy(() => import('@/components/chat/Sidebar'));

<Suspense fallback={<div>Loading...</div>}>
  <ChatWindow />
</Suspense>
```

### Virtual Scroll Long Lists

```typescript
// For very long message lists:
import { FixedSizeList } from 'react-window';

<FixedSizeList height={600} itemCount={messages.length} itemSize={100}>
  {({ index, style }) => (
    <div style={style}>
      <ChatMessage key={messages[index].id} {...messages[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 🔐 Security Best Practices

```typescript
// Sanitize user input
import DOMPurify from "dompurify";

const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input);
};

// Use in message handler
const handleSendMessage = (userMessage: string) => {
  const sanitized = sanitizeInput(userMessage);
  // ... rest of logic
};
```

---

## 📈 Monitoring & Analytics

```typescript
// Add analytics tracking
import { trackEvent } from "@/analytics";

const handleSendMessage = (message: string) => {
  trackEvent("message_sent", {
    message_length: message.length,
    model: selectedModel,
    chat_id: activeChatId,
  });
  // ... rest of logic
};
```

---

**Happy Customizing! 🚀**

For more help, check:

- `CHATBOT_GUIDE.md` - Full feature documentation
- `ARCHITECTURE.md` - System design & patterns
