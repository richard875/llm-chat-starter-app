import { Redis } from "@upstash/redis";
import type { Message } from "../db/schema.js";

// Initialize Redis client using REST API
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_CONFIG = {
  MESSAGE_THREAD_TTL: 24 * 60 * 60, // TTL for message threads (24 hours in seconds)
  PREFIXES: { MESSAGES: "messages:" },
};

/**
 * Generate cache key for message thread
 */
const getMessageThreadKey = (chatId: string) => {
  return `${CACHE_CONFIG.PREFIXES.MESSAGES}${chatId}`;
};

/**
 * Get cached messages for a chat thread
 */
export const getMessageThread = async (
  chatId: string
): Promise<Message[] | null> => {
  try {
    const key = getMessageThreadKey(chatId);
    const cached = await redis.get(key);

    if (cached) return cached as Message[];
    return null;
  } catch (error) {
    console.error("Redis get error:", error);
    // Fail gracefully - return null to fall back to database
    return null;
  }
};

/**
 * Cache messages for a chat thread
 */
export const setMessageThread = async (
  chatId: string,
  messages: Message[]
): Promise<void> => {
  try {
    const key = getMessageThreadKey(chatId);
    await redis.setex(
      key,
      CACHE_CONFIG.MESSAGE_THREAD_TTL,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error("Redis set error:", error); // Fail gracefully
  }
};

/**
 * Invalidate cache for a specific chat thread
 * Called when new messages are added to ensure cache consistency
 */
export const invalidateMessageThread = async (
  chatId: string
): Promise<void> => {
  try {
    const key = getMessageThreadKey(chatId);
    await redis.del(key);
  } catch (error) {
    console.error("Redis delete error:", error); // Fail gracefully
  }
};
