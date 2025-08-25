import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const generateChatId = (): string => {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};
