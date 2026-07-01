/**
 * useConversations — manages persistent chat history via the Node backend.
 *
 * When the user is NOT logged in, falls back gracefully to in-memory state
 * so the chat still works for anonymous users.
 */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { NODE_API_URL } from '../config';
import type { Chat, Message } from '../components/chat/mockChatData';

interface ConversationSummary {
    _id: string;
    title: string;
    mode: string;
    pinned: boolean;
    updatedAt: string;
}

function toChat(conv: ConversationSummary, messages: Message[] = []): Chat {
    return {
        id: conv._id,
        title: conv.title,
        messages,
        timestamp: new Date(conv.updatedAt),
        group: false,
    };
}

export function useConversations(token: string | null) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;
    const isLoggedIn = Boolean(token);

    // Load conversation list on mount / login
    useEffect(() => {
        if (!isLoggedIn) return;
        setIsLoadingHistory(true);
        axios
            .get<{ success: boolean; data: ConversationSummary[] }>(
                `${NODE_API_URL}/api/conversations`,
                { headers: authHeader }
            )
            .then((res) => {
                if (res.data.success) {
                    setChats(res.data.data.map((c) => toChat(c)));
                }
            })
            .catch((err) => console.error('Failed to load conversations:', err))
            .finally(() => setIsLoadingHistory(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    /**
     * Start a new conversation and return its id.
     * For anonymous users, creates a local-only chat.
     */
    const createConversation = useCallback(
        async (firstMessage: string, mode = 'general'): Promise<string> => {
            const title = firstMessage.slice(0, 60) + (firstMessage.length > 60 ? '...' : '');

            if (!isLoggedIn) {
                const id = Date.now().toString();
                const newChat: Chat = {
                    id,
                    title,
                    messages: [],
                    timestamp: new Date(),
                    group: false,
                };
                setChats((prev) => [newChat, ...prev]);
                return id;
            }

            try {
                const res = await axios.post<{ success: boolean; data: ConversationSummary }>(
                    `${NODE_API_URL}/api/conversations`,
                    { title, mode },
                    { headers: authHeader }
                );
                const conv = res.data.data;
                const newChat = toChat(conv);
                setChats((prev) => [newChat, ...prev]);
                return conv._id;
            } catch (err) {
                console.error('Failed to create conversation:', err);
                // fallback local
                const id = Date.now().toString();
                setChats((prev) => [{ id, title, messages: [], timestamp: new Date(), group: false }, ...prev]);
                return id;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isLoggedIn, token]
    );

    /**
     * Load full messages for a conversation from the server.
     * Returns the messages array.
     */
    const loadMessages = useCallback(
        async (chatId: string): Promise<Message[]> => {
            if (!isLoggedIn) {
                const chat = chats.find((c) => c.id === chatId);
                return chat?.messages ?? [];
            }
            try {
                const res = await axios.get<{ success: boolean; data: { messages: Array<{ role: string; content: string }> } }>(
                    `${NODE_API_URL}/api/conversations/${chatId}`,
                    { headers: authHeader }
                );
                if (res.data.success) {
                    return res.data.data.messages.map((m, i) => ({
                        id: `${chatId}-${i}`,
                        role: m.role as 'user' | 'assistant',
                        content: m.content,
                    }));
                }
            } catch (err) {
                console.error('Failed to load messages:', err);
            }
            return [];
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isLoggedIn, token, chats]
    );

    /**
     * Save a user+assistant message pair to a conversation.
     * Updates local state optimistically.
     */
    const saveMessages = useCallback(
        async (chatId: string, userMessage: string, assistantMessage: string) => {
            const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', content: userMessage };
            const aiMsg: Message = { id: `${Date.now()}-a`, role: 'assistant', content: assistantMessage };

            // Optimistic local update
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === chatId
                        ? {
                              ...chat,
                              messages: [...chat.messages, userMsg, aiMsg],
                              timestamp: new Date(),
                              // update title from first message
                              title: chat.messages.length === 0
                                  ? userMessage.slice(0, 60) + (userMessage.length > 60 ? '...' : '')
                                  : chat.title,
                          }
                        : chat
                )
            );

            if (!isLoggedIn) return;

            try {
                await axios.post(
                    `${NODE_API_URL}/api/conversations/${chatId}/messages`,
                    { userMessage, assistantMessage },
                    { headers: authHeader }
                );
            } catch (err) {
                console.error('Failed to persist messages:', err);
                // Local state already updated — user won't notice a silent network failure here
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isLoggedIn, token]
    );

    /**
     * Delete a conversation (server + local state).
     */
    const deleteConversation = useCallback(
        async (chatId: string) => {
            setChats((prev) => prev.filter((c) => c.id !== chatId));
            if (!isLoggedIn) return;
            try {
                await axios.delete(`${NODE_API_URL}/api/conversations/${chatId}`, {
                    headers: authHeader,
                });
            } catch (err) {
                console.error('Failed to delete conversation:', err);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isLoggedIn, token]
    );

    return {
        chats,
        setChats,
        isLoadingHistory,
        createConversation,
        loadMessages,
        saveMessages,
        deleteConversation,
    };
}
