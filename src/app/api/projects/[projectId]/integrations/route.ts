/**
 * INTEGRATIONS API
 *
 * GET  /api/projects/[projectId]/integrations - Get integration status
 * PUT  /api/projects/[projectId]/integrations - Update integration toggles
 */

import { NextRequest, NextResponse } from "next/server";
import {
  canAccessProject,
  isProjectAdmin,
  AuthorizationError,
  AuthenticationError,
} from "@/lib/access";
import * as integrationService from "@/lib/services/integration.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await canAccessProject(projectId);

    const instance =
      await integrationService.getProductInstanceByProject(projectId);

    return NextResponse.json({
      productInstance: instance,
    });
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
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Only admins can toggle integrations
    await isProjectAdmin(projectId);

    const body = await request.json();

    const instance =
      await integrationService.getProductInstance(projectId);

    const updated = await integrationService.updateIntegrations(
      instance._id.toString(),
      {
        shopify: body.shopify ?? instance.integrations.shopify,
        crm: body.crm ?? instance.integrations.crm,
      }
    );

    return NextResponse.json({ productInstance: updated });
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
    console.error("Update integrations error:", error);
    return NextResponse.json(
      { error: "Failed to update integrations" },
      { status: 400 }
    );
  }
}
