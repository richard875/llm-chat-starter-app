import { eq, desc } from "drizzle-orm";
import { db } from "../db/config.js";
import {
  messages,
  chats,
  type Message,
  type NewMessage,
  type Chat,
  type NewChat,
} from "../db/schema.js";

// Save a new message to the database
export const saveMessage = async (
  messageData: Omit<NewMessage, "id" | "createdAt" | "updatedAt">
): Promise<Message> => {
  const [savedMessage] = await db
    .insert(messages)
    .values({
      chatId: messageData.chatId,
      role: messageData.role,
      content: messageData.content,
    })
    .returning();

  return savedMessage;
};

// Get messages by chatId
export const getMessagesByChatId = async (
  chatId: string
): Promise<Message[]> => {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);
};

// Create a new chat session
export const createChat = async (
  chatData: Omit<NewChat, "createdAt" | "updatedAt">
): Promise<Chat> => {
  const [savedChat] = await db
    .insert(chats)
    .values({
      chatId: chatData.chatId,
      title: chatData.title,
    })
    .returning();

  return savedChat;
};

// Check if a chat exists
export const chatExists = async (chatId: string): Promise<boolean> => {
  const chat = await db
    .select()
    .from(chats)
    .where(eq(chats.chatId, chatId))
    .limit(1);

  return chat.length > 0;
};

// Get all chats
export const getAllChats = async (): Promise<Chat[]> => {
  return await db.select().from(chats).orderBy(desc(chats.createdAt));
};
