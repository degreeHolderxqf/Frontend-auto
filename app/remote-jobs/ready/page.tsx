"use client";

import React, { useEffect, useState } from "react";
import { fetchJobs, upsertApplication, fetchRemoteJobSettings } from "@/lib/api/remote-jobs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { CheckCircle2, ExternalLink, Briefcase, FileText, ClipboardCheck, Send, X } from "lucide-react";
import { RemoteJob } from "@/types";

export default function ReadyToApplyPage() {
  const [jobs, setJobs] = useState<RemoteJob[]>([]);
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
        const [jobsData, settingsData] = await Promise.all([
          fetchJobs({ status: "ready" }),
          fetchRemoteJobSettings(),
        ]);
        setJobs(jobsData);
        setAutoApplyDefault(settingsData.autoApplyDefault || false);
      } catch (err: any) {
        toast.error("Error loading ready jobs", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast]);

  // ── Apply Flow ──────────────────────────────────────────────

  const handleApply = async (job: RemoteJob) => {
    setApplyingJob(job);
    setIsApplying(true);
    try {
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
      // Refresh the ready list
      const data = await fetchJobs({ status: "ready" });
      setJobs(data);
    } catch (err: any) {
      toast.error("Failed to save application", err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          Ready to Apply
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Jobs with application packages prepared — tailored resume, cover letter, and screening answers.
        </p>
      </div>

      <Card>
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No jobs ready for application yet.</p>
            <p className="text-sm mt-1">
              Jobs scoring 60+ will appear here after discovery.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
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
                    <div className="text-sm font-bold text-emerald-400">{job.relevance_score}</div>
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
