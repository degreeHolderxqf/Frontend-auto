import { apiClient } from "./client";
import { Exclusion } from "@/types";

export async function fetchExclusions(): Promise<Exclusion[]> {
  const data = await apiClient<{ success: boolean; count: number; exclusions: Exclusion[] }>(
    "/api/exclusions"
  );
  return data.exclusions || [];
}

export async function addExclusion(name: string, domain?: string, reason?: string): Promise<any> {
  return apiClient("/api/exclusions", {
    method: "POST",
    body: JSON.stringify({ name, domain, reason }),
  });
}
