import { apiClient } from "./client";

export async function triggerDiscovery(
  candidates = 200,
  fetchAllPages = false,
  source: "freelancing" | "appstore" | "partner" = "appstore",
  options: { keywords?: string; country?: string } = {}
): Promise<any> {
  return apiClient("/api/actions/discover", {
    method: "POST",
    body: JSON.stringify({ candidates, fetchAllPages, source, ...options }),
  });
}

export async function triggerResearch(companyId?: number): Promise<any> {
  return apiClient("/api/actions/research", {
    method: "POST",
    body: JSON.stringify(companyId ? { companyId } : {}),
  });
}

export async function triggerLeadWorkflow(
  target = 100,
  source?: "freelancing" | "appstore" | "partner",
  options: { keywords?: string; country?: string } = {}
): Promise<any> {
  return apiClient("/api/actions/leads", {
    method: "POST",
    body: JSON.stringify({ target, ...(source ? { source } : {}), ...options }),
    timeout: 15 * 60 * 1000,
    retries: 0,
  });
}

export async function triggerMerchantIngest(fileName: string, content: string): Promise<any> {
  return apiClient("/api/merchant/ingest", {
    method: "POST",
    body: JSON.stringify({ fileName, content, skipDuplicates: true }),
  });
}

export async function triggerAppStoreDiscovery(options: {
  maxApps?: number;
  indiaOnly?: boolean;
  fetchAllPages?: boolean;
  checkpoint?: any;
  enrichWithDetails?: boolean;
} = {}): Promise<any> {
  return apiClient("/api/discovery/app-store", {
    method: "POST",
    body: JSON.stringify({
      maxApps: options.maxApps || 200,
      indiaOnly: options.indiaOnly !== false,
      fetchAllPages: options.fetchAllPages || false,
      checkpoint: options.checkpoint || null,
      enrichWithDetails: options.enrichWithDetails !== false
    }),
  });
}

export async function getAppStoreDiscoveryStatus(): Promise<any> {
  return apiClient("/api/discovery/app-store/status", { method: "GET" });
}

export async function getAppStoreCompanies(limit = 100, offset = 0, status?: string): Promise<any> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (status) params.set("status", status);
  return apiClient(`/api/discovery/app-store/companies?${params.toString()}`, { method: "GET" });
}

export async function triggerQuickIndiaDiscovery(maxApps = 100): Promise<any> {
  return apiClient("/api/discovery/app-store/quick-india", {
    method: "POST",
    body: JSON.stringify({ maxApps }),
  });
}
