import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { TypingIndicator } from "@/components/chat/typing-indicator";

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export const ChatMessage = ({ message, isTyping }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex mb-7 last:mb-0",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "min-w-0 max-w-full",
          isUser
            ? "bg-primary text-primary-foreground px-4 py-2 rounded-[20px]"
            : "text-foreground"
        )}
      >
        {message.content ? (
          <div className="leading-6.25 text-[15px] tracking-wide min-w-0 w-full">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-4 last:mb-0">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mb-3 mt-4 first:mt-0">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold mb-2 mt-4 first:mt-0">
                    {children}
                  </h4>
                ),
                h5: ({ children }) => (
                  <h5 className="text-sm font-semibold mb-2 mt-3 first:mt-0">
                    {children}
                  </h5>
                ),
                h6: ({ children }) => (
                  <h6 className="text-sm font-medium mb-2 mt-3 first:mt-0">
                    {children}
                  </h6>
                ),
                hr: () => <hr className="my-4 border-t" />,
                li: ({ children }) => <li className="mb-2">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-3 rounded-md mb-4 overflow-x-auto min-w-0 w-full">
                    {children}
                  </pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : isTyping ? (
          <TypingIndicator />
        ) : null}
      </div>
    </div>
  );
};
