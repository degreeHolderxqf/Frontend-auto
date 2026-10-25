import { apiClient, getApiBaseUrl } from "./client";
import { Lead, Contact, Source, EmailLog, DashboardMetricKey, DashboardMetricRecord } from "@/types";

export interface GetLeadsParams {
  limit?: number | "all";
  status?: string;
  source?: string;
  minScore?: number;
  search?: string;
}

export async function fetchCompanies(params: GetLeadsParams = {}): Promise<Lead[]> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.source && params.source !== "ALL") query.set("source", params.source);
  if (params.search) query.set("search", params.search);

  const qs = query.toString();
  const endpoint = qs ? `/api/companies?${qs}` : "/api/companies";
  const data = await apiClient<{ success: boolean; count: number; companies: Lead[] }>(endpoint);
  return data.companies || [];
}

export async function refreshCompanyRevenue(id: number): Promise<Record<string, unknown>> {
  const data = await apiClient<{
    success: boolean;
    estimate: Record<string, unknown>;
  }>(`/api/companies/${id}/revenue-estimate`, {
    method: "POST",
    retries: 0,
  });
  return data.estimate;
}

export async function fetchLeads(params: GetLeadsParams = {}): Promise<Lead[]> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.source && params.source !== "ALL") query.set("source", params.source);
  if (params.minScore) query.set("minScore", String(params.minScore));
  if (params.search) query.set("search", params.search);

  const qs = query.toString();
  const endpoint = qs ? `/api/leads?${qs}` : "/api/leads";

  const data = await apiClient<{ success: boolean; count: number; leads: Lead[] }>(endpoint);
  return data.leads || [];
}

export async function fetchDashboardMetricRecords(
  metric: DashboardMetricKey
): Promise<DashboardMetricRecord[]> {
  const query = new URLSearchParams({ metric });
  const data = await apiClient<{
    success: boolean;
    metric: DashboardMetricKey;
    count: number;
    records: DashboardMetricRecord[];
  }>(`/api/dashboard/records?${query.toString()}`);

  // apiClient can also return plain text for non-JSON responses. Validate the
  // endpoint contract so an old backend's HTML fallback is never shown as an
  // empty metric result.
  if (!data || typeof data !== "object" || data.success !== true || !Array.isArray(data.records)) {
    throw new Error(
      "The dashboard records endpoint returned an invalid response. Restart the backend to load the latest API routes, then retry."
    );
  }

  return data.records || [];
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
