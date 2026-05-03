/**
 * ADMIN DASHBOARD HOOKS
 *
 * TanStack Query hooks for the config-driven admin dashboard.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Types ───
interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  source?: string;
  size: "small" | "medium" | "large" | "full";
  order: number;
  config?: Record<string, unknown>;
  isVisible: boolean;
  data: unknown;
}

interface DashboardData {
  widgets: DashboardWidget[];
  theme: {
    primaryColor: string;
    accentColor: string;
  };
  refreshIntervalMs: number;
}

interface IntegrationData {
  productInstance: {
    _id: string;
    projectId: string;
    name: string;
    integrations: {
      shopify: boolean;
      crm: boolean;
    };
  };
}

// ─── Fetch Functions ───
async function fetchDashboard(
  projectId: string
): Promise<DashboardData> {
  const res = await fetch(
    `/api/projects/${projectId}/admin/dashboard`
  );
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

async function fetchIntegrations(
  projectId: string
): Promise<IntegrationData> {
  const res = await fetch(
    `/api/projects/${projectId}/integrations`
  );
  if (!res.ok) throw new Error("Failed to fetch integrations");
  return res.json();
}

async function updateIntegrations(data: {
  projectId: string;
  shopify: boolean;
  crm: boolean;
}): Promise<IntegrationData> {
  const res = await fetch(
    `/api/projects/${data.projectId}/integrations`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopify: data.shopify,
        crm: data.crm,
      }),
    }
  );
  if (!res.ok) throw new Error("Failed to update integrations");
  return res.json();
}

// ─── Hooks ───
export function useDashboard(projectId: string) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", projectId],
    queryFn: () => fetchDashboard(projectId),
    enabled: !!projectId,
    refetchInterval: 30000, // Auto-refresh every 30s
  });
}

export function useIntegrations(projectId: string) {
  return useQuery<IntegrationData>({
    queryKey: ["integrations", projectId],
    queryFn: () => fetchIntegrations(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateIntegrations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIntegrations,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["integrations", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", variables.projectId],
      });
    },
  });
}
