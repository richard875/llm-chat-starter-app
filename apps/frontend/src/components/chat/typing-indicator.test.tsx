import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import { TypingIndicator } from "@/components/chat/typing-indicator";

describe("TypingIndicator", () => {
  test("renders typing indicator with animated dots", () => {
    const { container } = render(<TypingIndicator />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
