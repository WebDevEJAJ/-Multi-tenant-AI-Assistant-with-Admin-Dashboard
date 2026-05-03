"use client";

import { useAuth, useLogout } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProjectsPage() {
  const router = useRouter();
  const { data: user, isLoading: authLoading } = useAuth();
  const logoutMutation = useLogout();
  const { data: projects, isLoading: projectsLoading } = useProjects();

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

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/");
  };

  return (
    <div className="min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, rgb(99 102 241) 0%, transparent 70%)",
            filter: "blur(100px)",
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
          <div className="flex items-center gap-3">
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <span className="font-bold text-lg gradient-text">
              AI Assistant
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium">{user.name}</div>
                <div
                  className="text-xs"
                  style={{ color: "rgb(var(--color-text-muted))" }}
                >
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost text-xs"
              data-testid="logout-button"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
          <p style={{ color: "rgb(var(--color-text-secondary))" }}>
            Select a project to start chatting with AI or manage your
            dashboard.
          </p>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <div className="skeleton h-6 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const userRole = user.projectRoles.find(
                (pr) => pr.projectId === project._id
              );
              const isAdmin =
                user.isGlobalAdmin || userRole?.role === "admin";

              return (
                <div
                  key={project._id}
                  className="glass-card-hover p-6 fade-in"
                  data-testid={`project-card-${project.slug}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                        />
                      </svg>
                    </div>
                    <span
                      className={`status-badge ${isAdmin ? "status-badge--active" : "status-badge--warning"}`}
                    >
                      {isAdmin ? "Admin" : "Member"}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-1">
                    {project.name}
                  </h3>
                  <p
                    className="text-sm mb-4 line-clamp-2"
                    style={{
                      color: "rgb(var(--color-text-secondary))",
                    }}
                  >
                    {project.description || "No description"}
                  </p>

                  <div
                    className="flex items-center gap-2 text-xs mb-4"
                    style={{
                      color: "rgb(var(--color-text-muted))",
                    }}
                  >
                    <span>Model: {project.settings.aiModel}</span>
                    <span>•</span>
                    <span>/{project.slug}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(`/chat/${project._id}`)
                      }
                      className="btn-primary text-xs flex-1 justify-center"
                      data-testid={`chat-btn-${project.slug}`}
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
                      Chat
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() =>
                          router.push(`/admin/${project._id}`)
                        }
                        className="btn-ghost text-xs"
                        data-testid={`admin-btn-${project.slug}`}
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
                            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                          />
                        </svg>
                        Admin
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No Projects</h3>
            <p style={{ color: "rgb(var(--color-text-muted))" }}>
              No projects available. Run the seed script to create sample
              data.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
