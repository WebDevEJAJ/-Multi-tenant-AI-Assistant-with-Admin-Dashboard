/**
 * CONVERSATION & CHAT HOOKS
 *
 * TanStack Query hooks for conversations, messages, and chat.
 */

"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// ─── Types ───
interface Conversation {
  _id: string;
  projectId: string;
  userId: string;
  productInstanceId: string;
  title: string;
  isArchived: boolean;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  projectId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    processingTimeMs?: number;
    integrationDataUsed?: string[];
  };
  createdAt: string;
}

interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
}

// ─── Fetch Functions ───
async function fetchConversations(
  projectId: string
): Promise<Conversation[]> {
  const res = await fetch(
    `/api/projects/${projectId}/conversations`
  );
  if (!res.ok) throw new Error("Failed to fetch conversations");
  const data = await res.json();
  return data.conversations;
}

async function fetchMessages(
  projectId: string,
  conversationId: string
): Promise<Message[]> {
  const res = await fetch(
    `/api/projects/${projectId}/conversations/${conversationId}/messages`
  );
  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = await res.json();
  return data.messages;
}

async function createConversation(
  projectId: string,
  title?: string
): Promise<Conversation> {
  const res = await fetch(
    `/api/projects/${projectId}/conversations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }
  );
  if (!res.ok) throw new Error("Failed to create conversation");
  const data = await res.json();
  return data.conversation;
}

async function sendMessage(data: {
  conversationId: string;
  content: string;
}): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to send message");
  }
  return res.json();
}

// ─── Hooks ───
export function useConversations(projectId: string) {
  return useQuery<Conversation[]>({
    queryKey: ["conversations", projectId],
    queryFn: () => fetchConversations(projectId),
    enabled: !!projectId,
  });
}

export function useMessages(projectId: string, conversationId: string) {
  return useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(projectId, conversationId),
    enabled: !!projectId && !!conversationId,
  });
}

export function useCreateConversation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) =>
      createConversation(projectId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", projectId],
      });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      // Invalidate messages for the conversation
      queryClient.invalidateQueries({
        queryKey: ["messages", data.userMessage.conversationId],
      });
      // Invalidate conversations list to update lastMessageAt
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
