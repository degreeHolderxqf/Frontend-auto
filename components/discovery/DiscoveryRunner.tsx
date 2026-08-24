"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { triggerDiscovery, triggerLeadWorkflow } from "@/lib/api/actions";
import { useToast } from "@/components/ui/Toast";
import { Compass, Sparkles, Database, CheckCircle2 } from "lucide-react";

export function DiscoveryRunner({ onCompleted }: { onCompleted?: () => void }) {
  const [candidatesTarget, setCandidatesTarget] = useState(150);
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);
  const [isRunningFullEngine, setIsRunningFullEngine] = useState(false);
  const toast = useToast();

  const handleRunDiscovery = async () => {
    try {
      setIsRunningDiscovery(true);
      toast.info("Scraping Shopify Directory", `Fetching ~${candidatesTarget} candidates with pagination...`);
      const res = await triggerDiscovery(candidatesTarget);
      toast.success("Discovery Complete", `Collected ${res.result?.saved || 0} new candidate partners.`);
      if (onCompleted) onCompleted();
    } catch (err: any) {
      toast.error("Discovery Error", err.message || "Failed to execute directory discovery.");
    } finally {
      setIsRunningDiscovery(false);
    }
  };

  const handleRunFullEngine = async () => {
    try {
      setIsRunningFullEngine(true);
      toast.info("Starting Full 100-Lead Pipeline", "Crawling partner directory, filtering exclusions, and extracting verified contacts...");
      const res = await triggerLeadWorkflow(100);
      toast.success("Lead Generation Finished", res.message || "Pipeline execution completed.");
      if (onCompleted) onCompleted();
    } catch (err: any) {
      toast.error("Pipeline Error", err.message || "Failed to execute pipeline.");
    } finally {
      setIsRunningFullEngine(false);
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-none mb-4">
        <div>
          <CardTitle>Shopify Partner Directory Discovery Controls</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Crawl the official Shopify Partner Directory India location, scrape cards, extract external URLs, and filter 75+ previously contacted companies.
          </p>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Directory Crawler */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            1. Raw Partner Discovery
          </div>
          <p className="text-xs text-slate-300">
            Paginates through <code>shopify.com/in/partners/directory/locations/india</code> and extracts partner profiles, tiers, and domains.
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Target Candidates:</label>
            <select
              value={candidatesTarget}
              onChange={(e) => setCandidatesTarget(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value={50}>50 Candidates (~3 Pages)</option>
              <option value={100}>100 Candidates (~7 Pages)</option>
              <option value={150}>150 Candidates (~10 Pages)</option>
              <option value={200}>200 Candidates (~13 Pages)</option>
            </select>
          </div>

          <Button
            variant="secondary"
            onClick={handleRunDiscovery}
            isLoading={isRunningDiscovery}
            className="w-full"
          >
            <Database className="w-3.5 h-3.5 mr-1" />
            Run Discovery Crawler
          </Button>
        </div>

        {/* Step 2: Full Auto Pipeline */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              2. End-to-End 100-Lead Engine
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Discovers partners, filters blacklist, crawls company websites and <code>/careers</code> for public contacts, validates MX records, calculates <strong>App Relevance</strong> and <strong>Lead Score</strong>, and exports CSV/XLSX.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleRunFullEngine}
            isLoading={isRunningFullEngine}
            className="w-full"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Execute Full 100-Lead Pipeline
          </Button>
        </div>
      </div>
    </Card>
  );
}
