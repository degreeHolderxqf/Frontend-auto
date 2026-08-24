import { apiClient } from "./client";
import { EmailPreviewData, EmailLog } from "@/types";

export interface SendEmailPayload {
  limit?: number | "all";
  leadIds?: number[];
  dryRun?: boolean;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  results: {
    total: number;
    sent: number;
    failed: number;
    dryRun: boolean;
  };
}

export async function fetchEmailPreview(companyId: number): Promise<EmailPreviewData> {
  const data = await apiClient<{ success: boolean; preview: EmailPreviewData }>(
    `/api/email/preview/${companyId}`
  );
  return data.preview;
}

export async function sendOutreachEmails(
  payload: SendEmailPayload
): Promise<SendEmailResponse> {
  return apiClient<SendEmailResponse>("/api/email/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchEmailHistory(): Promise<EmailLog[]> {
  const data = await apiClient<{ success: boolean; count: number; history: EmailLog[] }>(
    "/api/email/history"
  );
  return data.history || [];
}
