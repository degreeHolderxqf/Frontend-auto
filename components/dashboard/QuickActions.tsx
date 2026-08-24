"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Compass, Sparkles, Send, Download, FileSpreadsheet } from "lucide-react";
import { triggerLeadWorkflow } from "@/lib/api/actions";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { getDownloadUrl } from "@/lib/api/leads";

export function QuickActions({ onRefresh }: { onRefresh?: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const toast = useToast();

  const handleRunLeadEngine = async () => {
    try {
      setIsRunning(true);
      toast.info("Starting Lead Engine", "Running Shopify Partner Discovery, filtration, and research...");
      const res = await triggerLeadWorkflow(100);
      toast.success("Lead Engine Finished", res.message || "Processed qualified leads successfully.");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error("Lead Engine Error", err.message || "Failed to trigger pipeline.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-none mb-4">
        <div>
          <CardTitle>Fast Actions</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Trigger automated workflows or jump to outreach and export controls.
          </p>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="primary"
          onClick={handleRunLeadEngine}
          isLoading={isRunning}
          className="w-full justify-start h-12"
        >
          <Sparkles className="w-4 h-4" />
          <div className="text-left leading-tight">
            <p className="text-xs font-bold">Run 100-Lead Engine</p>
            <p className="text-[10px] opacity-80">Full Auto Pipeline</p>
          </div>
        </Button>

        <Link href="/outreach" className="w-full">
          <Button variant="secondary" className="w-full justify-start h-12">
            <Send className="w-4 h-4 text-emerald-400" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold">Send Outreach</p>
              <p className="text-[10px] text-slate-400">Preview & Batch Send</p>
            </div>
          </Button>
        </Link>

        <Link href="/discovery" className="w-full">
          <Button variant="secondary" className="w-full justify-start h-12">
            <Compass className="w-4 h-4 text-sky-400" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold">Discovery Crawler</p>
              <p className="text-[10px] text-slate-400">Scrape Directory</p>
            </div>
          </Button>
        </Link>

        <a href={getDownloadUrl("xlsx")} className="w-full" download>
          <Button variant="secondary" className="w-full justify-start h-12">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold">Download Excel</p>
              <p className="text-[10px] text-slate-400">Full 26 Columns</p>
            </div>
          </Button>
        </a>
      </div>
    </Card>
  );
}
