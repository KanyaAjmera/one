/**
 * useChatHistory — persists chat messages to localStorage per mode (general/law)
 */
import { useState, useCallback } from 'react';

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface StoredChat {
  id: string;
  title: string;
  mode: 'general' | 'law';
  messages: StoredMessage[];
  updatedAt: string;
}

const STORAGE_KEY = 'infinity_chat_history';

function readStorage(): StoredChat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(chats: StoredChat[]) {
  // Keep last 50 chats, each capped at 100 messages to avoid huge storage
  const trimmed = chats.slice(0, 50).map(c => ({
    ...c,
    messages: c.messages.slice(-100),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function useChatHistory(mode: 'general' | 'law') {
  const [chats, setChats] = useState<StoredChat[]>(() =>
    readStorage().filter(c => c.mode === mode)
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const createChat = useCallback((firstMessage: string): string => {
    const id = Date.now().toString();
    const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '');
    const newChat: StoredChat = {
      id,
      title,
      mode,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setChats(prev => {
      const updated = [newChat, ...prev];
      const all = readStorage().filter(c => c.mode !== mode);
      writeStorage([...updated, ...all]);
      return updated;
    });
    setActiveChatId(id);
    return id;
  }, [mode]);

  const addMessages = useCallback((chatId: string, userMsg: StoredMessage, aiMsg: StoredMessage) => {
    setChats(prev => {
      const updated = prev.map(c => {
        if (c.id !== chatId) return c;
        const newMessages = [...c.messages, userMsg, aiMsg];
        const title = c.messages.length === 0
          ? userMsg.content.slice(0, 40) + (userMsg.content.length > 40 ? '...' : '')
          : c.title;
        return { ...c, messages: newMessages, title, updatedAt: new Date().toISOString() };
      });
      const all = readStorage().filter(c => c.mode !== mode);
      writeStorage([...updated, ...all]);
      return updated;
    });
  }, [mode]);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const updated = prev.filter(c => c.id !== chatId);
      const all = readStorage().filter(c => c.mode !== mode);
      writeStorage([...updated, ...all]);
      return updated;
    });
    if (activeChatId === chatId) setActiveChatId(null);
  }, [mode, activeChatId]);

  const clearAll = useCallback(() => {
    const all = readStorage().filter(c => c.mode !== mode);
    writeStorage(all);
    setChats([]);
    setActiveChatId(null);
  }, [mode]);

  return { chats, activeChatId, setActiveChatId, createChat, addMessages, deleteChat, clearAll };
}

// For dashboard stats
export function getChatStats() {
  const all = readStorage();
  return {
    totalChats: all.length,
    generalChats: all.filter(c => c.mode === 'general').length,
    lawChats: all.filter(c => c.mode === 'law').length,
    totalMessages: all.reduce((sum, c) => sum + c.messages.length, 0),
  };
}
