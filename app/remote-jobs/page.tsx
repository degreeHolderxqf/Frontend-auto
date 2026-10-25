"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchRemoteJobsDashboardStats,
  fetchJobs,
} from "@/lib/api/remote-jobs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  Briefcase,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { RemoteJob, RemoteJobsDashboardStats } from "@/types";

export default function RemoteJobsDashboard() {
  const [stats, setStats] = useState<RemoteJobsDashboardStats | null>(null);
  const [topJobs, setTopJobs] = useState<RemoteJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const [statsData, jobs] = await Promise.all([
        fetchRemoteJobsDashboardStats(),
        fetchJobs({ minRelevance: 60 }),
      ]);
      setStats(statsData);
      setTopJobs(jobs.slice(0, 5));
    } catch (err: any) {
      toast.error("Error loading dashboard", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Loading Remote Jobs dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-sky-400" />
            Remote Jobs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover and apply to remote positions matching your Shopify + Full-Stack profile.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadDashboard}>
            <Activity className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button onClick={() => router.push("/remote-jobs/discover")}>
            <Sparkles className="w-4 h-4 mr-1.5" />
            Discover Jobs
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{stats.totalJobs}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Total Jobs</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{stats.readyJobs}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Ready</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{stats.appliedJobs}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Applied</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{stats.averageRelevanceScore}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Avg Score</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/remote-jobs/discover">
          <Card className="hover:border-sky-500/40 transition-colors cursor-pointer h-full">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-100">Discover</h3>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Fetch new jobs from Himalayas, Greenhouse, Lever, WWR, Wellfound, and Shopify Plus agencies.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/remote-jobs/ready">
          <Card className="hover:border-sky-500/40 transition-colors cursor-pointer h-full">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-100">Ready to Apply</h3>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {stats.readyJobs} qualified job{stats.readyJobs === 1 ? "" : "s"} ready for tailored application packages.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/remote-jobs/applications">
          <Card className="hover:border-sky-500/40 transition-colors cursor-pointer h-full">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-100">Pipeline</h3>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {stats.appliedJobs} applied, {stats.rejectedJobs} rejected. Track your progress.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Status Breakdown */}
      {stats.byStatus && stats.byStatus.length > 0 && (
        <Card title="Jobs by Status">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.byStatus.map(({ status, count }) => (
              <div
                key={status}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <div className="text-lg font-bold text-slate-100">{count}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">
                  {status.replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Manual Action Required Alert */}
      {stats.manualActionRequired > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-semibold text-slate-100">
                {stats.manualActionRequired} job{stats.manualActionRequired === 1 ? "" : "s"} require manual action
              </div>
              <p className="text-sm text-slate-400">
                These listings have CAPTCHA, MFA, or other automation blockers.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Top Scored Jobs */}
      {topJobs.length > 0 && (
        <Card title="Top Scored Jobs">
          <div className="space-y-2">
            {topJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100 truncate">{job.title}</div>
                  <div className="text-sm text-slate-400 truncate">
                    {job.company_name} · {job.location || "Remote"}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">
                      {job.relevance_score}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Score</div>
                  </div>
                  {job.application_url && (
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
