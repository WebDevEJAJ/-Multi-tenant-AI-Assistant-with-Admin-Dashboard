/**
 * CONVERSATION SERVICE
 *
 * Business logic for conversation management.
 * Handles creation, retrieval, and message management.
 */

import { connectDB } from "@/lib/db/connection";
import { Conversation, Message } from "@/lib/db/models";
import { Types } from "mongoose";

export async function getConversations(
  projectId: string,
  userId: string
) {
  await connectDB();
  const conversations = await Conversation.find({
    projectId: new Types.ObjectId(projectId),
    userId: new Types.ObjectId(userId),
    isArchived: false,
  })
    .sort({ lastMessageAt: -1 })
    .lean();

  return conversations;
}

export async function getAllProjectConversations(projectId: string) {
  await connectDB();
  const conversations = await Conversation.find({
    projectId: new Types.ObjectId(projectId),
    isArchived: false,
  })
    .sort({ lastMessageAt: -1 })
    .populate("userId", "name email")
    .lean();

  return conversations;
}

export async function getConversationById(conversationId: string) {
  await connectDB();
  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) {
    throw new Error("Conversation not found");
  }
  return conversation;
}

export async function createConversation(data: {
  projectId: string;
  userId: string;
  productInstanceId: string;
  title?: string;
}) {
  await connectDB();
  const conversation = await Conversation.create({
    projectId: new Types.ObjectId(data.projectId),
    userId: new Types.ObjectId(data.userId),
    productInstanceId: new Types.ObjectId(data.productInstanceId),
    title: data.title ?? "New Conversation",
  });

  return conversation.toObject();
}

export async function getMessages(conversationId: string) {
  await connectDB();
  const messages = await Message.find({
    conversationId: new Types.ObjectId(conversationId),
  })
    .sort({ createdAt: 1 })
    .lean();

  return messages;
}

export async function addMessage(data: {
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
}) {
  await connectDB();

  const message = await Message.create({
    conversationId: new Types.ObjectId(data.conversationId),
    projectId: new Types.ObjectId(data.projectId),
    role: data.role,
    content: data.content,
    metadata: data.metadata ?? {},
  });

  // Update conversation metadata
  await Conversation.findByIdAndUpdate(data.conversationId, {
    $inc: { messageCount: 1 },
    lastMessageAt: new Date(),
  });

  return message.toObject();
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
) {
  await connectDB();
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { title },
    { new: true }
  ).lean();

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
}

export async function archiveConversation(conversationId: string) {
  await connectDB();
  await Conversation.findByIdAndUpdate(conversationId, {
    isArchived: true,
  });
}
