import { z } from "zod/v4";

// ─── Common Validators ───
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Invalid ObjectId format",
});

// ─── Project Validators ───
export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// ─── Conversation Validators ───
export const createConversationSchema = z.object({
  projectId: objectIdSchema,
  productInstanceId: objectIdSchema,
  title: z.string().min(1).max(200).optional(),
});

// ─── Message Validators ───
export const sendMessageSchema = z.object({
  conversationId: objectIdSchema,
  content: z.string().min(1).max(10000),
});

// ─── Product Instance Validators ───
export const updateIntegrationsSchema = z.object({
  productInstanceId: objectIdSchema,
  integrations: z.object({
    shopify: z.boolean(),
    crm: z.boolean(),
  }),
});

// ─── Admin Dashboard Config Validators ───
export const dashboardWidgetSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "stats_card",
    "integration_status",
    "recent_activity",
    "chart",
    "project_info",
    "user_list",
  ]),
  title: z.string().min(1).max(100),
  source: z.string().optional(),
  size: z.enum(["small", "medium", "large", "full"]),
  order: z.number().int().min(0),
  config: z.record(z.string(), z.unknown()).optional(),
  isVisible: z.boolean(),
});

export const updateDashboardConfigSchema = z.object({
  projectId: objectIdSchema,
  layout: z.array(dashboardWidgetSchema),
  theme: z
    .object({
      primaryColor: z.string(),
      accentColor: z.string(),
    })
    .optional(),
  refreshIntervalMs: z.number().int().min(5000).optional(),
});

// ─── Auth Validators ───
export const loginSchema = z.object({
  email: z.email(),
});

// ─── Query Param Validators ───
export const projectIdParamSchema = z.object({
  projectId: objectIdSchema,
});

export const conversationIdParamSchema = z.object({
  conversationId: objectIdSchema,
});

// ─── Type Exports ───
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateConversationInput = z.infer<
  typeof createConversationSchema
>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateIntegrationsInput = z.infer<
  typeof updateIntegrationsSchema
>;
export type UpdateDashboardConfigInput = z.infer<
  typeof updateDashboardConfigSchema
>;
export type LoginInput = z.infer<typeof loginSchema>;
