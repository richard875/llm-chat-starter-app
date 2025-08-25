import { describe, test, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ChatMessage } from "@/components/chat/chat-message";
import type { Message } from "@/types/chat";

// Mock react-markdown
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="markdown">{children}</div>
  ),
}));

describe("ChatMessage", () => {
  const userMessage: Message = {
    id: 1,
    role: "user",
    content: "Hello, how are you?",
    chatId: "chat-1",
    createdAt: "2023-01-01T00:00:00.000Z",
  };

  const assistantMessage: Message = {
    id: 2,
    role: "assistant",
    content: "I am doing well, thank you for asking!",
    chatId: "chat-1",
    createdAt: "2023-01-01T00:00:00.000Z",
  };

  test("renders user message correctly", () => {
    const { container } = render(<ChatMessage message={userMessage} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders assistant message correctly", () => {
    const { container } = render(<ChatMessage message={assistantMessage} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders assistant message with typing indicator", () => {
    const { container } = render(
      <ChatMessage message={assistantMessage} isTyping={true} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test("renders message with empty content", () => {
    const emptyMessage: Message = {
      ...userMessage,
      content: "",
    };
    const { container } = render(<ChatMessage message={emptyMessage} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
