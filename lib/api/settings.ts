import { apiClient } from "./client";
import { AppSettings } from "@/types";

export async function fetchSettings(): Promise<AppSettings> {
  const data = await apiClient<{ success: boolean; settings: AppSettings }>("/api/settings");
  return data.settings;
}

export async function updateSettings(
  settings: Partial<AppSettings>
): Promise<{ success: boolean; message: string; settings: AppSettings }> {
  return apiClient<{ success: boolean; message: string; settings: AppSettings }>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings)
  });
}

export async function testSmtpConnection(
  smtpConfig: Partial<AppSettings>
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  stage?: string;
  host?: string;
  port?: number;
}> {
  return apiClient<{
    success: boolean;
    message?: string;
    error?: string;
    code?: string;
    stage?: string;
    host?: string;
    port?: number;
  }>("/api/settings/test-smtp", {
    method: "POST",
    body: JSON.stringify(smtpConfig)
  });
}
