import { apiClient, getApiBaseUrl } from "./client";

export interface StoreAuditFinding {
  id: string;
  title: string;
  observation: string;
  displayValue: string;
  score: number | null;
  solution: string;
  source: string;
}

export interface StoreAuditIssue {
  id: string;
  category: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  impact: string;
  effort: string;
  observation: string;
  evidence: Array<{ url: string; description: string }>;
  businessImpact: string;
  recommendation: string;
  verificationStatus: "verified" | "needs_verification" | string;
  confidence: "high" | "medium" | "low" | string;
}

export interface StoreAuditReport {
  version: number;
  generatedAt: string;
  scope: string;
  pagesInspected: Array<{ url: string; type: string; status: number }>;
  pagesSkipped: Array<{ url: string; reason: string }>;
  limitations: string[];
  sections: string[];
  executiveSummary: string;
  priorityCounts: Record<string, number>;
  recommendedFirstSteps: string[];
  verifiedCount: number;
  needsVerificationCount: number;
  overallAssessment: string;
  issues: StoreAuditIssue[];
}

export interface StorePerformanceAudit {
  id: number;
  company_id: number;
  store_name: string;
  domain: string | null;
  website_url: string;
  strategy: "mobile" | "desktop";
  status: "ANALYZING" | "REVIEW" | "APPROVED" | "SENDING" | "SENT" | "DRY_RUN_SENT" | "FAILED";
  email_mode: "short" | "report";
  performance_score: number | null;
  findings: StoreAuditFinding[];
  metrics: Record<string, string>;
  report: StoreAuditReport | null;
  email_subject: string | null;
  email_body: string | null;
  recipient_email: string | null;
  contact_name: string | null;
  approved_at: string | null;
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

export async function fetchStoreAudits(status?: string): Promise<StorePerformanceAudit[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await apiClient<{ success: boolean; audits: StorePerformanceAudit[] }>(
    `/api/merchant/audits${query}`
  );
  return response.audits;
}

export async function createStoreAudit(input: {
  leadId: number;
  mode: "short" | "report";
  strategy: "mobile" | "desktop";
}): Promise<StorePerformanceAudit> {
  const response = await apiClient<{ success: boolean; audit: StorePerformanceAudit }>(
    "/api/merchant/audits",
    {
      method: "POST",
      body: JSON.stringify(input),
      timeout: 180000,
      retries: 0
    }
  );
  return response.audit;
}

export async function updateStoreAuditDraft(
  auditId: number,
  draft: { subject: string; body: string; mode: "short" | "report" }
): Promise<StorePerformanceAudit> {
  const response = await apiClient<{ success: boolean; audit: StorePerformanceAudit }>(
    `/api/merchant/audits/${auditId}`,
    { method: "PATCH", body: JSON.stringify(draft) }
  );
  return response.audit;
}

export async function approveStoreAudit(auditId: number): Promise<StorePerformanceAudit> {
  const response = await apiClient<{ success: boolean; audit: StorePerformanceAudit }>(
    `/api/merchant/audits/${auditId}/approve`,
    { method: "POST", body: JSON.stringify({}) }
  );
  return response.audit;
}

export async function sendApprovedStoreAudit(auditId: number): Promise<StorePerformanceAudit> {
  const response = await apiClient<{ success: boolean; audit: StorePerformanceAudit }>(
    `/api/merchant/audits/${auditId}/send`,
    { method: "POST", body: JSON.stringify({}), retries: 0 }
  );
  return response.audit;
}

export function getStoreAuditReportUrl(auditId: number): string {
  return `${getApiBaseUrl().replace(/\/$/, "")}/api/merchant/audits/${auditId}/report`;
}
