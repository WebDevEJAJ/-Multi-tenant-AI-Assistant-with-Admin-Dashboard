"use client";

import { use, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-admin";
import { useRouter } from "next/navigation";
import { DynamicWidget } from "@/components/dashboard/dynamic-widget";

interface AdminPageProps {
  params: Promise<{ projectId: string }>;
}

export default function AdminDashboardPage({ params }: AdminPageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const { data: user, isLoading: authLoading } = useAuth();
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch,
  } = useDashboard(projectId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-2">
          <div className="pulse-dot" />
          <div className="pulse-dot" />
          <div className="pulse-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/3 w-[800px] h-[800px] rounded-full opacity-5"
          style={{
            background: `radial-gradient(circle, ${dashboard?.theme?.primaryColor ?? "#6366f1"} 0%, transparent 70%)`,
            filter: "blur(120px)",
          }}
        />
      </div>

      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          background: "rgba(var(--color-bg), 0.8)",
          borderColor: "rgba(var(--color-border), 0.3)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/projects")}
              className="btn-ghost text-xs"
              data-testid="admin-back-btn"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Projects
            </button>
            <div
              className="w-px h-6"
              style={{ background: "rgba(var(--color-border), 0.5)" }}
            />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg">Admin Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/chat/${projectId}`)}
              className="btn-ghost text-xs"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              Go to Chat
            </button>
            <button
              onClick={() => refetch()}
              className="btn-ghost text-xs"
              data-testid="refresh-dashboard"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold mb-2">
            Dashboard
          </h1>
          <p
            className="text-sm"
            style={{ color: "rgb(var(--color-text-secondary))" }}
          >
            Config-driven admin dashboard. Modify the{" "}
            <code
              className="px-1.5 py-0.5 rounded text-xs"
              style={{
                background: "rgba(var(--color-surface-2), 0.8)",
                color: "rgb(var(--color-primary))",
              }}
            >
              adminDashboardConfig
            </code>{" "}
            document in MongoDB to change this UI dynamically.
          </p>
        </div>

        {/* Error State */}
        {dashboardError && (
          <div
            className="glass-card p-6 mb-6"
            style={{
              borderColor: "rgba(var(--color-error), 0.3)",
              border: "1px solid rgba(var(--color-error), 0.3)",
            }}
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <div>
                <p className="font-medium text-red-400">
                  Failed to load dashboard
                </p>
                <p
                  className="text-sm"
                  style={{ color: "rgb(var(--color-text-muted))" }}
                >
                  {dashboardError.message}. Make sure you&apos;re logged in as
                  an admin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {dashboardLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`glass-card p-6 ${i > 4 ? "md:col-span-2" : ""}`}
              >
                <div className="skeleton h-4 w-1/3 mb-4" />
                <div className="skeleton h-8 w-1/2 mb-2" />
                <div className="skeleton h-4 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Widget Grid */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="dashboard-grid">
            {dashboard.widgets.map((widget) => (
              <DynamicWidget
                key={widget.id}
                widget={widget}
                projectId={projectId}
              />
            ))}
          </div>
        )}

        {/* Config Info Footer */}
        {dashboard && (
          <div
            className="mt-8 p-4 rounded-xl text-xs text-center"
            style={{
              background: "rgba(var(--color-surface), 0.3)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            <p>
              Rendering <strong>{dashboard.widgets.length}</strong> widgets
              from MongoDB config | Auto-refreshes every{" "}
              <strong>{dashboard.refreshIntervalMs / 1000}s</strong> | Theme:{" "}
              <span
                className="inline-block w-3 h-3 rounded-full align-middle"
                style={{ background: dashboard.theme.primaryColor }}
              />{" "}
              {dashboard.theme.primaryColor}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
