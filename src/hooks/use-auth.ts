/**
 * AUTH HOOKS
 *
 * TanStack Query hooks for authentication state management.
 * No direct API calls in components — all go through these hooks.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AuthUser {
  _id: string;
  email: string;
  name: string;
  isGlobalAdmin: boolean;
  projectRoles: { projectId: string; role: string }[];
}

async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

async function loginUser(email: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Login failed");
  }

  const data = await res.json();
  return data.user;
}

async function logoutUser(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export function useAuth() {
  return useQuery<AuthUser | null>({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });
}
