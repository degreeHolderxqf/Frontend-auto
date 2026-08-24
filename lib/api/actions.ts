import { apiClient } from "./client";

export async function triggerDiscovery(candidates = 150): Promise<any> {
  return apiClient("/api/actions/discover", {
    method: "POST",
    body: JSON.stringify({ candidates }),
  });
}

export async function triggerResearch(companyId?: number): Promise<any> {
  return apiClient("/api/actions/research", {
    method: "POST",
    body: JSON.stringify(companyId ? { companyId } : {}),
  });
}

export async function triggerLeadWorkflow(target = 100): Promise<any> {
  return apiClient("/api/actions/leads", {
    method: "POST",
    body: JSON.stringify({ target }),
  });
}
