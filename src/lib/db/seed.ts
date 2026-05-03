/**
 * DATABASE SEED SCRIPT
 *
 * Seeds the database with initial data for development:
 * - 2 Users (admin + member)
 * - 1 Project
 * - 1 Product Instance (with integrations enabled)
 * - 1 Admin Dashboard Config
 * - 1 Sample Conversation with messages
 *
 * Run: npm run seed
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load .env.local for standalone script execution
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Direct imports to avoid Next.js module issues in standalone script
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ai-chat-app";

async function seed() {
  console.log("🌱 Starting database seed...");
  console.log(`📦 Connecting to: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // Clear existing data
  const collections = await mongoose.connection.db!.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
  console.log("🗑️  Cleared existing data");

  // Import models after connection
  const { User } = await import("./models/user.model");
  const { Project } = await import("./models/project.model");
  const { ProductInstance } = await import("./models/product-instance.model");
  const { Conversation } = await import("./models/conversation.model");
  const { Message } = await import("./models/message.model");
  const { AdminDashboardConfig } = await import(
    "./models/admin-dashboard-config.model"
  );

  // ─── Create Users ───
  const adminUser = await User.create({
    email: "admin@example.com",
    name: "Admin User",
    avatarUrl: "",
    isGlobalAdmin: true,
    projectRoles: [],
  });

  const memberUser = await User.create({
    email: "member@example.com",
    name: "Team Member",
    avatarUrl: "",
    isGlobalAdmin: false,
    projectRoles: [],
  });

  console.log("👤 Created users:", adminUser.email, memberUser.email);

  // ─── Create Project ───
  const project = await Project.create({
    name: "Acme Corp AI Assistant",
    slug: "acme-corp",
    description:
      "Multi-tenant AI assistant for Acme Corp with Shopify and CRM integrations",
    ownerId: adminUser._id,
    settings: {
      aiModel: "gemini-2.5-flash",
      maxTokens: 2048,
      systemPrompt:
        "You are Acme Corp's AI assistant. Help users with e-commerce analytics, CRM insights, and general business questions. Be professional, data-driven, and actionable in your responses.",
    },
    isActive: true,
  });

  // Assign roles
  adminUser.projectRoles.push({
    projectId: project._id,
    role: "admin",
  });
  await adminUser.save();

  memberUser.projectRoles.push({
    projectId: project._id,
    role: "member",
  });
  await memberUser.save();

  console.log("📁 Created project:", project.name);

  // ─── Create Product Instance ───
  const productInstance = await ProductInstance.create({
    projectId: project._id,
    name: "Acme Corp - Production",
    integrations: {
      shopify: true,
      crm: true,
    },
    config: {
      storeUrl: "acme-corp.myshopify.com",
      crmProvider: "HubSpot",
    },
  });

  console.log(
    "🔌 Created product instance with integrations:",
    productInstance.integrations
  );

  // ─── Create Admin Dashboard Config ───
  const dashboardConfig = await AdminDashboardConfig.create({
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
        title: "Total Revenue",
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
      {
        id: "user-list",
        type: "user_list",
        title: "Team Members",
        size: "full",
        order: 7,
        isVisible: true,
      },
    ],
    theme: {
      primaryColor: "#6366f1",
      accentColor: "#8b5cf6",
    },
    refreshIntervalMs: 30000,
  });

  console.log("📊 Created admin dashboard config with", dashboardConfig.layout.length, "widgets");

  // ─── Create Sample Conversation ───
  const conversation = await Conversation.create({
    projectId: project._id,
    userId: adminUser._id,
    productInstanceId: productInstance._id,
    title: "Q3 Revenue Analysis",
    messageCount: 4,
    lastMessageAt: new Date(),
  });

  // Create sample messages
  await Message.create([
    {
      conversationId: conversation._id,
      projectId: project._id,
      role: "user",
      content:
        "What's our current revenue situation? Give me a summary of our top-performing products.",
    },
    {
      conversationId: conversation._id,
      projectId: project._id,
      role: "assistant",
      content:
        "Based on your Shopify data, here's your revenue overview:\n\n**Total Revenue: $89,432.50** across 1,247 orders (Average Order Value: $71.72)\n\n**Top Performing Products:**\n1. 🏆 Smart Watch - $39,501 (198 sales)\n2. Wireless Headphones - $30,759 (342 sales)\n3. Bluetooth Speaker - $20,700 (276 sales)\n\nYour monthly revenue shows strong upward momentum, with May already at $29,083 - on track to be your best month yet!",
      metadata: {
        model: "gemini-2.0-flash",
        tokensUsed: 150,
        processingTimeMs: 1200,
        integrationDataUsed: ["shopify"],
      },
    },
    {
      conversationId: conversation._id,
      projectId: project._id,
      role: "user",
      content: "How about our CRM pipeline? Any hot leads?",
    },
    {
      conversationId: conversation._id,
      projectId: project._id,
      role: "assistant",
      content:
        "Here's your CRM pipeline status:\n\n**Pipeline Value: $1,250,000** | **342 Total Leads** | **23.4% Conversion Rate**\n\n**Hot Leads in Proposal Stage:**\n- GreenLeaf Solutions: $45,000 (Referral)\n- TechCorp Inc.: $25,000 (Website - Qualified)\n\n**Lead Sources Performance:**\n1. Website: 120 leads (best channel)\n2. Referrals: 85 leads (highest quality)\n3. LinkedIn: 62 leads\n\n📈 Your qualified pipeline (87 leads) represents strong potential. I'd recommend focusing follow-ups on the proposal-stage leads to maximize conversions this quarter.",
      metadata: {
        model: "gemini-2.0-flash",
        tokensUsed: 180,
        processingTimeMs: 1400,
        integrationDataUsed: ["crm"],
      },
    },
  ]);

  console.log("💬 Created sample conversation with 4 messages");

  // ─── Summary ───
  console.log("\n" + "═".repeat(50));
  console.log("🎉 Seed completed successfully!");
  console.log("═".repeat(50));
  console.log("\nSeeded data:");
  console.log(`  👤 Users: 2 (admin@example.com, member@example.com)`);
  console.log(`  📁 Projects: 1 (${project.name})`);
  console.log(`  🔌 Product Instances: 1 (Shopify + CRM enabled)`);
  console.log(`  📊 Dashboard Configs: 1 (${dashboardConfig.layout.length} widgets)`);
  console.log(`  💬 Conversations: 1 (with 4 messages)`);
  console.log("\nLogin credentials:");
  console.log("  Admin:  admin@example.com");
  console.log("  Member: member@example.com");
  console.log("\nProject ID:", project._id.toString());

  await mongoose.disconnect();
  console.log("\n✅ Database connection closed");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
