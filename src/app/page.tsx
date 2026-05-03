"use client";

import { useState, useEffect } from "react";
import { useAuth, useLogin } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { data: user, isLoading: authLoading } = useAuth();
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/projects");
    }
  }, [user, router]);

  const handleLogin = async (loginEmail: string) => {
    setSelectedUser(loginEmail);
    try {
      await loginMutation.mutateAsync(loginEmail);
      router.push("/projects");
    } catch {
      setSelectedUser(null);
    }
  };

  if (authLoading) {
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

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgb(99 102 241) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgb(139 92 246) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg
              className="w-8 h-8 text-white"
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
          <h1 className="text-3xl font-bold gradient-text mb-2">
            AI Assistant
          </h1>
          <p
            className="text-sm"
            style={{ color: "rgb(var(--color-text-secondary))" }}
          >
            Multi-tenant AI chat platform with integrations
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 fade-in" data-testid="login-card">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Sign In
          </h2>

          {/* Quick Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleLogin("admin@example.com")}
              disabled={loginMutation.isPending}
              className="w-full glass-card-hover p-4 flex items-center gap-4 cursor-pointer border-0"
              data-testid="login-admin"
              style={{ borderRadius: "12px" }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                A
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-sm">Admin User</div>
                <div
                  className="text-xs"
                  style={{ color: "rgb(var(--color-text-muted))" }}
                >
                  admin@example.com
                </div>
              </div>
              <span className="status-badge status-badge--active text-xs">
                Admin
              </span>
              {selectedUser === "admin@example.com" &&
                loginMutation.isPending && (
                  <div className="flex gap-1">
                    <div className="pulse-dot" />
                    <div className="pulse-dot" />
                    <div className="pulse-dot" />
                  </div>
                )}
            </button>

            <button
              onClick={() => handleLogin("member@example.com")}
              disabled={loginMutation.isPending}
              className="w-full glass-card-hover p-4 flex items-center gap-4 cursor-pointer border-0"
              data-testid="login-member"
              style={{ borderRadius: "12px" }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                M
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-sm">Team Member</div>
                <div
                  className="text-xs"
                  style={{ color: "rgb(var(--color-text-muted))" }}
                >
                  member@example.com
                </div>
              </div>
              <span className="status-badge status-badge--warning text-xs">
                Member
              </span>
              {selectedUser === "member@example.com" &&
                loginMutation.isPending && (
                  <div className="flex gap-1">
                    <div className="pulse-dot" />
                    <div className="pulse-dot" />
                    <div className="pulse-dot" />
                  </div>
                )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex-1 h-px"
              style={{
                background: "rgba(var(--color-border), 0.5)",
              }}
            />
            <span
              className="text-xs"
              style={{ color: "rgb(var(--color-text-muted))" }}
            >
              or enter email
            </span>
            <div
              className="flex-1 h-px"
              style={{
                background: "rgba(var(--color-border), 0.5)",
              }}
            />
          </div>

          {/* Email Login */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) handleLogin(email);
            }}
            className="space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="input-field"
              data-testid="login-email-input"
            />
            <button
              type="submit"
              disabled={!email || loginMutation.isPending}
              className="btn-primary w-full justify-center"
              data-testid="login-submit"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {loginMutation.isError && (
            <p className="mt-4 text-sm text-center text-red-400">
              {loginMutation.error.message}
            </p>
          )}
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: "rgb(var(--color-text-muted))" }}
        >
          This is a mock login for development. Seeded users are
          pre-configured.
        </p>
      </div>
    </div>
  );
}
