import { apiClient } from "./client";
import { CampaignStats } from "@/types";

export async function fetchHealth(): Promise<{ status: string; uptime: number; mode: string }> {
  return apiClient<{ status: string; uptime: number; mode: string }>("/health");
}

export async function fetchStats(): Promise<CampaignStats> {
  const data = await apiClient<{ success: boolean; stats: CampaignStats }>("/api/stats");
  return data.stats;
}
