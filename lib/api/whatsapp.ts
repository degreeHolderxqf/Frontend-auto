import { apiClient } from "./client";
import { WhatsAppConnectionStatus, WhatsAppPreview, WhatsAppLog } from "@/types";

export async function fetchWhatsAppStatus(): Promise<WhatsAppConnectionStatus> {
  return apiClient<WhatsAppConnectionStatus>("/api/whatsapp/status");
}

export async function connectWhatsApp(): Promise<{ success: boolean; qrcode?: string; pairingCode?: string; simulation?: boolean; message?: string; error?: string }> {
  return apiClient<{ success: boolean; qrcode?: string; pairingCode?: string; simulation?: boolean; message?: string; error?: string }>("/api/whatsapp/connect", {
    method: "POST"
  });
}

export async function simulateWhatsAppConnect(connected = true): Promise<{ success: boolean; connected: boolean; message: string }> {
  return apiClient<{ success: boolean; connected: boolean; message: string }>("/api/whatsapp/simulate-connect", {
    method: "POST",
    body: JSON.stringify({ connected })
  });
}

export async function fetchWhatsAppPreview(leadId: number): Promise<WhatsAppPreview> {
  const data = await apiClient<{ success: boolean; preview: WhatsAppPreview }>(`/api/whatsapp/preview/${leadId}`);
  return data.preview;
}

export async function sendWhatsAppMessage(
  leadId: number,
  phone?: string,
  message?: string
): Promise<{ success: boolean; dryRun?: boolean; messageId?: string; message?: string; error?: string }> {
  return apiClient<{ success: boolean; dryRun?: boolean; messageId?: string; message?: string; error?: string }>(
    "/api/whatsapp/send",
    {
      method: "POST",
      body: JSON.stringify({ leadId, phone, message })
    }
  );
}

export async function sendWhatsAppBatch(
  leadIds: number[]
): Promise<{ success: boolean; results: { total: number; sent: number; failed: number; skipped: number } }> {
  return apiClient<{ success: boolean; results: { total: number; sent: number; failed: number; skipped: number } }>(
    "/api/whatsapp/send-batch",
    {
      method: "POST",
      body: JSON.stringify({ leadIds })
    }
  );
}

export async function disconnectWhatsApp(): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>("/api/whatsapp/disconnect", {
    method: "POST"
  });
}

export async function testEvolutionApi(data: { evolutionApiUrl?: string; evolutionApiKey?: string; evolutionInstanceName?: string }): Promise<{ success: boolean; version?: string; message: string }> {
  return apiClient<{ success: boolean; version?: string; message: string }>("/api/whatsapp/test-connection", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function fetchWhatsAppLogs(): Promise<WhatsAppLog[]> {
  const data = await apiClient<{ success: boolean; count: number; logs: WhatsAppLog[] }>("/api/whatsapp/logs");
  return data.logs;
}

