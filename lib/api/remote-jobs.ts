/**
 * Remote Jobs API Client
 * Additive-only module for remote job discovery, scoring, and application tracking.
 * Does not modify or interact with existing lead/email/WhatsApp systems.
 */

import { apiClient } from "./client";
import type {
  RemoteJob,
  JobApplication,
  JobRun,
  RemoteJobSettings,
  RemoteJobsDashboardStats,
  JobStatus,
  ApplicationStatus,
  JobRunType,
} from "@/types";

// ── Jobs ────────────────────────────────────────────────────────────────────

/**
 * Fetch jobs with optional filters
 */
export async function fetchJobs(filters?: {
  status?: JobStatus;
  minRelevance?: number;
  employmentType?: string;
  location?: string;
}): Promise<RemoteJob[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.minRelevance) params.set("minRelevance", String(filters.minRelevance));
  if (filters?.employmentType) params.set("employmentType", filters.employmentType);
  if (filters?.location) params.set("location", filters.location);

  const query = params.toString();
  const endpoint = `/api/remote-jobs/jobs${query ? `?${query}` : ""}`;

  const data = await apiClient<{ success: boolean; count: number; jobs: RemoteJob[] }>(endpoint);
  return data.jobs || [];
}

/**
 * Bulk upsert jobs (used by discovery workflow)
 */
export async function upsertJobs(jobs: Partial<RemoteJob>[]): Promise<{
  inserted: number;
  updated: number;
}> {
  const data = await apiClient<{ success: boolean; results: { inserted: number; updated: number } }>(
    "/api/remote-jobs/jobs",
    { method: "POST", body: JSON.stringify({ jobs }) }
  );
  return data.results;
}

// ── Job Scoring ──────────────────────────────────────────────────────────────

/**
 * Score jobs by relevance (Shopify Core + Modern Stack + India-compatible)
 */
export async function scoreJobs(jobIds: number[]): Promise<{
  scored: number;
  skipped: number;
}> {
  const data = await apiClient<{ success: boolean; scored: number; skipped: number }>(
    "/api/remote-jobs/score",
    { method: "POST", body: JSON.stringify({ jobIds }) }
  );
  return { scored: data.scored, skipped: data.skipped };
}

// ── Job Runs (Discovery Workflow) ───────────────────────────────────────────

/**
 * Start a new discovery run
 */
export async function startDiscoveryRun(source?: string, candidates?: number): Promise<string> {
  const data = await apiClient<{ success: boolean; runId: string }>(
    "/api/remote-jobs/discover/start",
    {
      method: "POST",
      body: JSON.stringify({ source: source || "himalayas", candidates: candidates || 100 }),
    }
  );
  return data.runId;
}

/**
 * Process next chunk of a discovery run (checkpoint-based)
 */
export async function processNextChunk(
  runId: string,
  chunkSize?: number
): Promise<{
  completed: boolean;
  processed: number;
  successCount: number;
  hasMore: boolean;
  cursor?: number;
}> {
  const data = await apiClient<{
    success: boolean;
    completed: boolean;
    processed: number;
    successCount: number;
    hasMore: boolean;
    cursor?: number;
  }>("/api/remote-jobs/discover/next", {
    method: "POST",
    body: JSON.stringify({ runId, chunkSize: chunkSize || 25 }),
  });
  return {
    completed: data.completed,
    processed: data.processed,
    successCount: data.successCount,
    hasMore: data.hasMore,
    cursor: data.cursor,
  };
}

/**
 * Get run status by ID
 */
export async function getRunStatus(runId: string): Promise<JobRun> {
  const data = await apiClient<{ success: boolean; run: JobRun }>(
    `/api/remote-jobs/job-runs/${encodeURIComponent(runId)}`
  );
  return data.run;
}

/**
 * Get recent job runs
 */
export async function getRecentRuns(limit?: number): Promise<JobRun[]> {
  const endpoint = limit
    ? `/api/remote-jobs/job-runs?limit=${limit}`
    : "/api/remote-jobs/job-runs";
  const data = await apiClient<{ success: boolean; runs: JobRun[] }>(endpoint);
  return data.runs || [];
}

/**
 * Resume a failed or paused run
 */
export async function resumeRun(runId: string): Promise<JobRun> {
  const data = await apiClient<{ success: boolean; run: JobRun }>(
    `/api/remote-jobs/job-runs/${encodeURIComponent(runId)}/resume`,
    { method: "POST" }
  );
  return data.run;
}

// ── Applications ────────────────────────────────────────────────────────────

/**
 * Fetch applications with optional filters
 */
export async function fetchApplications(filters?: {
  status?: ApplicationStatus;
  jobId?: number;
}): Promise<JobApplication[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.jobId) params.set("jobId", String(filters.jobId));

  const query = params.toString();
  const endpoint = `/api/remote-jobs/applications${query ? `?${query}` : ""}`;

  const data = await apiClient<{ success: boolean; applications: JobApplication[] }>(endpoint);
  return data.applications || [];
}

/**
 * Create or update an application
 */
export async function upsertApplication(data: {
  job_id: number;
  status?: ApplicationStatus;
  applied_at?: string;
  resume_version?: string;
  cover_letter?: string;
  screening_answers?: string;
  recruiter_email?: string;
  recruiter_phone?: string;
  notes?: string;
}): Promise<{ id: number; updated: boolean }> {
  const result = await apiClient<{ success: boolean; id: number; updated: boolean }>(
    "/api/remote-jobs/applications",
    { method: "POST", body: JSON.stringify(data) }
  );
  return { id: result.id, updated: result.updated };
}

/**
 * Mark an application as applied
 */
export async function markApplied(
  applicationId: number,
  resumeVersion?: string
): Promise<void> {
  const app = await fetchApplications({ jobId: applicationId }).then((apps) => apps[0]);
  if (!app) throw new Error(`Application not found: ${applicationId}`);
  await upsertApplication({
    job_id: applicationId,
    status: "applied",
    applied_at: new Date().toISOString(),
    resume_version: resumeVersion,
  });
}

// ── Settings ────────────────────────────────────────────────────────────────

/**
 * Fetch remote job settings
 */
export async function fetchRemoteJobSettings(): Promise<RemoteJobSettings> {
  const data = await apiClient<{ success: boolean; settings: RemoteJobSettings }>(
    "/api/remote-jobs/settings"
  );
  return data.settings;
}

/**
 * Update remote job settings
 */
export async function updateRemoteJobSettings(
  settings: Partial<RemoteJobSettings>
): Promise<RemoteJobSettings> {
  const data = await apiClient<{ success: boolean; settings: RemoteJobSettings }>(
    "/api/remote-jobs/settings",
    { method: "POST", body: JSON.stringify(settings) }
  );
  return data.settings;
}

// ── Dashboard Stats ────────────────────────────────────────────────────────

/**
 * Get remote jobs dashboard statistics
 */
export async function fetchRemoteJobsDashboardStats(): Promise<RemoteJobsDashboardStats> {
  // Fetch jobs and applications in parallel
  const [jobs, applications] = await Promise.all([
    fetchJobs(),
    fetchApplications(),
  ]);

  const byStatus: Record<string, number> = {};
  for (const job of jobs) {
    byStatus[job.status] = (byStatus[job.status] || 0) + 1;
  }

  const relevanceScores = jobs
    .map((j) => j.relevance_score)
    .filter((s) => s > 0);
  const averageRelevanceScore =
    relevanceScores.length > 0
      ? Math.round(relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length)
      : 0;

  return {
    totalJobs: jobs.length,
    newJobs: byStatus["new"] || 0,
    scoredJobs: byStatus["scored"] || 0,
    readyJobs: byStatus["ready"] || 0,
    appliedJobs: applications.filter((a) => a.status === "applied").length,
    rejectedJobs: applications.filter((a) => a.status === "rejected").length,
    manualActionRequired: byStatus["manual_action_required"] || 0,
    averageRelevanceScore,
    totalApplications: applications.length,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
  };
}
