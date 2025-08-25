import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Message } from "../db/schema.js";

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  ping: vi.fn(),
  keys: vi.fn(),
};

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => mockRedis),
}));

// Import after mocking
const { getMessageThread, setMessageThread, invalidateMessageThread } =
  await import("./cacheService.js");

describe("CacheService", () => {
  const mockChatId = "test-chat-123";
  const mockMessages: Message[] = [
    {
      id: "msg-1",
      chatId: mockChatId,
      role: "user",
      content: "Hello",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "msg-2",
      chatId: mockChatId,
      role: "assistant",
      content: "Hi there!",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMessageThread", () => {
    it("should return cached messages when cache hit", async () => {
      mockRedis.get.mockResolvedValue(mockMessages);

      const result = await getMessageThread(mockChatId);

      expect(result).toEqual(mockMessages);
      expect(mockRedis.get).toHaveBeenCalledWith(`messages:${mockChatId}`);
    });

    it("should return null on cache miss", async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getMessageThread(mockChatId);

      expect(result).toBeNull();
    });

    it("should handle Redis errors gracefully", async () => {
      mockRedis.get.mockRejectedValue(new Error("Redis error"));

      const result = await getMessageThread(mockChatId);

      expect(result).toBeNull(); // Should fail gracefully
    });
  });

  describe("setMessageThread", () => {
    it("should cache messages with correct TTL", async () => {
      mockRedis.setex.mockResolvedValue("OK");

      await setMessageThread(mockChatId, mockMessages);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `messages:${mockChatId}`,
        24 * 60 * 60, // 24 hours TTL
        JSON.stringify(mockMessages)
      );
    });

    it("should handle Redis errors gracefully", async () => {
      mockRedis.setex.mockRejectedValue(new Error("Redis error"));

      // Should not throw error
      await expect(
        setMessageThread(mockChatId, mockMessages)
      ).resolves.toBeUndefined();
    });
  });

  describe("invalidateMessageThread", () => {
    it("should delete cache key", async () => {
      mockRedis.del.mockResolvedValue(1);

      await invalidateMessageThread(mockChatId);

      expect(mockRedis.del).toHaveBeenCalledWith(`messages:${mockChatId}`);
    });

    it("should handle Redis errors gracefully", async () => {
      mockRedis.del.mockRejectedValue(new Error("Redis error"));

      // Should not throw error
      await expect(
        invalidateMessageThread(mockChatId)
      ).resolves.toBeUndefined();
    });
  });
});
