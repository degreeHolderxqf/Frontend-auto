export interface CampaignStats {
  totalDiscovered: number;
  candidates: number;
  excluded: number;
  duplicates: number;
  qualified: number;
  totalContacts: number;
  highConfidence: number;
  mediumConfidence: number;
  noContact: number;
  readyToSend: number;
  sent: number;
  failed: number;
}

export type LeadStatus =
  | "DISCOVERED"
  | "RESEARCHING"
  | "EMAIL_FOUND"
  | "READY"
  | "APPROVED"
  | "SENT"
  | "FAILED"
  | "NO_CONTACT"
  | "LOW_RELEVANCE"
  | "EXCLUDED";

export type EmailConfidence = "HIGH" | "MEDIUM" | "LOW" | "NONE";

export interface Contact {
  id: number;
  company_id: number;
  name: string | null;
  role: string | null;
  email: string;
  email_type: string;
  confidence: EmailConfidence;
  source_url: string | null;
  verified: number;
  mx_valid: number;
  notes?: string | null;
}

export interface Lead {
  id: number;
  name: string;
  normalized_name: string;
  domain: string | null;
  shopify_partner_url: string | null;
  official_website: string | null;
  city: string | null;
  state: string | null;
  country: string;
  partner_tier: string | null;
  rating: number | null;
  reviews: number;
  app_relevance_score: number;
  lead_score: number;
  shopify_services: string | null;
  public_apps: string | null;
  careers_url: string | null;
  linkedin_url: string | null;
  status: LeadStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;

  // Best Contact Joined
  contact_id?: number | null;
  contact_name?: string | null;
  contact_role?: string | null;
  email?: string | null;
  email_type?: string | null;
  email_confidence?: EmailConfidence;
  email_source_url?: string | null;
}

export interface Source {
  id: number;
  company_id: number;
  source_type: string;
  url: string;
  title: string | null;
  evidence: string | null;
  created_at?: string;
}

export interface EmailLog {
  id: number;
  company_id: number;
  contact_id: number | null;
  email: string;
  subject: string | null;
  status: "SENT" | "FAILED" | "SIMULATED";
  sent_at: string;
  message_id: string | null;
  error: string | null;
}

export interface Exclusion {
  id: number;
  company_name: string;
  normalized_name: string;
  domain: string | null;
  reason: string;
  created_at: string;
}

export interface EmailPreviewData {
  to: string;
  recipientName: string;
  companyName: string;
  subject: string;
  text: string;
  html: string;
  resumeAttachment: string;
  confidence: EmailConfidence;
  emailType: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
  data?: T;
}
