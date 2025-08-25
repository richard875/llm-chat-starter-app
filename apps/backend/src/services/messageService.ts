import { eq } from "drizzle-orm";
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

// Get all messages from the database
export const getAllMessages = async (): Promise<Message[]> => {
  return await db.select().from(messages).orderBy(messages.createdAt);
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

// Get messages by role
export const getMessagesByRole = async (
  role: "user" | "assistant"
): Promise<Message[]> => {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.role, role))
    .orderBy(messages.createdAt);
};

// Delete all messages
export const clearAllMessages = async (): Promise<void> => {
  await db.delete(messages);
};

// Clear messages for a specific chat
export const clearChatMessages = async (chatId: string): Promise<void> => {
  await db.delete(messages).where(eq(messages.chatId, chatId));
};

// Get the last N messages
export const getRecentMessages = async (
  limit: number = 50
): Promise<Message[]> => {
  return await db
    .select()
    .from(messages)
    .orderBy(messages.createdAt)
    .limit(limit);
};

// Get the last N messages for a specific chat
export const getRecentMessagesByChatId = async (
  chatId: string,
  limit: number = 50
): Promise<Message[]> => {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt)
    .limit(limit);
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

// Get chat by ID
export const getChatById = async (chatId: string): Promise<Chat | null> => {
  const [chat] = await db
    .select()
    .from(chats)
    .where(eq(chats.chatId, chatId))
    .limit(1);

  return chat || null;
};

// Get all chats
export const getAllChats = async (): Promise<Chat[]> => {
  return await db.select().from(chats).orderBy(chats.createdAt);
};

// Update chat title
export const updateChatTitle = async (
  chatId: string,
  title: string
): Promise<void> => {
  await db
    .update(chats)
    .set({ title, updatedAt: new Date() })
    .where(eq(chats.chatId, chatId));
};

// Delete a chat and all its messages
export const deleteChat = async (chatId: string): Promise<void> => {
  await db.delete(messages).where(eq(messages.chatId, chatId));
  await db.delete(chats).where(eq(chats.chatId, chatId));
};
