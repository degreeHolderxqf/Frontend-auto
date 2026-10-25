export interface CampaignStats {
  totalDiscovered: number;
  candidates: number;
  excluded: number;
  excludedOrTooLow?: number;
  duplicates: number;
  employeeVerified?: number;
  employeeTooLow?: number;
  employeeUncertain?: number;
  employeeConflicting?: number;
  qualified: number;
  totalContacts: number;
  highConfidence: number;
  mediumConfidence: number;
  noContact: number;
  merchantStores?: number;
  merchantStoresWithContact?: number;
  merchantStoresWithEmail?: number;
  merchantStoresWithPhone?: number;
  merchantStoresWithWhatsApp?: number;
  readyToSend: number;
  sent: number;
  contacted?: number;
  failed: number;
  bySource?: { source: string; count: number }[];
  appStoreByStatus?: { status: string; count: number }[];
  appStoreStats?: {
    total: number;
    high_confidence: number;
    medium_confidence: number;
    low_confidence: number;
  } | null;
}

export type LeadStatus =
  | "DISCOVERED"
  | "RESEARCHING"
  | "RESEARCHED"
  | "EMAIL_FOUND"
  | "READY"
  | "APPROVED"
  | "ACTIVE"
  | "SENT"
  | "CONTACTED"
  | "FAILED"
  | "NO_CONTACT"
  | "LOW_RELEVANCE"
  | "REJECTED_HEADCOUNT"
  | "UNCERTAIN_HEADCOUNT"
  | "NOT_ELIGIBLE"
  | "EXCLUDED";

export type EmailConfidence = "HIGH" | "MEDIUM" | "LOW" | "NONE";
export type WhatsAppStatus = "READY" | "SENT" | "FAILED" | "REPLIED" | "OPTED_OUT" | "DRY_RUN_SENT";

export interface Contact {
  id: number;
  company_id: number;
  name: string | null;
  role: string | null;
  email: string;
  email_type: string;
  confidence: EmailConfidence;
  source_url: string | null;
  phone?: string | null;
  normalized_phone?: string | null;
  phone_type?: string | null;
  phone_source?: string | null;
  phone_source_url?: string | null;
  whatsapp_available?: "yes" | "no" | "unknown" | string | null;
  whatsapp_status?: WhatsAppStatus | string | null;
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
  app_store_url?: string | null;
  app_store_slug?: string | null;
  source?: string; // SHOPIFY_PARTNER_DIRECTORY or SHOPIFY_APP_STORE
  developer_name?: string | null;
  developer_location?: string | null;
  developer_website?: string | null;
  support_email?: string | null;
  official_website: string | null;
  city: string | null;
  state: string | null;
  country: string;
  partner_tier: string | null;
  rating: number | null;
  reviews: number;
  employee_count?: number | null;
  employee_count_min?: number | null;
  employee_count_max?: number | null;
  employee_size_range?: string | null;
  employee_count_source?: string | null;
  employee_source?: string | null;
  employee_count_source_url?: string | null;
  employee_count_verified?: number | null;
  employee_count_verified_at?: string | null;
  employee_count_status?: "QUALIFIED" | "REJECTED" | "UNCERTAIN" | "CONFLICTING" | "UNKNOWN" | "NEED_MORE_VERIFICATION" | string | null;
  app_relevance_score: number;
  lead_score: number;
  shopify_services: string | null;
  public_apps: string | null;
  installed_apps?: string[] | null;
  tech_stack?: string[] | null;
  store_description?: string | null;
  product_count?: number | null;
  estimated_revenue?: string | null;
  estimated_monthly_revenue?: number | null;
  estimated_monthly_revenue_min?: number | null;
  estimated_monthly_revenue_max?: number | null;
  estimated_annual_revenue?: number | null;
  estimated_annual_revenue_min?: number | null;
  estimated_annual_revenue_max?: number | null;
  estimated_aov?: number | null;
  estimated_conversion_rate?: number | null;
  estimated_monthly_visits?: number | null;
  revenue_currency?: string | null;
  store_currency?: string | null;
  revenue_estimation_status?: string | null;
  revenue_estimation_confidence?: string | null;
  revenue_estimation_method?: string | null;
  revenue_estimation_reason?: string | null;
  revenue_traffic_provider?: string | null;
  revenue_traffic_metric?: string | null;
  revenue_traffic_period?: string | null;
  revenue_aov_method?: string | null;
  revenue_data_sources?: string[];
  revenue_assumptions?: string[];
  revenue_last_updated_at?: string | null;
  careers_url: string | null;
  linkedin_url: string | null;
  status: LeadStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;

  // Phone & WhatsApp Details
  phone?: string | null;
  normalized_phone?: string | null;
  phone_type?: string | null;
  phone_source?: string | null;
  phone_source_url?: string | null;
  whatsapp_available?: "yes" | "no" | "unknown" | string | null;
  whatsapp_status?: WhatsAppStatus | string | null;

  // Best Contact Joined
  contact_id?: number | null;
  contact_name?: string | null;
  contact_role?: string | null;
  email?: string | null;
  email_type?: string | null;
  email_confidence?: EmailConfidence;
  email_source_url?: string | null;
  record_id?: number;
  record_detail?: string | null;
  email_status?: string | null;
  activity_at?: string | null;
  activity_subject?: string | null;
  activity_message_id?: string | null;
}

export type DashboardMetricKey =
  | "discovered"
  | "merchantContacts"
  | "employeeVerified"
  | "emailContacts"
  | "readyToSend"
  | "emailsSent"
  | "excludedTooLow";

export interface DashboardMetricRecord extends Lead {
  record_id: number;
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
  status: "SENT" | "FAILED" | "SIMULATED" | "DRY_RUN_SENT";
  sent_at: string;
  message_id: string | null;
  error: string | null;
}

export interface WhatsAppLog {
  id: number;
  company_id: number;
  company_name?: string;
  domain?: string;
  contact_id?: number | null;
  contact_name?: string | null;
  phone: string;
  message: string;
  status: WhatsAppStatus | string;
  message_id?: string | null;
  error?: string | null;
  sent_at: string;
}

export interface Exclusion {
  id: number;
  company_name: string;
  normalized_name: string;
  domain: string | null;
  reason: string | null;
  created_at: string;
}

export interface ContactedLead {
  company_id: number;
  company_name: string;
  domain: string | null;
  official_website: string | null;
  employee_count?: number | null;
  employee_size_range?: string | null;
  employee_count_source?: string | null;
  status: string;
  sent_email?: string | null;
  email_subject?: string | null;
  email_status?: string | null;
  sent_at?: string | null;
  message_id?: string | null;
}

export interface EmailPreview {
  to: string;
  recipientName: string;
  companyName: string;
  templateId: "freelancingStores" | "appDevelopers" | "agencies";
  templateTarget: string;
  subject: string;
  text: string;
  html: string;
  resumeAttachment: string | null;
  confidence: EmailConfidence;
  emailType: string;
}

export interface WhatsAppPreview {
  recipientName: string;
  companyName: string;
  phone: string | null;
  templateId: "freelancingStores" | "appDevelopers" | "agencies";
  templateTarget: string;
  includeResume: boolean;
  text: string;
}

export interface WhatsAppConnectionStatus {
  online: boolean;
  version?: string;
  connected: boolean;
  state: "CONNECTED" | "OPEN" | "CONNECTING" | "DISCONNECTED" | "CLOSE" | string;
  apiUrl: string;
  instanceName: string;
  enabled: boolean;
  dryRun: boolean;
  delayMs: number;
}

export type EmailPreviewData = EmailPreview;

export interface AppSettings {
  // Candidate Profile
  candidateName: string;
  candidateRole: string;
  candidateExperience: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateSkills: string[];
  resumeFilename?: string;
  resumePath?: string;

  // SMTP Settings
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass?: string;
  emailFrom: string;

  // Discovery & Targeting
  shopifyDirectoryUrl: string;
  targetCountry: string;
  targetLeads: number;
  minAppRelevanceScore: number;

  // Employee Verification
  minEmployeeCount?: number | null;

  // Shopify App Store Discovery
  appStoreDiscoveryEnabled?: boolean;
  appStoreIndiaOnly?: boolean;
  appStoreMaxApps?: number;
  appStoreMaxDetailFetches?: number;

  // Safety & Controls
  dryRun: boolean;
  sendLimit?: number | null;
  emailDelayMs: number;
  batchSize: number;
  batchDelayMs: number;

  // Evolution Go WhatsApp Settings
  evolutionApiUrl?: string;
  evolutionApiKey?: string;
  evolutionInstanceName?: string;
  whatsAppEnabled?: boolean;
  whatsAppDryRun?: boolean;
  whatsAppDelayMs?: number;

  // Remote Job Discovery Settings (Additive Only)
  remoteJobDiscoveryEnabled?: boolean;
  minRemoteJobRelevanceScore?: number;
  maxRemoteJobsPerSource?: number;
  autoApplyDefault?: boolean;
}

// ──────────────────────────────────────────────────────────
// Remote Jobs Module (Additive Only)
// ──────────────────────────────────────────────────────────

export type JobStatus =
  | "new"
  | "scored"
  | "saved"
  | "ready"
  | "applying"
  | "applied"
  | "rejected"
  | "expired"
  | "manual_action_required";

export type ApplicationStatus =
  | "ready"
  | "preparing"
  | "prepared"
  | "manual_action_required"
  | "applied"
  | "rejected"
  | "interviewing"
  | "offer"
  | "declined"
  | "archived";

export type JobRunType = "DISCOVERY" | "SCORING" | "PREPARATION";
export type JobRunStatus = "queued" | "running" | "completed" | "failed";

export interface RemoteJob {
  id: number;
  canonical_id: string;
  title: string;
  company_name: string;
  company_domain: string | null;
  description: string | null;
  requirements: string | null;
  skills: string | null;
  employment_type: string | null;
  experience_level: string | null;
  location: string | null;
  location_restrictions: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  relevance_score: number;
  match_reason: string | null;
  status: JobStatus;
  application_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface JobSource {
  id: number;
  job_id: number;
  source_url: string;
  source_type: string;
  title: string | null;
  evidence: string | null;
  created_at?: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  status: ApplicationStatus;
  applied_at: string | null;
  resume_version: string | null;
  cover_letter: string | null;
  screening_answers: string | null;
  recruiter_email: string | null;
  recruiter_phone: string | null;
  notes: string | null;
  // Joined from jobs table
  title?: string;
  company_name?: string;
  relevance_score?: number;
  job_status?: JobStatus;
  application_url?: string;
  job_created?: string;
}

export interface JobProfile {
  id: number;
  user_identifier: string;
  candidate_name: string | null;
  candidate_role: string | null;
  candidate_experience: string | null;
  candidate_email: string | null;
  candidate_phone: string | null;
  candidate_skills: string | null;
  resume_filename: string | null;
  resume_path: string | null;
  generated_cover_letter: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface JobRun {
  id: string;
  type: JobRunType;
  status: JobRunStatus;
  last_cursor: string | null;
  processed_count: number;
  success_count: number;
  error_message: string | null;
  started_at?: string;
  completed_at?: string | null;
  checkpoint_data?: string | null;
}

export interface RemoteJobSettings {
  remoteJobDiscoveryEnabled: boolean;
  minRemoteJobRelevanceScore: number;
  maxRemoteJobsPerSource: number;
  autoApplyDefault: boolean;
}

export interface RemoteJobsDashboardStats {
  totalJobs: number;
  newJobs: number;
  scoredJobs: number;
  readyJobs: number;
  appliedJobs: number;
  rejectedJobs: number;
  manualActionRequired: number;
  averageRelevanceScore: number;
  totalApplications: number;
  byStatus?: { status: string; count: number }[];
}
