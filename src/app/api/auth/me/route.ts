/**
 * GET /api/auth/me - Returns current authenticated user
 */

import { NextResponse } from "next/server";
import { getCurrentUser, AuthenticationError } from "@/lib/access";

export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isGlobalAdmin: user.isGlobalAdmin,
        projectRoles: user.projectRoles,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
