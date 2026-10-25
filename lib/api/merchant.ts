import { apiClient } from "./client";

export interface MerchantMessagePreview {
  to: string | null;
  subject: string | null;
  body: string;
  text: string;
  channel: "email" | "whatsapp";
  templateId?: "freelancingStores" | "appDevelopers" | "agencies";
  templateTarget?: string;
  includeResume?: boolean;
  leadId: number;
  storeName: string;
  domain: string | null;
  installedApps: string[];
  techStack: string[];
  primaryApp: string | null;
  hasEmail: boolean;
  hasPhone: boolean;
}

export interface MerchantQueueBatch {
  id: string;
  status: string;
  total?: number;
  pending?: number;
  sent?: number;
  failed?: number;
  skipped?: number;
  results?: {
    pending: number;
    sent: number;
    failed: number;
    skipped: number;
    total: number;
  };
}

export async function previewMerchantMessage(
  leadId: number,
  channel: "email" | "whatsapp"
): Promise<MerchantMessagePreview> {
  const response = await apiClient<{ success: boolean; preview: MerchantMessagePreview }>(
    "/api/merchant/preview",
    {
      method: "POST",
      body: JSON.stringify({ leadId, channel })
    }
  );
  return response.preview;
}

export async function startMerchantQueue(
  leadIds: number[],
  channel: "email" | "whatsapp",
  dryRun: boolean,
  templateId?: MerchantMessagePreview["templateId"]
): Promise<{ success: boolean; message: string; batch: MerchantQueueBatch }> {
  return apiClient("/api/merchant/queue/start", {
    method: "POST",
    body: JSON.stringify({ leadIds, channel, dryRun, templateId }),
    timeout: 45000,
    retries: 0
  });
}

export async function getMerchantQueueStatus(
  batchId: string
): Promise<{ success: boolean; batch: MerchantQueueBatch }> {
  return apiClient(`/api/merchant/queue/status/${encodeURIComponent(batchId)}`, {
    method: "GET"
  });
}
