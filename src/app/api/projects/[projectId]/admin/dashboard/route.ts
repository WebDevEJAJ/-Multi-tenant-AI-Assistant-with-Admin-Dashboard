/**
 * ADMIN DASHBOARD API
 *
 * GET /api/projects/[projectId]/admin/dashboard - Get dashboard data
 *
 * Requires project admin role.
 * Returns config-driven dashboard with resolved data.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  isProjectAdmin,
  AuthorizationError,
  AuthenticationError,
} from "@/lib/access";
import * as adminService from "@/lib/services/admin.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Only admins can access the dashboard
    await isProjectAdmin(projectId);

    const dashboardData = await adminService.getDashboardData(projectId);

    return NextResponse.json(dashboardData);
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
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
