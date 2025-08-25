import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock framer-motion to avoid issues with animations in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("div", props, children),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}));

// Mock nuqs for query state management
vi.mock("nuqs", () => ({
  useQueryState: vi.fn(() => [null, vi.fn()]),
}));

// Mock the messages store
vi.mock("@/store/messages", () => ({
  useMessages: vi.fn(() => ({
    messages: [],
    currentChatId: null,
    isLoadingMsg: false,
    isLoadingChats: false,
    chats: [],
    addMessage: vi.fn(),
    updateLastMessage: vi.fn(),
    setCurrentChatId: vi.fn(),
    setIsLoadingMsg: vi.fn(),
    refreshChatsAfterNewChat: vi.fn(),
    startNewChat: vi.fn(),
    fetchChats: vi.fn(),
    loadChatMessages: vi.fn(),
  })),
}));
