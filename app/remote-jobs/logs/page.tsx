"use client";

import React, { useEffect, useState } from "react";
import { getRecentRuns, resumeRun } from "@/lib/api/remote-jobs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Activity, Loader2, CheckCircle2, XCircle, Clock, RefreshCw, Play } from "lucide-react";
import { JobRun, JobRunStatus } from "@/types";

const STATUS_ICON: Record<JobRunStatus, React.ReactNode> = {
  queued: <Clock className="w-4 h-4 text-slate-400" />,
  running: <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
};

const STATUS_LABEL: Record<JobRunStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

export default function ExecutionLogsPage() {
  const [runs, setRuns] = useState<JobRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const toast = useToast();

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await getRecentRuns(20);
      setRuns(data);
    } catch (err: any) {
      toast.error("Error loading logs", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleResume = async (runId: string) => {
    try {
      setResumingId(runId);
      await resumeRun(runId);
      toast.success("Run resumed", `Run ${runId} has been restarted.`);
      load();
    } catch (err: any) {
      toast.error("Resume error", err.message);
    } finally {
      setResumingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-400" />
            Execution Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View and manage remote job discovery run history.
          </p>
        </div>
        <Button variant="secondary" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : runs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No job runs recorded yet. Start a discovery run to see logs here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => (
              <div
                key={run.id}
                className="p-4 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {STATUS_ICON[run.status as JobRunStatus]}
                    <div>
                      <div className="font-medium text-slate-100 text-sm">
                        {run.type} Run
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {run.id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-200">
                        {run.processed_count} processed
                      </div>
                      <div className="text-xs text-emerald-400">
                        {run.success_count} success
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        run.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : run.status === "failed"
                          ? "bg-red-500/10 text-red-300 border border-red-500/20"
                          : run.status === "running"
                          ? "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                          : "bg-slate-700 text-slate-400 border border-slate-600"
                      }`}
                    >
                      {STATUS_LABEL[run.status as JobRunStatus] || run.status}
                    </span>

                    {run.status === "failed" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResume(run.id)}
                        disabled={resumingId === run.id}
                      >
                        {resumingId === run.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        <span className="ml-1">Resume</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  Started: {run.started_at ? new Date(run.started_at).toLocaleString() : "—"}
                  {run.completed_at && (
                    <> &middot; Completed: {new Date(run.completed_at).toLocaleString()}</>
                  )}
                </div>

                {run.error_message && (
                  <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                    {run.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
