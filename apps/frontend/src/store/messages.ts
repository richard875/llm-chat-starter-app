import { create } from "zustand";

import type { Message, Chat } from "@/types/chat";

interface MessagesState {
  messages: Message[];
  chats: Chat[];
  currentChatId: string | null;
  isLoadingChats: boolean;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setCurrentChatId: (chatId: string) => void;
  startNewChat: () => void;
  fetchChats: () => Promise<void>;
  loadChatMessages: (chatId: string) => Promise<void>;
  refreshChatsAfterNewChat: () => Promise<void>;
}

export const useMessages = create<MessagesState>((set) => ({
  messages: [],
  chats: [],
  currentChatId: null,
  isLoadingChats: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) =>
    set((state) => ({
      messages: state.messages.map((msg, idx) =>
        idx === state.messages.length - 1
          ? { ...msg, content: msg.content + content }
          : msg
      ),
    })),
  clearMessages: () => set({ messages: [] }),
  setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
  startNewChat: () => {
    set({ messages: [], currentChatId: null });
  },
  fetchChats: async () => {
    set({ isLoadingChats: true });
    try {
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        set({ chats: data.chats, isLoadingChats: false });
      } else {
        console.error("Failed to fetch chats");
        set({ isLoadingChats: false });
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      set({ isLoadingChats: false });
    }
  },
  loadChatMessages: async (chatId: string) => {
    try {
      const response = await fetch(`/api/messages/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        set({ messages: data.messages, currentChatId: chatId });
      } else {
        console.error("Failed to fetch chat messages");
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  },
  refreshChatsAfterNewChat: async () => {
    try {
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        set({ chats: data.chats });
      }
    } catch (error) {
      console.error("Error refreshing chats:", error);
    }
  },
}));
