/**
 * PROJECTS API
 *
 * GET  /api/projects - List projects for current user
 * POST /api/projects - Create a new project
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthenticationError } from "@/lib/access";
import * as projectService from "@/lib/services/project.service";
import { createProjectSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const projects = await projectService.getProjects(user._id.toString());

    // Filter to projects user has access to (unless global admin)
    const accessibleProjects = user.isGlobalAdmin
      ? projects
      : projects.filter((p) =>
          user.projectRoles.some(
            (pr) => pr.projectId.toString() === p._id.toString()
          )
        );

    return NextResponse.json({ projects: accessibleProjects });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const parsed = createProjectSchema.parse(body);

    const project = await projectService.createProject(
      parsed,
      user._id.toString()
    );

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error("Create project error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create project",
      },
      { status: 400 }
    );
  }
}
