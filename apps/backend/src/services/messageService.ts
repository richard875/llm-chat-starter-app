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
import {
  getMessageThread,
  setMessageThread,
  invalidateMessageThread,
} from "./cacheService.js";

// Save a new message to the database
export const saveMessage = async (
  data: Omit<NewMessage, "id" | "createdAt" | "updatedAt">
): Promise<Message> => {
  const [savedMessage] = await db
    .insert(messages)
    .values({ chatId: data.chatId, role: data.role, content: data.content })
    .returning();

  // Invalidate cache for this chat thread since we added a new message
  await invalidateMessageThread(data.chatId);

  return savedMessage;
};

// Get messages by chatId
export const getMessagesByChatId = async (
  chatId: string
): Promise<Message[]> => {
  // Try to get from cache first
  const cachedMessages = await getMessageThread(chatId);
  if (cachedMessages) return cachedMessages;

  // Cache miss - fetch from database
  const dbMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);

  // Cache the result for future requests
  if (dbMessages.length > 0) await setMessageThread(chatId, dbMessages);

  return dbMessages;
};

// Create a new chat session
export const createChat = async (
  data: Omit<NewChat, "createdAt" | "updatedAt">
): Promise<Chat> => {
  const [savedChat] = await db
    .insert(chats)
    .values({ chatId: data.chatId, title: data.title })
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
