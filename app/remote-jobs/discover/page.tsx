"use client";

import React, { useEffect, useState } from "react";
import {
  fetchJobs,
  startDiscoveryRun,
  processNextChunk,
  getRecentRuns,
  upsertApplication,
  fetchRemoteJobSettings,
} from "@/lib/api/remote-jobs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  Briefcase,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  ExternalLink,
  FileText,
  ClipboardCheck,
  Send,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { RemoteJob, JobRun } from "@/types";

const SOURCES = [
  { id: "himalayas", label: "Himalayas", desc: "Public job API with pagination" },
  { id: "greenhouse", label: "Greenhouse", desc: "ATS job board feeds" },
  { id: "lever", label: "Lever", desc: "ATS job board feeds" },
  { id: "wwr", label: "We Work Remotely", desc: "RSS feed for programming jobs" },
  { id: "wellfound", label: "Wellfound", desc: "Startup jobs with remote filter" },
  { id: "shopify_plus", label: "Shopify Plus Agencies", desc: "Agency career pages" },
];

export default function RemoteJobsDiscover() {
  const [jobs, setJobs] = useState<RemoteJob[]>([]);
  const [runs, setRuns] = useState<JobRun[]>([]);
  const [selectedSource, setSelectedSource] = useState("himalayas");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isProcessingChunk, setIsProcessingChunk] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState<RemoteJob | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});
  const [resumeVersion, setResumeVersion] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [autoApplyDefault, setAutoApplyDefault] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [jobsData, runsData, settingsData] = await Promise.all([
          fetchJobs(),
          getRecentRuns(5),
          fetchRemoteJobSettings(),
        ]);
        setJobs(jobsData);
        setRuns(runsData);
        setAutoApplyDefault(settingsData.autoApplyDefault || false);
      } catch (err: any) {
        toast.error("Error loading data", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast]);

  const handleStartDiscovery = async () => {
    let runId: string | null = null;
    try {
      setIsDiscovering(true);
      runId = await startDiscoveryRun(selectedSource, 100);
      setCurrentRunId(runId);
      toast.success("Discovery started", `Run ID: ${runId}. Processing chunks...`);

      // Start polling for chunks
      const CHUNK_SIZE = 25;
      const MAX_CHUNKS = 10;

      for (let i = 0; i < MAX_CHUNKS; i++) {
        const result = await processNextChunk(runId, CHUNK_SIZE);

        if (result.completed) {
          toast.success("Discovery complete", `Processed ${result.processed} jobs.`);
          break;
        }
      }

      setIsDiscovering(false);
      setIsProcessingChunk(false);
      setCurrentRunId(null);
      loadData();
    } catch (err: any) {
      toast.error("Discovery error", err.message);
      setIsDiscovering(false);
      setIsProcessingChunk(false);
      setCurrentRunId(null);
    }
  };

  const loadData = async () => {
    try {
      const [jobsData, runsData] = await Promise.all([
        fetchJobs(),
        getRecentRuns(5),
      ]);
      setJobs(jobsData);
      setRuns(runsData);
    } catch (err: any) {
      toast.error("Error loading data", err.message);
    }
  };

  // ── Apply Flow ──────────────────────────────────────────────────────

  const handleApply = async (job: RemoteJob) => {
    setApplyingJob(job);
    setIsApplying(true);
    try {
      // Generate application assets via the backend API
      const res = await fetch("/api/remote-jobs/applications/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.id }),
      });
      if (!res.ok) throw new Error("Failed to generate application assets");
      const data = await res.json();
      setCoverLetter(data.coverLetter || "");
      setScreeningAnswers(data.screeningAnswers || {});
      setResumeVersion(data.recommendedResumeVersion || "");
      setShowApplyModal(true);
    } catch (err: any) {
      toast.error("Asset generation failed", err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleConfirmApply = async () => {
    if (!applyingJob) return;
    try {
      await upsertApplication({
        job_id: applyingJob.id,
        status: autoApplyDefault ? "applied" : "prepared",
        cover_letter: coverLetter || undefined,
        screening_answers: Object.keys(screeningAnswers).length > 0 ? JSON.stringify(screeningAnswers) : undefined,
        resume_version: resumeVersion || undefined,
        applied_at: autoApplyDefault ? new Date().toISOString() : undefined,
      });
      toast.success("Application prepared", `Application for ${applyingJob.title} at ${applyingJob.company_name} saved.`);
      setShowApplyModal(false);
      setApplyingJob(null);
      setCoverLetter("");
      setScreeningAnswers({});
      setResumeVersion("");
      loadData();
    } catch (err: any) {
      toast.error("Failed to save application", err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sky-400" />
            Discover Jobs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Fetch and score remote job listings from multiple sources.
          </p>
        </div>
      </div>

      <Card>
        <h2 className="font-semibold text-slate-100 mb-4">Select Source</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {SOURCES.map((source) => (
            <button
              key={source.id}
              onClick={() => setSelectedSource(source.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedSource === source.id
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-300"
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="font-medium text-sm">{source.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{source.desc}</div>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleStartDiscovery} disabled={isDiscovering}>
            {isDiscovering ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Discovering...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1.5" />
                Start Discovery
              </>
            )}
          </Button>
          {isProcessingChunk && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing chunk...
            </div>
          )}
        </div>
      </Card>

      {runs.length > 0 && (
        <Card title="Recent Discovery Runs">
          <div className="space-y-2">
            {runs.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  {run.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : run.status === "failed" ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                  )}
                  <div>
                    <div className="font-medium text-slate-100 text-sm">
                      {run.type} · {run.status}
                    </div>
                    <div className="text-xs text-slate-400">
                      {run.processed_count} processed · {run.success_count} success
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {run.started_at ? new Date(run.started_at).toLocaleString() : "—"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title={`Discovered Jobs (${jobs.length})`}>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No jobs discovered yet. Start a discovery run above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.slice(0, 20).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100 text-sm truncate">{job.title}</div>
                  <div className="text-xs text-slate-400 truncate">
                    {job.company_name} · {job.location || "Remote"} · {job.employment_type}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Score: {job.relevance_score} · Status: {job.status}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        job.relevance_score >= 80
                          ? "text-emerald-400"
                          : job.relevance_score >= 60
                          ? "text-sky-400"
                          : "text-slate-400"
                      }`}
                    >
                      {job.relevance_score}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Score</div>
                  </div>
                  <button
                    onClick={() => handleApply(job)}
                    disabled={isApplying}
                    className="p-1.5 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                    title="Apply — generate cover letter & screening answers"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  {job.application_url && (
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Apply Modal ──────────────────────────────────────────────── */}
      {showApplyModal && applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-sky-400" />
                Application Preview — {applyingJob.title}
              </h2>
              <button
                onClick={() => { setShowApplyModal(false); setApplyingJob(null); setCoverLetter(""); setScreeningAnswers({}); }}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-slate-400">
              <span className="font-medium text-slate-300">{applyingJob.company_name}</span>
              {" · "}{applyingJob.location || "Remote"}
              {resumeVersion && (
                <span className="ml-2 px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-xs">
                  Resume: {resumeVersion}
                </span>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                Tailored Cover Letter
              </h3>
              <pre className="text-xs text-slate-300 bg-slate-950/80 border border-slate-800 rounded-lg p-3 whitespace-pre-wrap max-h-48 overflow-y-auto font-sans">
                {coverLetter || "Generating..."}
              </pre>
            </div>

            {/* Screening Answers */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-slate-500" />
                Screening Answers
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(screeningAnswers).map(([key, answer]) => (
                  <div key={key} className="text-xs bg-slate-950/80 border border-slate-800 rounded-lg p-2">
                    <div className="font-medium text-slate-400 mb-0.5">{key.replace(/_/g, " ")}</div>
                    <div className="text-slate-300">{answer}</div>
                  </div>
                ))}
                {Object.keys(screeningAnswers).length === 0 && (
                  <div className="text-xs text-slate-500">Generating answers...</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <Button onClick={handleConfirmApply} disabled={isApplying}>
                <Send className="w-4 h-4 mr-1.5" />
                {autoApplyDefault ? "Confirm & Submit" : "Confirm (Manual Review)"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setShowApplyModal(false); setApplyingJob(null); setCoverLetter(""); setScreeningAnswers({}); }}
              >
                Cancel
              </Button>
              <span className="text-xs text-slate-500 ml-auto">
                {autoApplyDefault ? "Auto-submit enabled" : "Human-in-the-loop: you submit manually"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
