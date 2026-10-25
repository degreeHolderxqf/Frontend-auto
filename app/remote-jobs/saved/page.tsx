"use client";

import React, { useEffect, useState } from "react";
import { fetchJobs } from "@/lib/api/remote-jobs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Bookmark, ExternalLink, Briefcase } from "lucide-react";
import { RemoteJob } from "@/types";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<RemoteJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        // "Saved" status represents bookmarked jobs
        const data = await fetchJobs({ status: "saved" });
        setJobs(data);
      } catch (err: any) {
        toast.error("Error loading saved jobs", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-sky-400" />
          Saved Jobs
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Bookmarked jobs you want to come back to.
        </p>
      </div>

      <Card>
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No saved jobs yet. Bookmark jobs from the Discover page to see them here.</p>
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
                    {job.company_name} · {job.location || "Remote"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">
                      {job.relevance_score}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Score</div>
                  </div>
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
    </div>
  );
}
