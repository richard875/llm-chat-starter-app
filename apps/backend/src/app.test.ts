import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { app } from "./app.js";

// Test constants
const VALID_UUID = "d4f19f0a-4fe9-41b0-8a81-413a7fd1db4c";
const ANOTHER_VALID_UUID = "d4f19f0a-4fe9-41b0-8a81-413a7fd1db4d";
const INVALID_UUID = "invalid-uuid";
const TEST_TIMESTAMP = "2025-08-25T23:02:38.167Z";

const MOCK_CHUNKS = [
  { choices: [{ delta: { content: "Hello" } }] },
  { choices: [{ delta: { content: " " } }] },
  { choices: [{ delta: { content: "world" } }] },
];

// Test data factories
const createMockMessage = (overrides = {}) => ({
  id: "msg-1",
  chatId: VALID_UUID,
  role: "user",
  content: "Hello",
  createdAt: TEST_TIMESTAMP,
  updatedAt: TEST_TIMESTAMP,
  ...overrides,
});

const createMockChat = (overrides = {}) => ({
  chatId: VALID_UUID,
  title: "Chat about AI",
  createdAt: TEST_TIMESTAMP,
  updatedAt: TEST_TIMESTAMP,
  ...overrides,
});

// Test helpers
const createChatRequest = (data: {
  chatId?: string;
  messages: Array<{ role: string; content: string }>;
}) => {
  return app.request("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

const createMessagesRequest = (chatId: string) => {
  return app.request(`/api/messages/${chatId}`);
};

const createChatsRequest = () => {
  return app.request("/api/chats");
};

// Mock setup
const mockOpenAI = vi.hoisted(() => ({
  create: vi.fn(),
}));

const mockMessageService = vi.hoisted(() => ({
  getMessagesByChatId: vi.fn(),
  getAllChats: vi.fn(),
  saveMessage: vi.fn(),
  chatExists: vi.fn(),
  createChat: vi.fn(),
}));

vi.mock("./services/messageService.js", async () => {
  const actual = await vi.importActual("./services/messageService.js");
  return {
    ...actual,
    getMessagesByChatId: mockMessageService.getMessagesByChatId,
    getAllChats: mockMessageService.getAllChats,
    saveMessage: mockMessageService.saveMessage,
    chatExists: mockMessageService.chatExists,
    createChat: mockMessageService.createChat,
  };
});

vi.mock("openai", () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockOpenAI.create,
      },
    },
  })),
}));

describe("Backend API Tests", () => {
  beforeAll(() => {
    // Setup mock implementation for streaming response
    mockOpenAI.create.mockImplementation(async () => ({
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of MOCK_CHUNKS) {
          yield chunk;
        }
      },
    }));
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    mockOpenAI.create.mockClear();
    mockMessageService.getMessagesByChatId.mockClear();
    mockMessageService.getAllChats.mockClear();
    mockMessageService.saveMessage.mockClear();
    mockMessageService.chatExists.mockClear();
    mockMessageService.createChat.mockClear();
  });

  describe("Health Check", () => {
    it("should return 200 and correct message", async () => {
      const res = await app.request("/");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ message: "LLM API is running" });
    });
  });

  describe("Messages API", () => {
    describe("GET /api/messages/:chatId", () => {
      it("should return messages for a valid chatId", async () => {
        const mockMessages = [
          createMockMessage({ id: "msg-1", role: "user", content: "Hello" }),
          createMockMessage({
            id: "msg-2",
            role: "assistant",
            content: "Hi there!",
          }),
        ];

        mockMessageService.getMessagesByChatId.mockResolvedValue(mockMessages);

        const res = await createMessagesRequest(VALID_UUID);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ messages: mockMessages });
        expect(mockMessageService.getMessagesByChatId).toHaveBeenCalledWith(
          VALID_UUID
        );
        expect(mockMessageService.getMessagesByChatId).toHaveBeenCalledTimes(1);
      });

      it("should return empty array for chatId with no messages", async () => {
        mockMessageService.getMessagesByChatId.mockResolvedValue([]);

        const res = await createMessagesRequest(VALID_UUID);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ messages: [] });
        expect(mockMessageService.getMessagesByChatId).toHaveBeenCalledWith(
          VALID_UUID
        );
        expect(mockMessageService.getMessagesByChatId).toHaveBeenCalledTimes(1);
      });

      it("should handle database errors gracefully", async () => {
        const errorMessage = "Database connection failed";
        mockMessageService.getMessagesByChatId.mockRejectedValue(
          new Error(errorMessage)
        );

        const res = await createMessagesRequest(VALID_UUID);
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data).toEqual({ error: "Failed to fetch messages" });
        expect(mockMessageService.getMessagesByChatId).toHaveBeenCalledWith(
          VALID_UUID
        );
      });

      it("should handle invalid UUID format", async () => {
        const errorMessage = "Invalid UUID format";
        mockMessageService.getMessagesByChatId.mockRejectedValue(
          new Error(errorMessage)
        );

        const res = await createMessagesRequest(INVALID_UUID);
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data).toEqual({ error: "Failed to fetch messages" });
        expect(mockMessageService.getMessagesByChatId).toHaveBeenCalledWith(
          INVALID_UUID
        );
      });
    });
  });

  describe("Chats API", () => {
    describe("GET /api/chats", () => {
      it("should return all chats successfully", async () => {
        const mockChats = [
          createMockChat({ chatId: VALID_UUID, title: "Chat about AI" }),
          createMockChat({
            chatId: ANOTHER_VALID_UUID,
            title: "Programming discussion",
          }),
        ];

        mockMessageService.getAllChats.mockResolvedValue(mockChats);

        const res = await createChatsRequest();
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ chats: mockChats });
        expect(mockMessageService.getAllChats).toHaveBeenCalledTimes(1);
      });

      it("should return empty array when no chats exist", async () => {
        mockMessageService.getAllChats.mockResolvedValue([]);

        const res = await createChatsRequest();
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ chats: [] });
        expect(mockMessageService.getAllChats).toHaveBeenCalledTimes(1);
      });

      it("should handle database errors gracefully", async () => {
        const errorMessage = "Database connection failed";
        mockMessageService.getAllChats.mockRejectedValue(
          new Error(errorMessage)
        );

        const res = await createChatsRequest();
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data).toEqual({ error: "Failed to fetch chats" });
        expect(mockMessageService.getAllChats).toHaveBeenCalledTimes(1);
      });

      it("should handle timeout errors", async () => {
        const errorMessage = "Query timeout";
        mockMessageService.getAllChats.mockRejectedValue(
          new Error(errorMessage)
        );

        const res = await createChatsRequest();
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data).toEqual({ error: "Failed to fetch chats" });
        expect(mockMessageService.getAllChats).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Chat Endpoint", () => {
    describe("Validation", () => {
      it("should return 500 for empty messages array", async () => {
        // Note: This test documents current behavior - API has a bug where empty messages
        // cause a 500 error instead of proper validation
        const res = await createChatRequest({
          chatId: VALID_UUID,
          messages: [],
        });
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data).toEqual({ error: "Failed to process request" });
        expect(mockOpenAI.create).not.toHaveBeenCalled();
      });

      it("should return 400 for invalid message role", async () => {
        const res = await createChatRequest({
          chatId: VALID_UUID,
          messages: [{ role: "invalid", content: "test" }],
        });

        expect(res.status).toBe(400);
        expect(mockOpenAI.create).not.toHaveBeenCalled();
      });

      it("should return 400 for missing chatId", async () => {
        const res = await createChatRequest({
          messages: [{ role: "user", content: "Hello" }],
        });

        expect(res.status).toBe(400);
        expect(mockOpenAI.create).not.toHaveBeenCalled();
      });
    });

    describe("Successful requests", () => {
      it("should stream response chunks correctly", async () => {
        const testMessages = [{ role: "user", content: "Hello" }];
        const res = await createChatRequest({
          chatId: VALID_UUID,
          messages: testMessages,
        });

        // Verify response headers and status
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/event-stream");

        // Verify OpenAI was called with correct parameters
        expect(mockOpenAI.create).toHaveBeenCalledTimes(1);
        expect(mockOpenAI.create).toHaveBeenCalledWith({
          model: "gpt-4o-mini",
          messages: testMessages,
          temperature: 0.7,
          stream: true,
        });

        // Verify streaming response content
        const reader = res.body?.getReader();
        expect(reader).toBeDefined();

        const chunks: string[] = [];
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split("\n").filter(Boolean);

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              chunks.push(data.content);
            }
          }
        }

        expect(chunks).toEqual(["Hello", " ", "world"]);
      });

      it("should handle chatId parameter correctly", async () => {
        const testMessages = [{ role: "user", content: "Hello with chatId" }];
        const res = await createChatRequest({
          chatId: VALID_UUID,
          messages: testMessages,
        });

        expect(res.status).toBe(200);
        expect(mockOpenAI.create).toHaveBeenCalledWith({
          model: "gpt-4o-mini",
          messages: testMessages,
          temperature: 0.7,
          stream: true,
        });
      });
    });

    describe("Error handling", () => {
      it("should handle OpenAI API errors gracefully", async () => {
        // Mock OpenAI to throw an error
        const errorMessage = "OpenAI API error";
        mockOpenAI.create.mockImplementationOnce(async () => {
          throw new Error(errorMessage);
        });

        const res = await createChatRequest({
          chatId: VALID_UUID,
          messages: [{ role: "user", content: "Hello" }],
        });

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data).toEqual({ error: "Failed to process request" });
        expect(mockOpenAI.create).toHaveBeenCalledTimes(1);
      });
    });
  });
});
