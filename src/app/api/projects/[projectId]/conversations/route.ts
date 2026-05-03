/**
 * CONVERSATIONS API
 *
 * GET  /api/projects/[projectId]/conversations - List conversations
 * POST /api/projects/[projectId]/conversations - Create conversation
 */

import { NextRequest, NextResponse } from "next/server";
import {
  canAccessProject,
  AuthorizationError,
  AuthenticationError,
} from "@/lib/access";
import * as conversationService from "@/lib/services/conversation.service";
import * as integrationService from "@/lib/services/integration.service";
import { createConversationSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await canAccessProject(projectId);

    const conversations = await conversationService.getConversations(
      projectId,
      user._id.toString()
    );

    return NextResponse.json({ conversations });
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
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await canAccessProject(projectId);
    const body = await request.json();

    // Get product instance for this project
    const productInstance =
      await integrationService.getProductInstance(projectId);

    const parsed = createConversationSchema.parse({
      projectId,
      productInstanceId: productInstance._id.toString(),
      title: body.title,
    });

    const conversation = await conversationService.createConversation({
      projectId: parsed.projectId,
      userId: user._id.toString(),
      productInstanceId: parsed.productInstanceId,
      title: parsed.title,
    });

    return NextResponse.json({ conversation }, { status: 201 });
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
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 400 }
    );
  }
}
