import ReactMarkdown from "react-markdown";

import { TypingIndicator } from "@/components/chat/typing-indicator";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export const ChatMessage = ({ message, isTyping }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex mb-5", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "px-5 py-3 rounded-3xl",
          isUser
            ? "bg-primary text-primary-foreground"
            : "text-foreground border-primary border-1"
        )}
      >
        {message.content ? (
          <div className="leading-6 text-base tracking-wide">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : isTyping ? (
          <TypingIndicator />
        ) : null}
      </div>
    </div>
  );
};
