import { openai } from "./openai.js";
import type { Message } from "../db/schema.js";

/**
 * Generate a summarized title for a chat based on the first two messages
 * @param messages Array of messages (should contain user and assistant messages)
 * @returns Promise<string> The generated title
 */
export const generateTitle = async (messages: Message[]): Promise<string> => {
  try {
    // Take only the first two messages (user + assistant)
    const prefixMessages = messages.slice(0, 2);
    const userMessage = prefixMessages.find((m) => m.role === "user");
    const assistantMessage = prefixMessages.find((m) => m.role === "assistant");

    if (prefixMessages.length < 2 || !userMessage || !assistantMessage) {
      // If we don't have both user and assistant messages, create a basic title
      return prefixMessages[0]?.content?.slice(0, 30) + "..." || "New Chat";
    }

    // Create a prompt for generating the title
    const prompt = `Based on the following conversation, generate a short, descriptive title (maximum 30 characters):

User: ${userMessage.content}
Assistant: ${assistantMessage.content}

Generate a concise title that captures the main topic or question. Respond with only the title, no quotes or additional text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates concise, descriptive titles for conversations. Keep titles under 30 characters and focus on the main topic.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 20,
    });

    const title = response.choices[0]?.message?.content?.trim();
    if (!title) {
      // Fallback to user message if OpenAI doesn't respond
      return prefixMessages[0]?.content?.slice(0, 30) + "..." || "New Chat";
    }

    // Ensure title is maximum 30 characters
    return title.length > 30 ? title.slice(0, 27) + "..." : title;
  } catch (error) {
    console.error("Error generating title:", error);

    // Fallback to a simple title based on the first message
    const firstMessage = messages[0];
    if (firstMessage?.content) {
      const content = firstMessage.content;
      return content.slice(0, 30) + (content.length > 30 ? "..." : "");
    }

    return "New Chat";
  }
};
