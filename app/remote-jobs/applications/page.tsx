"use client";

import React, { useEffect, useState } from "react";
import { fetchApplications } from "@/lib/api/remote-jobs";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { Users, Briefcase } from "lucide-react";
import { JobApplication, ApplicationStatus } from "@/types";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  ready: "bg-slate-700 text-slate-300",
  preparing: "bg-amber-700/30 text-amber-300",
  prepared: "bg-amber-600/30 text-amber-200",
  manual_action_required: "bg-red-700/30 text-red-300",
  applied: "bg-emerald-700/30 text-emerald-300",
  rejected: "bg-red-700/30 text-red-300",
  interviewing: "bg-sky-700/30 text-sky-300",
  offer: "bg-purple-700/30 text-purple-300",
  declined: "bg-slate-700/30 text-slate-400",
  archived: "bg-slate-800 text-slate-500",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  ready: "Ready",
  preparing: "Preparing",
  prepared: "Prepared",
  manual_action_required: "Manual Action",
  applied: "Applied",
  rejected: "Rejected",
  interviewing: "Interviewing",
  offer: "Offer",
  declined: "Declined",
  archived: "Archived",
};

export default function ApplicationsPipelinePage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const toast = useToast();

  const load = async () => {
    try {
      setIsLoading(true);
      const filters = statusFilter !== "ALL" ? { status: statusFilter as ApplicationStatus } : undefined;
      const data = await fetchApplications(filters);
      setApplications(data);
    } catch (err: any) {
      toast.error("Error loading applications", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const filteredApps = applications;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-400" />
            Applications Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your job applications from applied to offer.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-slate-400">Filter:</span>
          {["ALL", ...Object.keys(STATUS_LABELS)].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s === "ALL" ? "All" : STATUS_LABELS[s as ApplicationStatus] || s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No applications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100 text-sm truncate">
                    {app.title || `Job #${app.job_id}`}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {app.company_name || "Unknown company"} · Applied{" "}
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "—"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {app.relevance_score !== undefined && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">
                        {app.relevance_score}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">Score</div>
                    </div>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLORS[app.status as ApplicationStatus] || "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {STATUS_LABELS[app.status as ApplicationStatus] || app.status}
                  </span>
                  {app.application_url && (
                    <a
                      href={app.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
