/**
 * PROJECT SERVICE
 *
 * All business logic for project management.
 * Called by route handlers after access layer authorization.
 */

import { connectDB } from "@/lib/db/connection";
import { Project, ProductInstance, AdminDashboardConfig } from "@/lib/db/models";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validators";
import { Types } from "mongoose";

export async function getProjects(userId: string) {
  await connectDB();
  // Get all projects where user has a role
  const projects = await Project.find({ isActive: true })
    .sort({ updatedAt: -1 })
    .lean();
  return projects;
}

export async function getProjectById(projectId: string) {
  await connectDB();
  const project = await Project.findById(projectId).lean();
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}

export async function getProjectBySlug(slug: string) {
  await connectDB();
  const project = await Project.findOne({ slug }).lean();
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}

export async function createProject(
  data: CreateProjectInput,
  ownerId: string
) {
  await connectDB();

  // Check if slug already exists
  const existing = await Project.findOne({ slug: data.slug });
  if (existing) {
    throw new Error("A project with this slug already exists");
  }

  const project = await Project.create({
    ...data,
    ownerId: new Types.ObjectId(ownerId),
  });

  // Create default product instance
  await ProductInstance.create({
    projectId: project._id,
    name: `${data.name} - Default`,
    integrations: { shopify: false, crm: false },
  });

  // Create default admin dashboard config
  await AdminDashboardConfig.create({
    projectId: project._id,
    layout: [
      {
        id: "stats-conversations",
        type: "stats_card",
        title: "Total Conversations",
        source: "conversations.count",
        size: "small",
        order: 0,
        isVisible: true,
      },
      {
        id: "stats-messages",
        type: "stats_card",
        title: "Total Messages",
        source: "messages.count",
        size: "small",
        order: 1,
        isVisible: true,
      },
      {
        id: "stats-users",
        type: "stats_card",
        title: "Active Users",
        source: "users.count",
        size: "small",
        order: 2,
        isVisible: true,
      },
      {
        id: "stats-revenue",
        type: "stats_card",
        title: "Revenue",
        source: "integrations.shopify.revenue",
        size: "small",
        order: 3,
        isVisible: true,
      },
      {
        id: "integration-status",
        type: "integration_status",
        title: "Integration Status",
        size: "medium",
        order: 4,
        isVisible: true,
      },
      {
        id: "recent-activity",
        type: "recent_activity",
        title: "Recent Activity",
        size: "medium",
        order: 5,
        isVisible: true,
      },
      {
        id: "project-info",
        type: "project_info",
        title: "Project Overview",
        size: "full",
        order: 6,
        isVisible: true,
      },
    ],
  });

  return project;
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectInput
) {
  await connectDB();
  const project = await Project.findByIdAndUpdate(projectId, data, {
    new: true,
  }).lean();
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}

export async function getProjectMembers(projectId: string) {
  await connectDB();
  const { User } = await import("@/lib/db/models");
  const members = await User.find({
    "projectRoles.projectId": new Types.ObjectId(projectId),
  })
    .select("name email avatarUrl projectRoles")
    .lean();

  return members.map((m: { _id: unknown; name: string; email: string; avatarUrl?: string; projectRoles: { projectId: { toString(): string }; role: string }[] }) => {
    const role = m.projectRoles.find(
      (pr: { projectId: { toString(): string }; role: string }) => pr.projectId.toString() === projectId
    );
    return {
      _id: m._id,
      name: m.name,
      email: m.email,
      avatarUrl: m.avatarUrl,
      role: role?.role ?? "viewer",
    };
  });
}
