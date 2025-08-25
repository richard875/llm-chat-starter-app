import { zValidator } from "@hono/zod-validator";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { openai } from "./services/openai.js";
import { z } from "zod";
import * as MessageService from "./services/messageService.js";
import { generateTitle } from "./services/titleService.js";

// Create Hono app
export const app = new Hono();

// Middleware
app.use(cors());

// Routes
app.get("/", (c) => {
  return c.json({ message: "LLM API is running" });
});

// Get all messages from database
app.get("/api/messages", async (c) => {
  try {
    const messages = await MessageService.getAllMessages();
    return c.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// Get messages for a specific chat
app.get("/api/messages/:chatId", async (c) => {
  try {
    const chatId = c.req.param("chatId");
    const messages = await MessageService.getMessagesByChatId(chatId);
    return c.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// Clear all messages
app.delete("/api/messages", async (c) => {
  try {
    await MessageService.clearAllMessages();
    return c.json({ message: "All messages cleared" });
  } catch (error) {
    console.error("Error clearing messages:", error);
    return c.json({ error: "Failed to clear messages" }, 500);
  }
});

// Clear messages for a specific chat
app.delete("/api/messages/:chatId", async (c) => {
  try {
    const chatId = c.req.param("chatId");
    await MessageService.clearChatMessages(chatId);
    return c.json({ message: `Messages for chat ${chatId} cleared` });
  } catch (error) {
    console.error("Error clearing chat messages:", error);
    return c.json({ error: "Failed to clear chat messages" }, 500);
  }
});

// Get all chats
app.get("/api/chats", async (c) => {
  try {
    const chats = await MessageService.getAllChats();
    return c.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return c.json({ error: "Failed to fetch chats" }, 500);
  }
});

// Get a specific chat
app.get("/api/chats/:chatId", async (c) => {
  try {
    const chatId = c.req.param("chatId");
    const chat = await MessageService.getChatById(chatId);
    return !chat ? c.json({ error: "Chat not found" }, 404) : c.json({ chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return c.json({ error: "Failed to fetch chat" }, 500);
  }
});

// Delete a chat and all its messages
app.delete("/api/chats/:chatId", async (c) => {
  try {
    const chatId = c.req.param("chatId");
    await MessageService.deleteChat(chatId);
    return c.json({ message: `Chat ${chatId} deleted` });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return c.json({ error: "Failed to delete chat" }, 500);
  }
});

// Chat endpoint
app.post(
  "/api/chat",
  zValidator(
    "json",
    z.object({
      chatId: z.string(),
      messages: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      ),
    })
  ),
  async (c) => {
    try {
      const { chatId, messages } = c.req.valid("json");
      if (!messages?.length) {
        return c.json({ error: "Messages are required" }, 400);
      }

      // Save the user's message to the database
      const userMessage = messages[messages.length - 1];
      if (userMessage.role === "user") {
        await MessageService.saveMessage({
          chatId,
          role: userMessage.role,
          content: userMessage.content,
        });
      }

      const aiStream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        stream: true,
      });

      let assistantResponse = "";
      return streamSSE(c, async (stream) => {
        for await (const chunk of aiStream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            assistantResponse += content;
            await stream.writeSSE({
              data: JSON.stringify({ content }),
            });
          }
        }

        // After streaming is complete, save the assistant's response to the database
        if (assistantResponse) {
          await MessageService.saveMessage({
            chatId: chatId,
            role: "assistant",
            content: assistantResponse,
          });

          // Generate and save title to the database if this is a new chat
          const chatExists = await MessageService.chatExists(chatId);
          if (!chatExists) {
            try {
              // Get the first two messages to generate a title
              const chatMsgs = await MessageService.getMessagesByChatId(chatId);
              if (chatMsgs.length >= 2) {
                const title = await generateTitle(chatMsgs);
                await MessageService.createChat({ chatId, title });
              }
            } catch (titleError) {
              console.error("Error generating chat title:", titleError);
              // Create chat with fallback title if title generation fails
              await MessageService.createChat({ chatId, title: "New Chat" });
            }
          }
        }
      });
    } catch (error) {
      console.error("Error:", error);
      return c.json({ error: "Failed to process request" }, 500);
    }
  }
);
