import mongoose, { Schema, Document, Types } from "mongoose";

// ─── Dashboard Widget Types ───
export type WidgetType =
  | "stats_card"
  | "integration_status"
  | "recent_activity"
  | "chart"
  | "project_info"
  | "user_list";

export interface IDashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  source?: string; // e.g., "conversations.count", "messages.count"
  size: "small" | "medium" | "large" | "full";
  order: number;
  config?: Record<string, unknown>;
  isVisible: boolean;
}

// ─── TypeScript Interface ───
export interface IAdminDashboardConfig extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  layout: IDashboardWidget[];
  theme: {
    primaryColor: string;
    accentColor: string;
  };
  refreshIntervalMs: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mongoose Schema ───
const DashboardWidgetSchema = new Schema<IDashboardWidget>(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "stats_card",
        "integration_status",
        "recent_activity",
        "chart",
        "project_info",
        "user_list",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    source: {
      type: String,
    },
    size: {
      type: String,
      enum: ["small", "medium", "large", "full"],
      default: "medium",
    },
    order: {
      type: Number,
      required: true,
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const AdminDashboardConfigSchema = new Schema<IAdminDashboardConfig>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
      index: true,
    },
    layout: {
      type: [DashboardWidgetSchema],
      default: [],
    },
    theme: {
      primaryColor: {
        type: String,
        default: "#6366f1",
      },
      accentColor: {
        type: String,
        default: "#8b5cf6",
      },
    },
    refreshIntervalMs: {
      type: Number,
      default: 30000,
    },
  },
  {
    timestamps: true,
  }
);

export const AdminDashboardConfig =
  mongoose.models.AdminDashboardConfig ||
  mongoose.model<IAdminDashboardConfig>(
    "AdminDashboardConfig",
    AdminDashboardConfigSchema
  );
