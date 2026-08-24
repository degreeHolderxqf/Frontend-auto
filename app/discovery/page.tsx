"use client";

import React, { useEffect, useState } from "react";
import { DiscoveryRunner } from "@/components/discovery/DiscoveryRunner";
import { fetchStats } from "@/lib/api/stats";
import { CampaignStats } from "@/types";
import { PipelineStatus } from "@/components/dashboard/PipelineStatus";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DiscoveryPage() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await fetchStats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Partner Discovery Engine</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated crawler for official Shopify Partner Directory (India) with pagination & rate limiting.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadStats} isLoading={isLoading}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Refresh Stats
        </Button>
      </div>

      {/* Discovery Controls Component */}
      <DiscoveryRunner onCompleted={loadStats} />

      {/* Pipeline Status */}
      <PipelineStatus stats={stats} />

      {/* Discovery Specifications Card */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 border-none mb-4">
          <CardTitle>Discovery Engine Architecture & Safeguards</CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-sky-400 block">1. Directory Pagination</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Fetches 16 cards per page from <code>/in/partners/directory/locations/india</code>, extracts company name, partner tier, rating, and official profile URLs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 block">2. Strict Exclusions Check</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every discovered company is normalized and checked against 75+ previously researched agencies and past employers before saving.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-indigo-400 block">3. Multi-Subpage Crawler</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Discovers official company websites, crawls <code>/careers</code>, <code>/jobs</code>, <code>/contact</code>, extracts real mailto emails, and verifies DNS MX records.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
