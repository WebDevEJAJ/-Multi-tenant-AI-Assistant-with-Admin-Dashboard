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
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["messages", newMessage.conversationId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(["messages", newMessage.conversationId]);

      // Optimistically update to the new value
      if (previousMessages) {
        queryClient.setQueryData<Message[]>(["messages", newMessage.conversationId], [
          ...previousMessages,
          {
            _id: Date.now().toString(), // temporary ID
            conversationId: newMessage.conversationId,
            projectId: "", // not strictly needed for UI
            role: "user",
            content: newMessage.content,
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", newMessage.conversationId], context.previousMessages);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
