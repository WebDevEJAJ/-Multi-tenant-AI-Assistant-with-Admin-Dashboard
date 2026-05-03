/**
 * CHAT API
 *
 * POST /api/chat - Send a message and get AI response
 *
 * Flow:
 * 1. Validate input (Zod)
 * 2. Authorize user (Access Layer)
 * 3. Process chat (Service Layer → AI → Store)
 * 4. Return structured response
 */

import { NextRequest, NextResponse } from "next/server";
import {
  canAccessProject,
  AuthorizationError,
  AuthenticationError,
} from "@/lib/access";
import { processChat } from "@/lib/services/chat.service";
import { sendMessageSchema } from "@/lib/validators";
import * as conversationService from "@/lib/services/conversation.service";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate
    const body = await request.json();
    const parsed = sendMessageSchema.parse(body);

    // 2. Get conversation to find projectId
    const conversation = await conversationService.getConversationById(
      parsed.conversationId
    );
    const projectId = conversation.projectId.toString();

    // 3. Authorize
    const user = await canAccessProject(projectId);

    // 4. Process chat through service layer
    const result = await processChat({
      conversationId: parsed.conversationId,
      projectId,
      userId: user._id.toString(),
      content: parsed.content,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process message",
      },
      { status: 500 }
    );
  }
}
