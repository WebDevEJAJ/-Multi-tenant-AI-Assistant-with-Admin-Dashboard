/**
 * MESSAGES API
 *
 * GET  /api/projects/[projectId]/conversations/[conversationId]/messages - Get messages
 */

import { NextRequest, NextResponse } from "next/server";
import {
  canAccessProject,
  AuthorizationError,
  AuthenticationError,
} from "@/lib/access";
import * as conversationService from "@/lib/services/conversation.service";

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ projectId: string; conversationId: string }> }
) {
  try {
    const { projectId, conversationId } = await params;
    await canAccessProject(projectId);

    const messages =
      await conversationService.getMessages(conversationId);

    return NextResponse.json({ messages });
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
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
