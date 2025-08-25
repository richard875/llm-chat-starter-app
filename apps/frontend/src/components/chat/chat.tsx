import { useEffect, useRef, useState } from "react";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import { useMessages } from "@/store/messages";

export const Chat = () => {
  const { messages } = useMessages();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="w-full h-full pb-10 flex items-center justify-center select-none">
            <p className="text-2xl font-medium">
              Start a conversation with the AI assistant.
            </p>
          </div>
        ) : (
          <div className="max-w-screen-md mx-auto py-8 px-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  isTyping={
                    isTyping &&
                    index === messages.length - 1 &&
                    message.role === "assistant"
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="w-full bg-background z-20 px-5">
        <div className="max-w-screen-md mx-auto">
          <ChatInput onTypingChange={setIsTyping} />
          <p className="text-sm text-center py-2.5 text-muted-foreground select-none">
            AI can make mistakes. Please verify the information provided.
          </p>
        </div>
      </div>
    </div>
  );
};
