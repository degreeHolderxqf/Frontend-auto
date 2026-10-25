import { apiClient } from "@/lib/api/client";

export type EmailTemplateId = "freelancingStores" | "appDevelopers" | "agencies";

export interface EmailTemplate {
  id: EmailTemplateId;
  target: string;
  audience: string;
  variable: "store_name" | "app_name" | "agency_name";
  subject: string;
  body: string;
}

export async function fetchEmailTemplates() {
  return apiClient<{ success: boolean; templates: EmailTemplate[]; activeTemplateId: EmailTemplateId }>("/api/templates");
}

export async function saveEmailTemplate(template: Pick<EmailTemplate, "id" | "subject" | "body">) {
  return apiClient<{ success: boolean; template: EmailTemplate }>("/api/templates/update", {
    method: "POST",
    body: JSON.stringify(template),
    retries: 0
  });
}

export async function setActiveEmailTemplate(templateId: EmailTemplateId) {
  return apiClient<{ success: boolean; activeTemplateId: EmailTemplateId }>("/api/templates/active", {
    method: "POST",
    body: JSON.stringify({ templateId }),
    retries: 0
  });
}
