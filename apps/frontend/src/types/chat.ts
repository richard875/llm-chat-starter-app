export interface Message {
  id?: number;
  chatId?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chat {
  chatId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}
