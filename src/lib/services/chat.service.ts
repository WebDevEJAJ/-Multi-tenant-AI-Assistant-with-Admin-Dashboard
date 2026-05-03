/**
 * CHAT SERVICE
 *
 * Orchestrates the complete chat flow:
 * 1. Accept user message
 * 2. Store user message
 * 3. Fetch conversation history
 * 4. Inject integration data (if enabled)
 * 5. Call AI
 * 6. Store assistant response
 * 7. Return response
 */

import { connectDB } from "@/lib/db/connection";
import { ProductInstance, Project } from "@/lib/db/models";
import { generateAIResponse, type AIMessage } from "@/lib/ai";
import { getIntegrationContext } from "@/lib/integrations";
import * as conversationService from "./conversation.service";

interface ChatRequest {
  conversationId: string;
  projectId: string;
  userId: string;
  content: string;
}

interface ChatResponse {
  userMessage: {
    _id: string;
    conversationId: string;
    projectId: string;
    role: "user";
    content: string;
    createdAt: Date;
  };
  assistantMessage: {
    _id: string;
    conversationId: string;
    projectId: string;
    role: "assistant";
    content: string;
    metadata: {
      model: string;
      tokensUsed: number;
      processingTimeMs: number;
      integrationDataUsed: string[];
    };
    createdAt: Date;
  };
}

export async function processChat(request: ChatRequest): Promise<ChatResponse> {
  await connectDB();

  const { conversationId, projectId, content } = request;

  // 1. Get conversation and verify it belongs to the project
  const conversation =
    await conversationService.getConversationById(conversationId);
  if (conversation.projectId.toString() !== projectId) {
    throw new Error("Conversation does not belong to this project");
  }

  // 2. Store user message
  const userMessage = await conversationService.addMessage({
    conversationId,
    projectId,
    role: "user",
    content,
  });

  // 3. Get project settings
  const project = await Project.findById(projectId).lean();
  if (!project) {
    throw new Error("Project not found");
  }

  // 4. Get product instance to check integrations
  const productInstance = await ProductInstance.findById(
    conversation.productInstanceId
  ).lean();

  const integrations = productInstance?.integrations ?? {
    shopify: false,
    crm: false,
  };

  // 5. Get integration context
  const integrationContext = getIntegrationContext(integrations);

  // Track which integrations were used
  const integrationDataUsed: string[] = [];
  if (integrations.shopify) integrationDataUsed.push("shopify");
  if (integrations.crm) integrationDataUsed.push("crm");

  // 6. Fetch conversation history for context
  const messages = await conversationService.getMessages(conversationId);
  const aiMessages: AIMessage[] = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  // 7. Call AI
  const aiResponse = await generateAIResponse({
    systemPrompt: project.settings.systemPrompt,
    messages: aiMessages,
    integrationContext,
    maxTokens: project.settings.maxTokens,
    model: project.settings.aiModel,
  });

  // 8. Store assistant response
  const assistantMessage = await conversationService.addMessage({
    conversationId,
    projectId,
    role: "assistant",
    content: aiResponse.content,
    metadata: {
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      processingTimeMs: aiResponse.processingTimeMs,
      integrationDataUsed,
    },
  });

  // 9. Auto-title conversation if it's the first message
  if (conversation.messageCount === 0) {
    const title =
      content.length > 50 ? content.substring(0, 47) + "..." : content;
    await conversationService.updateConversationTitle(
      conversationId,
      title
    );
  }

  return {
    userMessage: {
      _id: userMessage._id.toString(),
      conversationId: userMessage.conversationId.toString(),
      projectId: userMessage.projectId.toString(),
      role: "user",
      content: userMessage.content,
      createdAt: userMessage.createdAt,
    },
    assistantMessage: {
      _id: assistantMessage._id.toString(),
      conversationId: assistantMessage.conversationId.toString(),
      projectId: assistantMessage.projectId.toString(),
      role: "assistant",
      content: assistantMessage.content,
      metadata: {
        model: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed,
        processingTimeMs: aiResponse.processingTimeMs,
        integrationDataUsed,
      },
      createdAt: assistantMessage.createdAt,
    },
  };
}
