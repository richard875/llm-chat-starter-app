import { describe, test, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ChatInput } from "@/components/chat/chat-input";
import { useMessages } from "@/store/messages";

// Mock crypto.randomUUID
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: vi.fn(() => "mock-uuid-123"),
  },
});

vi.mock("@/store/messages");

describe("ChatInput", () => {
  const mockOnTypingChange = vi.fn();
  const mockUseMessages = vi.mocked(useMessages);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockUseMessages.mockReturnValue({
      messages: [],
      isLoadingMsg: false,
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
      currentChatId: null,
      setCurrentChatId: vi.fn(),
      setIsLoadingMsg: vi.fn(),
      refreshChatsAfterNewChat: vi.fn(),
      isLoadingChats: false,
      chats: [],
      startNewChat: vi.fn(),
      fetchChats: vi.fn(),
      loadChatMessages: vi.fn(),
    });
  });

  test("renders chat input form", () => {
    const { container } = render(
      <ChatInput onTypingChange={mockOnTypingChange} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders with loading state", () => {
    mockUseMessages.mockReturnValue({
      messages: [],
      isLoadingMsg: true,
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
      currentChatId: null,
      setCurrentChatId: vi.fn(),
      setIsLoadingMsg: vi.fn(),
      refreshChatsAfterNewChat: vi.fn(),
      isLoadingChats: false,
      chats: [],
      startNewChat: vi.fn(),
      fetchChats: vi.fn(),
      loadChatMessages: vi.fn(),
    });

    const { container } = render(
      <ChatInput onTypingChange={mockOnTypingChange} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders with existing chat", () => {
    mockUseMessages.mockReturnValue({
      messages: [
        { id: 1, role: "user", content: "Hello", chatId: "existing-chat" },
      ],
      isLoadingMsg: false,
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
      currentChatId: "existing-chat",
      setCurrentChatId: vi.fn(),
      setIsLoadingMsg: vi.fn(),
      refreshChatsAfterNewChat: vi.fn(),
      isLoadingChats: false,
      chats: [],
      startNewChat: vi.fn(),
      fetchChats: vi.fn(),
      loadChatMessages: vi.fn(),
    });

    const { container } = render(
      <ChatInput onTypingChange={mockOnTypingChange} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
