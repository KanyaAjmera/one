export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface GroupChat {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export const mockGroupChats: GroupChat[] = [
  { id: 'g1', name: 'Design Team', initials: 'DT', color: 'bg-blue-500' },
  { id: 'g2', name: 'Dev Ops', initials: 'DO', color: 'bg-purple-500' },
  { id: 'g3', name: 'Marketing', initials: 'MK', color: 'bg-green-500' },
];

export const mockPersonalChats: ChatSession[] = [
  {
    id: 'c1',
    title: 'Dark Mode UI Ideas',
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    messages: [
      { id: 'm1', role: 'user', content: 'Give me some ideas for a dark mode palette', timestamp: Date.now() - 100000 },
      { id: 'm2', role: 'assistant', content: 'A great dark mode palette typically uses deeply muted colors or very dark slate as backgrounds instead of pure black. Think of #1E1E2E combined with neon accents like #FFB86C or #8BE9FD.', timestamp: Date.now() - 50000 }
    ]
  },
  {
    id: 'c2',
    title: 'React Interview Prep',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    messages: [
      { id: 'm3', role: 'user', content: 'What are the most common React interview questions?', timestamp: Date.now() - 200000 },
      { id: 'm4', role: 'assistant', content: 'Commonly asked questions include:\n1. The difference between `useEffect` and `useLayoutEffect`.\n2. How the Virtual DOM works under the hood.\n3. Managing complex state using React Context vs Redux.', timestamp: Date.now() - 150000 }
    ]
  },
  {
    id: 'c3',
    title: 'Weekend Travel Plan',
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    messages: [
      { id: 'm5', role: 'user', content: 'Plan a quick 2-day trip to Kyoto.', timestamp: Date.now() - 300000 },
      { id: 'm6', role: 'assistant', content: '**Day 1:** Start with the Fushimi Inari Shrine early in the morning.\n**Day 2:** Arashiyama Bamboo Grove and the Monkey Park.', timestamp: Date.now() - 250000 }
    ]
  }
];

// Simple canned responses for fake AI replies based on keywords
export const generateFakeReply = (input: string): string => {
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('hello') || lowerInput.includes('hi')) return 'Hello there! How can I assist you today?';
  if (lowerInput.includes('react')) return 'React is a fantastic library for building user interfaces. Want some code snippets or architecture advice?';
  if (lowerInput.includes('code')) return '```javascript\n// Here is a quick example!\nfunction greet() {\n  console.log("Hello, world!");\n}\n```\nLet me know if you need specific logic built out.';
  if (lowerInput.includes('joke')) return 'Why do programmers always mix up Halloween and Christmas?\n\nBecause Oct 31 == Dec 25. 🎃🎄';
  
  return 'That is very interesting! Can you elaborate more on that? As an AI, I am here to help you brainstorm and outline your ideas.';
};
