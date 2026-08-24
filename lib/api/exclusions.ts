import { apiClient } from "./client";
import { Exclusion, ContactedLead } from "@/types";

export interface ExclusionsResponse {
  exclusions: Exclusion[];
  contacted: ContactedLead[];
}

export async function fetchExclusions(): Promise<ExclusionsResponse> {
  const data = await apiClient<{
    success: boolean;
    count: number;
    exclusions: Exclusion[];
    contacted?: ContactedLead[];
  }>("/api/exclusions");

  return {
    exclusions: data.exclusions || [],
    contacted: data.contacted || [],
  };
}

export async function addExclusion(name: string, domain?: string, reason?: string): Promise<any> {
  return apiClient("/api/exclusions", {
    method: "POST",
    body: JSON.stringify({ name, domain, reason }),
  });
}
