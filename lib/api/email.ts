import { apiClient } from "./client";
import { EmailPreviewData, EmailLog } from "@/types";
import type { EmailTemplateId } from "./templates";

export interface SendEmailPayload {
  limit?: number | "all";
  leadIds?: number[];
  dryRun?: boolean;
  templateId?: EmailTemplateId;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  batchId?: string;
  status?: string;
  results: {
    total: number;
    sent: number;
    failed: number;
    pending?: number;
    dryRun: boolean;
  };
}

export interface BatchStatus {
  success: boolean;
  batch: {
    id: string;
    mode: string;
    status: string;
    total: number;
    sent: number;
    failed: number;
    pending: number;
    processing: number;
    startedAt: string;
    updatedAt: string;
    completedAt: string | null;
    error: string | null;
  };
}

export async function fetchEmailPreview(companyId: number, templateId?: EmailTemplateId): Promise<EmailPreviewData> {
  const data = await apiClient<{ success: boolean; preview: EmailPreviewData }>(
    `/api/email/preview/${companyId}${templateId ? `?templateId=${templateId}` : ""}`
  );
  return data.preview;
}

/**
 * Start a resumable email batch. Returns immediately with a batchId.
 * The backend will process the first chunk synchronously, then continue
 * sending in the background with checkpointed progress. Use getBatchStatus
 * to poll for progress.
 */
export async function sendOutreachEmails(
  payload: SendEmailPayload
): Promise<SendEmailResponse> {
  return apiClient<SendEmailResponse>("/api/email/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Poll the status of an in-flight or completed batch.
 */
export async function getBatchStatus(batchId: string): Promise<BatchStatus> {
  return apiClient<BatchStatus>(`/api/email/batch/${batchId}`);
}

/**
 * Manually resume a stalled or failed batch.
 */
export async function resumeBatch(batchId: string): Promise<any> {
  return apiClient<any>(`/api/email/batch/${batchId}/resume`, {
    method: "POST",
  });
}

export async function fetchEmailHistory(): Promise<EmailLog[]> {
  const data = await apiClient<{ success: boolean; count: number; history: EmailLog[] }>(
    "/api/email/history"
  );
  return data.history || [];
}
