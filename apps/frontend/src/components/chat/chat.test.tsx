import { describe, test, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Chat } from "@/components/chat/chat";
import { useMessages } from "@/store/messages";
import type { Message } from "@/types/chat";

vi.mock("@/store/messages");

describe("Chat", () => {
  const mockUseMessages = vi.mocked(useMessages);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockUseMessages.mockReturnValue({
      messages: [],
      currentChatId: null,
      isLoadingMsg: false,
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
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

  test("renders empty state when no messages", () => {
    const { container } = render(<Chat />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders with messages", () => {
    const mockMessages: Message[] = [
      {
        id: 1,
        role: "user",
        content: "Hello",
        chatId: "chat-1",
        createdAt: "2023-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        role: "assistant",
        content: "Hi there!",
        chatId: "chat-1",
        createdAt: "2023-01-01T00:01:00.000Z",
      },
    ];

    mockUseMessages.mockReturnValue({
      messages: mockMessages,
      currentChatId: "chat-1",
      isLoadingMsg: false,
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
      setCurrentChatId: vi.fn(),
      setIsLoadingMsg: vi.fn(),
      refreshChatsAfterNewChat: vi.fn(),
      isLoadingChats: false,
      chats: [],
      startNewChat: vi.fn(),
      fetchChats: vi.fn(),
      loadChatMessages: vi.fn(),
    });

    const { container } = render(<Chat />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders with current chat ID set", () => {
    mockUseMessages.mockReturnValue({
      messages: [],
      currentChatId: "active-chat-123",
      isLoadingMsg: false,
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
      setCurrentChatId: vi.fn(),
      setIsLoadingMsg: vi.fn(),
      refreshChatsAfterNewChat: vi.fn(),
      isLoadingChats: false,
      chats: [],
      startNewChat: vi.fn(),
      fetchChats: vi.fn(),
      loadChatMessages: vi.fn(),
    });

    const { container } = render(<Chat />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
