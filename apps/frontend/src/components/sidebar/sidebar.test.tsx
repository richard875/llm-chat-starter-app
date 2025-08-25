import { describe, test, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useMessages } from "@/store/messages";
import type { Chat } from "@/types/chat";

vi.mock("@/store/messages");

describe("Sidebar", () => {
  const mockUseMessages = vi.mocked(useMessages);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockUseMessages.mockReturnValue({
      chats: [],
      currentChatId: null,
      isLoadingMsg: false,
      isLoadingChats: false,
      startNewChat: vi.fn(),
      fetchChats: vi.fn(),
      loadChatMessages: vi.fn(),
      messages: [],
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
      setCurrentChatId: vi.fn(),
      setIsLoadingMsg: vi.fn(),
      refreshChatsAfterNewChat: vi.fn(),
    });
  });

  test("renders loading state", () => {
    mockUseMessages.mockReturnValue({
      chats: [],
      currentChatId: null,
      isLoadingMsg: false,
      isLoadingChats: true,
      startNewChat: vi.fn(),
      fetchChats: vi.fn(),
      loadChatMessages: vi.fn(),
      messages: [],
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
      setCurrentChatId: vi.fn(),
      setIsLoadingMsg: vi.fn(),
      refreshChatsAfterNewChat: vi.fn(),
    });

    const { container } = render(<Sidebar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders with chat list", () => {
    const mockChats: Chat[] = [
      {
        chatId: "chat-1",
        title: "First Conversation",
        createdAt: "2023-01-01T00:00:00.000Z",
      },
      {
        chatId: "chat-2",
        title: "Second Conversation",
        createdAt: "2023-01-02T00:00:00.000Z",
      },
    ];

    mockUseMessages.mockReturnValue({
      chats: mockChats,
      currentChatId: null,
      isLoadingMsg: false,
      isLoadingChats: false,
      startNewChat: vi.fn(),
      fetchChats: vi.fn(),
      loadChatMessages: vi.fn(),
      messages: [],
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
      setCurrentChatId: vi.fn(),
      setIsLoadingMsg: vi.fn(),
      refreshChatsAfterNewChat: vi.fn(),
    });

    const { container } = render(<Sidebar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders with active chat selected", () => {
    const mockChats: Chat[] = [
      {
        chatId: "chat-1",
        title: "Active Conversation",
        createdAt: "2023-01-01T00:00:00.000Z",
      },
    ];

    mockUseMessages.mockReturnValue({
      chats: mockChats,
      currentChatId: "chat-1",
      isLoadingMsg: false,
      isLoadingChats: false,
      startNewChat: vi.fn(),
      fetchChats: vi.fn(),
      loadChatMessages: vi.fn(),
      messages: [],
      addMessage: vi.fn(),
      updateLastMessage: vi.fn(),
      setCurrentChatId: vi.fn(),
      setIsLoadingMsg: vi.fn(),
      refreshChatsAfterNewChat: vi.fn(),
    });

    const { container } = render(<Sidebar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders empty state when no chats", () => {
    const { container } = render(<Sidebar />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
