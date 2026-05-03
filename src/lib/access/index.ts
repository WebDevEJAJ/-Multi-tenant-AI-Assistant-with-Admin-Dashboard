/**
 * ACCESS LAYER
 *
 * This layer is responsible for all authorization decisions.
 * It sits between the route handlers and the service layer,
 * ensuring that every request is properly authorized before
 * any business logic is executed.
 *
 * Architecture: Route Handler → Access Layer → Service Layer → Database
 *
 * Rules:
 * - No direct DB calls from routes
 * - All permission checks happen here
 * - Returns typed results or throws AuthorizationError
 */

import { connectDB } from "@/lib/db/connection";
import { User, type IUser } from "@/lib/db/models";
import { cookies } from "next/headers";

// ─── Custom Errors ───
export class AuthorizationError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

export class AuthenticationError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
  }
}

// ─── Get Current User from Mock Session ───
export async function getCurrentUser(): Promise<IUser> {
  await connectDB();

  const cookieStore = await cookies();
  const userEmail = cookieStore.get("user_email")?.value;

  if (!userEmail) {
    throw new AuthenticationError("Not authenticated. Please log in.");
  }

  const user = await User.findOne({ email: userEmail });

  if (!user) {
    throw new AuthenticationError("User not found.");
  }

  return user;
}

// ─── Authorization Checks ───

/**
 * Check if the current user can access a specific project.
 * A user can access a project if they have ANY role in that project
 * or if they are a global admin.
 */
export async function canAccessProject(projectId: string): Promise<IUser> {
  const user = await getCurrentUser();

  if (user.isGlobalAdmin) {
    return user;
  }

  const hasAccess = user.projectRoles.some(
    (pr) => pr.projectId.toString() === projectId
  );

  if (!hasAccess) {
    throw new AuthorizationError(
      "You do not have access to this project."
    );
  }

  return user;
}

/**
 * Check if the current user is an admin for a specific project.
 * Required for admin dashboard access and project settings.
 */
export async function isProjectAdmin(projectId: string): Promise<IUser> {
  const user = await getCurrentUser();

  if (user.isGlobalAdmin) {
    return user;
  }

  const projectRole = user.projectRoles.find(
    (pr) => pr.projectId.toString() === projectId
  );

  if (!projectRole || projectRole.role !== "admin") {
    throw new AuthorizationError(
      "You must be a project admin to perform this action."
    );
  }

  return user;
}

/**
 * Check if the current user is a global admin.
 * Required for system-wide operations.
 */
export async function isAdmin(): Promise<IUser> {
  const user = await getCurrentUser();

  if (!user.isGlobalAdmin) {
    throw new AuthorizationError(
      "You must be a global admin to perform this action."
    );
  }

  return user;
}

/**
 * Get the user's role in a specific project.
 * Returns null if user has no role in the project.
 */
export async function getUserProjectRole(
  projectId: string
): Promise<{ user: IUser; role: "admin" | "member" | "viewer" | null }> {
  const user = await getCurrentUser();

  if (user.isGlobalAdmin) {
    return { user, role: "admin" };
  }

  const projectRole = user.projectRoles.find(
    (pr) => pr.projectId.toString() === projectId
  );

  return {
    user,
    role: projectRole?.role ?? null,
  };
}
