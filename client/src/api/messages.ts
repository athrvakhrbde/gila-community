import { apiFetch } from "./client";

export type MessageUser = {
  _id: string;
  username: string;
};

export type Conversation = {
  _id: string;
  recipients: MessageUser[];
  recipient?: MessageUser;
  lastMessageAt?: string;
  updatedAt?: string;
};

export type Message = {
  _id: string;
  conversation: string;
  sender: MessageUser;
  content: string;
  createdAt: string;
};

export function getConversations() {
  return apiFetch<Conversation[]>("/api/messages", {}, true);
}

export function getMessages(conversationId: string) {
  return apiFetch<Message[]>(`/api/messages/${conversationId}`, {}, true);
}

export function sendMessage(recipientId: string, content: string) {
  return apiFetch<{
    success: boolean;
    message: Message;
    conversationId: string;
  }>(
    `/api/messages/${recipientId}`,
    { method: "POST", body: JSON.stringify({ content }) },
    true
  );
}
