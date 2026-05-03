/**
 * PROJECT HOOKS
 *
 * TanStack Query hooks for project data.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

interface Project {
  _id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  settings: {
    aiModel: string;
    maxTokens: number;
    systemPrompt: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data.projects;
}

async function fetchProject(projectId: string): Promise<Project> {
  const res = await fetch(`/api/projects/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  const data = await res.json();
  return data.project;
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
}

export function useProject(projectId: string) {
  return useQuery<Project>({
    queryKey: ["projects", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
  });
}
