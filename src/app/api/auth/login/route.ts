/**
 * AUTH API - Mock Login
 *
 * POST /api/auth/login - Sets user session cookie
 * GET /api/auth/me - Returns current user
 * POST /api/auth/logout - Clears session
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { loginSchema } from "@/lib/validators";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    await connectDB();
    const user = await User.findOne({ email: parsed.email }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Use a seeded email." },
        { status: 404 }
      );
    }

    // Set mock session cookie
    const cookieStore = await cookies();
    cookieStore.set("user_email", parsed.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isGlobalAdmin: user.isGlobalAdmin,
        projectRoles: user.projectRoles,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 400 }
    );
  }
}
