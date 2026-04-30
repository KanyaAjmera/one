export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  group?: boolean;
  avatar?: string;
  initials?: string;
}

// Mock chat history
export const mockChats: Chat[] = [
  {
    id: "1",
    title: "React Performance Tips",
    messages: [
      {
        id: "1",
        role: "user",
        content: "How can I optimize React performance?",
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Here are some key performance optimization techniques for React:\n\n**1. Memoization**\nUse `React.memo()` to prevent unnecessary re-renders of components that receive the same props.\n\n**2. useCallback Hook**\nWrap function definitions to maintain referential equality across renders.\n\n**3. useMemo Hook**\nCache expensive computations to avoid recalculating on every render.\n\n**4. Code Splitting**\nUse dynamic imports and lazy loading to reduce initial bundle size.\n\n**5. Virtual Lists**\nFor long lists, render only visible items to improve performance.",
      },
    ],
    timestamp: new Date(Date.now() - 86400000),
    group: false,
  },
  {
    id: "2",
    title: "AI & Machine Learning Basics",
    messages: [
      { id: "1", role: "user", content: "What is machine learning?" },
      {
        id: "2",
        role: "assistant",
        content:
          "Machine Learning (ML) is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.\n\n**Key Concepts:**\n- **Supervised Learning**: Learning from labeled data\n- **Unsupervised Learning**: Finding patterns in unlabeled data\n- **Reinforcement Learning**: Learning through rewards and penalties\n\nML powers everything from recommendation systems to image recognition!",
      },
    ],
    timestamp: new Date(Date.now() - 172800000),
    group: false,
  },
  {
    id: "3",
    title: "Web Design Trends 2024",
    messages: [
      {
        id: "1",
        role: "user",
        content: "What are the latest web design trends?",
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Here are the hottest web design trends for 2024:\n\n**1. Glassmorphism** - Semi-transparent frosted glass effect\n**2. AI Integration** - Chatbots and personalized experiences\n**3. Dark Mode** - Energy efficient and easier on the eyes\n**4. Micro-interactions** - Subtle animations and feedback\n**5. 3D Elements** - Immersive visual experiences\n**6. Minimalism** - Clean, focused designs\n**7. Sustainable Design** - Eco-conscious aesthetics",
      },
    ],
    timestamp: new Date(Date.now() - 259200000),
    group: false,
  },
];

// Mock group chats
export const mockGroupChats: Chat[] = [
  {
    id: "g1",
    title: "Design Team",
    messages: [],
    timestamp: new Date(),
    group: true,
    initials: "DT",
    avatar: "bg-blue-500",
  },
  {
    id: "g2",
    title: "Frontend Devs",
    messages: [],
    timestamp: new Date(),
    group: true,
    initials: "FD",
    avatar: "bg-purple-500",
  },
  {
    id: "g3",
    title: "Product Team",
    messages: [],
    timestamp: new Date(),
    group: true,
    initials: "PT",
    avatar: "bg-pink-500",
  },
];

// AI response suggestions
export const aiResponses: { [key: string]: string } = {
  hello:
    "Hello! How can I assist you today? Whether you need help with coding, writing, analysis, or creative projects, I'm here to help!",
  "what can you do":
    "I can help you with a wide range of tasks:\n\n- **Writing & Editing**: Essays, code reviews, creative content\n- **Programming**: Debug code, explain concepts, write scripts\n- **Analysis**: Summarize documents, break down complex topics\n- **Brainstorming**: Generate ideas for projects and creative work\n- **Learning**: Explain subjects from beginner to advanced levels\n\nFeel free to ask me anything!",
  help: "I'm here to help! You can ask me about:\n\n📝 Writing and content creation\n💻 Programming and debugging\n🧠 Explanations and learning\n🎨 Creative ideas\n📊 Data analysis\n\nJust type your question and I'll do my best to assist!",
};

// Welcome suggestions
export const welcomeSuggestions = [
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

// Navigation menu items
export const navMenuItems = [
  { id: "explore", label: "Explore", icon: "🔍" },
  { id: "research", label: "Deep Research", icon: "🔬" },
  { id: "codex", label: "Codex", icon: "💻" },
  { id: "gpts", label: "GPTs", icon: "🤖" },
  { id: "projects", label: "Projects", icon: "📁" },
];

// Models
export const models = [
  { id: "gpt-4", name: "GPT-4", description: "Most capable" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Faster & smarter" },
  { id: "gpt-3.5", name: "GPT-3.5", description: "Fast & efficient" },
];
