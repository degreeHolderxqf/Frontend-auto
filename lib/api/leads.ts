import { apiClient, getApiBaseUrl } from "./client";
import { Lead, Contact, Source, EmailLog } from "@/types";

export interface GetLeadsParams {
  limit?: number | "all";
  status?: string;
  minScore?: number;
  search?: string;
}

export async function fetchLeads(params: GetLeadsParams = {}): Promise<Lead[]> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.minScore) query.set("minScore", String(params.minScore));
  if (params.search) query.set("search", params.search);

  const qs = query.toString();
  const endpoint = qs ? `/api/leads?${qs}` : "/api/leads";

  const data = await apiClient<{ success: boolean; count: number; leads: Lead[] }>(endpoint);
  return data.leads || [];
}

export async function fetchLeadById(
  id: number
): Promise<{ company: Lead; contacts: Contact[]; sources: Source[]; emailLogs: EmailLog[] }> {
  const data = await apiClient<{
    success: boolean;
    lead: { company: Lead; contacts: Contact[]; sources: Source[]; emailLogs: EmailLog[] };
  }>(`/api/leads/${id}`);
  return data.lead;
}

export function getDownloadUrl(format: "csv" | "xlsx"): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl.replace(/\/$/, "")}/download/${format}`;
}
