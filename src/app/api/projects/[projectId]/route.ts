/**
 * PROJECT DETAIL API
 *
 * GET /api/projects/[projectId] - Get project details
 */

import { NextRequest, NextResponse } from "next/server";
import { canAccessProject, AuthorizationError, AuthenticationError } from "@/lib/access";
import * as projectService from "@/lib/services/project.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await canAccessProject(projectId);

    const project = await projectService.getProjectById(projectId);

    return NextResponse.json({ project });
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
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
