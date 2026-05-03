/**
 * ADMIN DASHBOARD SERVICE
 *
 * Business logic for the config-driven admin dashboard.
 * Reads dashboard config from MongoDB and resolves
 * data sources to actual values.
 */

import { connectDB } from "@/lib/db/connection";
import {
  AdminDashboardConfig,
  Conversation,
  Message,
  User,
  ProductInstance,
} from "@/lib/db/models";
import type { IDashboardWidget } from "@/lib/db/models";
import { getShopifyData } from "@/lib/integrations/shopify";
import { getCRMData } from "@/lib/integrations/crm";
import { Types } from "mongoose";

// ─── Types ───
export interface ResolvedWidget extends Omit<IDashboardWidget, "source"> {
  data: unknown;
  source?: string;
}

export interface DashboardData {
  widgets: ResolvedWidget[];
  theme: {
    primaryColor: string;
    accentColor: string;
  };
  refreshIntervalMs: number;
}

// ─── Data Source Resolver ───
async function resolveDataSource(
  source: string,
  projectId: string
): Promise<unknown> {
  const pid = new Types.ObjectId(projectId);

  switch (source) {
    case "conversations.count":
      return await Conversation.countDocuments({ projectId: pid });

    case "messages.count":
      return await Message.countDocuments({ projectId: pid });

    case "users.count": {
      const userCount = await User.countDocuments({
        "projectRoles.projectId": pid,
      });
      return userCount;
    }

    case "integrations.shopify.revenue":
      return `$${getShopifyData().totalRevenue.toLocaleString()}`;

    case "integrations.shopify.orders":
      return getShopifyData().totalOrders;

    case "integrations.crm.leads":
      return getCRMData().totalLeads;

    case "integrations.crm.pipeline":
      return `$${getCRMData().pipelineValue.toLocaleString()}`;

    case "integrations.crm.conversion":
      return `${getCRMData().conversionRate}%`;

    default:
      return null;
  }
}

// ─── Dashboard Config Retrieval ───
export async function getDashboardConfig(projectId: string) {
  await connectDB();
  const config = await AdminDashboardConfig.findOne({
    projectId: new Types.ObjectId(projectId),
  }).lean();

  if (!config) {
    throw new Error("Dashboard config not found for this project");
  }

  return config;
}

// ─── Resolve Full Dashboard ───
export async function getDashboardData(
  projectId: string
): Promise<DashboardData> {
  await connectDB();

  const config = await getDashboardConfig(projectId);

  // Resolve all visible widgets with their data sources
  const visibleWidgets = (config.layout as IDashboardWidget[])
    .filter((w: IDashboardWidget) => w.isVisible)
    .sort((a: IDashboardWidget, b: IDashboardWidget) => a.order - b.order);

  const resolvedWidgets: ResolvedWidget[] = await Promise.all(
    visibleWidgets.map(async (widget: IDashboardWidget) => {
      let data: unknown = null;

      // Resolve based on widget type
      switch (widget.type) {
        case "stats_card":
          if (widget.source) {
            data = await resolveDataSource(widget.source, projectId);
          }
          break;

        case "integration_status": {
          const productInstance = await ProductInstance.findOne({
            projectId: new Types.ObjectId(projectId),
          }).lean();
          data = {
            shopify: productInstance?.integrations?.shopify ?? false,
            crm: productInstance?.integrations?.crm ?? false,
          };
          break;
        }

        case "recent_activity": {
          const recentConversations = await Conversation.find({
            projectId: new Types.ObjectId(projectId),
          })
            .sort({ lastMessageAt: -1 })
            .limit(5)
            .populate("userId", "name email")
            .lean();

          data = recentConversations.map((c) => ({
            _id: c._id,
            title: c.title,
            messageCount: c.messageCount,
            lastMessageAt: c.lastMessageAt,
            user: c.userId,
          }));
          break;
        }

        case "project_info": {
          const { Project } = await import("@/lib/db/models");
          const project = await Project.findById(projectId).lean();
          data = {
            name: project?.name,
            slug: project?.slug,
            description: project?.description,
            aiModel: project?.settings?.aiModel,
            isActive: project?.isActive,
            createdAt: project?.createdAt,
          };
          break;
        }

        case "user_list": {
          const users = await User.find({
            "projectRoles.projectId": new Types.ObjectId(projectId),
          })
            .select("name email projectRoles")
            .lean();
          data = users.map((u: { _id: unknown; name: string; email: string; projectRoles: { projectId: { toString(): string }; role: string }[] }) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role:
              u.projectRoles.find(
                (r: { projectId: { toString(): string }; role: string }) => r.projectId.toString() === projectId
              )?.role ?? "viewer",
          }));
          break;
        }

        case "chart":
          if (widget.source === "integrations.shopify.revenue") {
            data = getShopifyData().monthlyRevenue;
          } else if (widget.source === "integrations.crm.leads") {
            data = getCRMData().leadsBySource;
          }
          break;
      }

      return {
        id: widget.id,
        type: widget.type,
        title: widget.title,
        source: widget.source,
        size: widget.size,
        order: widget.order,
        config: widget.config,
        isVisible: widget.isVisible,
        data,
      };
    })
  );

  return {
    widgets: resolvedWidgets,
    theme: config.theme,
    refreshIntervalMs: config.refreshIntervalMs,
  };
}

// ─── Update Dashboard Config ───
export async function updateDashboardConfig(
  projectId: string,
  update: {
    layout?: IDashboardWidget[];
    theme?: { primaryColor: string; accentColor: string };
    refreshIntervalMs?: number;
  }
) {
  await connectDB();

  const config = await AdminDashboardConfig.findOneAndUpdate(
    { projectId: new Types.ObjectId(projectId) },
    { $set: update },
    { new: true }
  ).lean();

  if (!config) {
    throw new Error("Dashboard config not found");
  }

  return config;
}
