import { SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/store/messages";
import { generateChatId } from "@/lib/utils";

interface ChatInputProps {
  onTypingChange: (isTyping: boolean) => void;
}

export const ChatInput = ({ onTypingChange }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const {
    messages,
    isLoadingMsg,
    addMessage,
    updateLastMessage,
    currentChatId,
    setCurrentChatId,
    setIsLoadingMsg,
    refreshChatsAfterNewChat,
  } = useMessages();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when loading state changes to false
  useEffect(() => {
    if (!isLoadingMsg) {
      inputRef.current?.focus();
    }
    onTypingChange(isLoadingMsg);
  }, [isLoadingMsg, onTypingChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoadingMsg) return;

    // Generate a new chat ID if this is the first message in a new chat
    const isNewChat = !currentChatId;
    const chatId = isNewChat ? generateChatId() : currentChatId;
    setCurrentChatId(chatId);

    // Add user message
    addMessage({
      role: "user",
      content: input,
      chatId,
    });

    // Add empty assistant message that will be streamed
    addMessage({
      role: "assistant",
      content: "",
      chatId,
    });

    setInput("");
    setIsLoadingMsg(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          messages: [...messages, { role: "user", content: input }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                updateLastMessage(data.content);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      updateLastMessage("Sorry, there was an error processing your request.");
    } finally {
      setIsLoadingMsg(false);
      // Refresh chats list if this was a new chat
      if (isNewChat) refreshChatsAfterNewChat();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center space-x-3 rounded-full p-2 border border-primary shadow"
    >
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        name="message"
        className="flex-1 border-0 shadow-none !text-base focus-visible:ring-0"
        disabled={isLoadingMsg}
      />
      <Button
        type="submit"
        className="size-10 rounded-full bg-[#a3e636] border border-primary hover:bg-[#91cc33] cursor-pointer transition"
        disabled={isLoadingMsg}
      >
        <SendHorizonal className="text-primary" />
      </Button>
    </form>
  );
};
