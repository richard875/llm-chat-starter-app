export interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  updatedAt?: string;
}
