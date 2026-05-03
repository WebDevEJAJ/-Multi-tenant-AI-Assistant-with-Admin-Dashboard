# 🤖 Multi-tenant AI Assistant with Admin Dashboard

A production-grade, full-stack AI chat platform built with Next.js, MongoDB, and Google Gemini. Features multi-tenant project isolation, config-driven admin dashboards, simulated integrations (Shopify + CRM), and real AI-powered conversations.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan?style=flat-square&logo=tailwindcss)

---

## 🏗️ Architecture

This project follows a strict **layered architecture** with clean separation of concerns:

```
Access Layer → Service Layer → Route Handlers → Hooks → UI
```

| Layer | Purpose | Location |
|-------|---------|----------|
| **Access Layer** | Authorization decisions (canAccessProject, isAdmin) | `src/lib/access/` |
| **Service Layer** | Business logic (chat flow, dashboard data, integrations) | `src/lib/services/` |
| **Route Handlers** | HTTP interface, Zod validation, structured responses | `src/app/api/` |
| **Hooks** | TanStack Query data fetching, caching, mutations | `src/hooks/` |
| **UI** | React components, pages, layouts | `src/app/`, `src/components/` |

**Key Rule:** Database calls are NEVER made directly from route handlers — they always go through the service layer.

---

## 📂 Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # POST - Mock login
│   │   │   ├── logout/route.ts      # POST - Clear session
│   │   │   └── me/route.ts          # GET  - Current user
│   │   ├── chat/route.ts            # POST - Send message + AI response
│   │   └── projects/
│   │       ├── route.ts             # GET/POST - List/create projects
│   │       └── [projectId]/
│   │           ├── route.ts         # GET - Project detail
│   │           ├── conversations/
│   │           │   ├── route.ts     # GET/POST - List/create conversations
│   │           │   └── [conversationId]/
│   │           │       └── messages/route.ts  # GET - Message history
│   │           ├── integrations/route.ts      # GET/PUT - Integration toggles
│   │           └── admin/
│   │               └── dashboard/route.ts     # GET - Dashboard data
│   ├── admin/[projectId]/page.tsx   # Admin Dashboard (config-driven)
│   ├── chat/[projectId]/page.tsx    # Chat Interface
│   ├── projects/page.tsx            # Project Listing
│   ├── page.tsx                     # Login Page
│   ├── layout.tsx                   # Root Layout
│   └── globals.css                  # Design System
├── components/
│   ├── dashboard/
│   │   ├── dynamic-widget.tsx       # ⭐ Config-driven widget renderer
│   │   ├── stats-card.tsx           # Stats display widget
│   │   ├── integration-widget.tsx   # Integration status widget
│   │   ├── recent-activity.tsx      # Activity feed widget
│   │   ├── project-info.tsx         # Project details widget
│   │   └── user-list.tsx            # Team members widget
│   └── providers/
│       └── query-provider.tsx       # TanStack Query provider
├── hooks/
│   ├── use-auth.ts                  # Authentication hooks
│   ├── use-projects.ts              # Project data hooks
│   ├── use-conversations.ts         # Chat & conversation hooks
│   └── use-admin.ts                 # Admin dashboard hooks
└── lib/
    ├── access/index.ts              # Authorization layer
    ├── ai/
    │   ├── gemini.ts                # Google Gemini integration
    │   └── index.ts
    ├── db/
    │   ├── connection.ts            # MongoDB connection singleton
    │   ├── seed.ts                  # Database seed script
    │   └── models/
    │       ├── user.model.ts
    │       ├── project.model.ts
    │       ├── product-instance.model.ts
    │       ├── conversation.model.ts
    │       ├── message.model.ts
    │       ├── admin-dashboard-config.model.ts  # ⭐ Controls dashboard UI
    │       └── index.ts
    ├── integrations/
    │   ├── shopify.ts               # Simulated Shopify data
    │   ├── crm.ts                   # Simulated CRM data
    │   └── index.ts
    ├── services/
    │   ├── project.service.ts
    │   ├── conversation.service.ts
    │   ├── chat.service.ts          # Core chat pipeline
    │   ├── admin.service.ts         # Dashboard data resolver
    │   └── integration.service.ts
    └── validators/index.ts          # Zod validation schemas
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** (free tier: [Get one here](https://aistudio.google.com/apikey))

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file (already included with defaults):

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-chat-app

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai-chat-app?retryWrites=true&w=majority
```

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- **2 Users:** `admin@example.com` (admin) and `member@example.com` (member)
- **1 Project:** "Acme Corp AI Assistant"
- **1 Product Instance** with Shopify + CRM integrations enabled
- **1 Admin Dashboard Config** with 8 widgets
- **1 Sample Conversation** with 4 messages

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication

This project uses **mock authentication** with seeded users:

| Email | Role | Access |
|-------|------|--------|
| `admin@example.com` | Global Admin | All projects + Admin Dashboard |
| `member@example.com` | Member | Chat only (no admin dashboard) |

Login works by setting an `httpOnly` cookie with the user's email. The access layer checks this cookie on every API request.

---

## 📊 Admin Dashboard (Config-Driven) — KEY FEATURE

The admin dashboard is **entirely controlled by a MongoDB document**. The `adminDashboardConfig` collection stores the layout, widget types, data sources, and theme.

### How It Works

1. The `adminDashboardConfig` document defines an array of widgets
2. Each widget has a `type`, `title`, `source`, `size`, and `order`
3. The backend resolves data sources (e.g., `conversations.count`) to actual values
4. The frontend's `DynamicWidget` component maps types to React components
5. **Changing the MongoDB document changes the UI with zero code changes**

### Dashboard Config Structure

```json
{
  "projectId": "ObjectId",
  "layout": [
    {
      "id": "stats-conversations",
      "type": "stats_card",
      "title": "Total Conversations",
      "source": "conversations.count",
      "size": "small",
      "order": 0,
      "isVisible": true
    },
    {
      "type": "integration_status",
      "title": "Integration Status",
      "size": "medium",
      "order": 4,
      "isVisible": true
    }
  ],
  "theme": {
    "primaryColor": "#6366f1",
    "accentColor": "#8b5cf6"
  },
  "refreshIntervalMs": 30000
}
```

### Available Widget Types

| Type | Description | Data Source |
|------|-------------|-------------|
| `stats_card` | Numeric stat with icon | `conversations.count`, `messages.count`, `users.count`, `integrations.shopify.revenue` |
| `integration_status` | Shows Shopify/CRM toggle status | Auto-resolved from ProductInstance |
| `recent_activity` | Latest conversations feed | Auto-resolved from Conversations |
| `project_info` | Project metadata display | Auto-resolved from Project |
| `user_list` | Team members with roles | Auto-resolved from Users |
| `chart` | Bar chart visualization | `integrations.shopify.revenue`, `integrations.crm.leads` |

### Modifying the Dashboard

To change what appears on the admin dashboard, modify the `adminDashboardConfig` document in MongoDB:

```javascript
// In MongoDB Shell or Compass:
db.admindashboardconfigs.updateOne(
  { projectId: ObjectId("YOUR_PROJECT_ID") },
  {
    $set: {
      layout: [
        // Reorder, add, remove, or hide widgets here
        { id: "new-widget", type: "stats_card", title: "CRM Leads", source: "integrations.crm.leads", size: "small", order: 0, isVisible: true },
        // ... more widgets
      ]
    }
  }
)
```

**Refresh the admin page — the UI updates automatically!**

---

## 🤖 AI Integration

Uses **Google Gemini** (free tier) with:

- Structured prompt construction with system instructions
- **Integration data injection** — AI responses change based on enabled integrations
- Conversation history context (multi-turn)
- Rate limit handling with exponential backoff (up to 3 retries)
- Graceful fallback response on failure

### Chat Flow

```
User Message
  → Store in DB
  → Check enabled integrations
  → Inject Shopify/CRM data into prompt
  → Send to Gemini
  → Store AI response
  → Return to client
```

---

## 🔌 Integrations

Two simulated integrations with **realistic mock data**:

### Shopify (E-commerce)
- Orders, revenue, top products
- Monthly revenue trends
- AI uses this data to answer business questions

### CRM (Lead Management)
- Lead pipeline, conversion rates
- Leads by status and source
- AI references pipeline data when answering

**Toggle integrations** via the API:
```bash
curl -X PUT http://localhost:3000/api/projects/PROJECT_ID/integrations \
  -H "Content-Type: application/json" \
  -d '{"shopify": true, "crm": false}'
```

When toggled, the AI's responses **dynamically change** to include/exclude integration data.

---

## 🧪 Testing

The project includes `data-testid` attributes on key interactive elements:

- `data-testid="login-card"` — Login form
- `data-testid="login-admin"` — Admin quick-login button
- `data-testid="chat-input"` — Chat message input
- `data-testid="send-button"` — Send button
- `data-testid="thinking-indicator"` — AI thinking state
- `data-testid="dashboard-grid"` — Admin dashboard widget grid
- `data-testid="stats-card-*"` — Individual stats cards

---

## 🌐 Deployment

### Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `GEMINI_API_KEY`
4. Deploy

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP (or 0.0.0.0/0 for Vercel)
4. Get the connection string
5. Run seed script with the Atlas URI:
   ```bash
   MONGODB_URI="mongodb+srv://..." npm run seed
   ```

---

## 🔧 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** (App Router) | Framework, SSR, API routes |
| **React 19** | UI components |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling |
| **MongoDB + Mongoose** | Database + ODM |
| **Zod** | Input validation |
| **TanStack Query** | Server state management |
| **Google Gemini** | AI model |

---

## 📋 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login with email |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/projects` | ✅ | List projects |
| GET | `/api/projects/[id]` | ✅ | Get project |
| GET | `/api/projects/[id]/conversations` | ✅ | List conversations |
| POST | `/api/projects/[id]/conversations` | ✅ | Create conversation |
| GET | `/api/projects/[id]/conversations/[cid]/messages` | ✅ | Get messages |
| POST | `/api/chat` | ✅ | Send message + get AI response |
| GET | `/api/projects/[id]/admin/dashboard` | 🔒 Admin | Get dashboard data |
| GET | `/api/projects/[id]/integrations` | ✅ | Get integration status |
| PUT | `/api/projects/[id]/integrations` | 🔒 Admin | Toggle integrations |

---

## 📝 License

MIT
