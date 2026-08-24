"use client";

import React, { useEffect, useState } from "react";
import { fetchStats } from "@/lib/api/stats";
import { fetchLeads } from "@/lib/api/leads";
import { CampaignStats, Lead } from "@/types";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { PipelineStatus } from "@/components/dashboard/PipelineStatus";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { EmailPreviewModal } from "@/components/email/EmailPreviewModal";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [topLeads, setTopLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, leadsData] = await Promise.all([
        fetchStats(),
        fetchLeads({ limit: 8 }),
      ]);
      setStats(statsData);
      setTopLeads(leadsData);
    } catch (err: any) {
      toast.error("Connection Error", err.message || "Failed to load dashboard data from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Campaign Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated Indian Shopify Partner discovery, evidence-based contact research, and job outreach.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
          <Link href="/outreach">
            <Button variant="primary" size="sm">
              Launch Outreach
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <StatGrid stats={stats} isLoading={isLoading} />

      {/* Quick Action Triggers */}
      <QuickActions onRefresh={loadData} />

      {/* Pipeline Status */}
      <PipelineStatus stats={stats} />

      {/* Top Qualified Leads Snapshot */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 border-none mb-4 flex items-center justify-between">
          <div>
            <CardTitle>Top Scored Leads</CardTitle>
            <p className="text-xs text-slate-400 mt-1">
              Top Shopify Partners matching Liquid, Remix, GraphQL, and Custom Apps development.
            </p>
          </div>
          <Link href="/leads">
            <Button variant="ghost" size="sm" className="text-xs text-sky-400">
              View All ({stats?.readyToSend || 0} Ready)
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        <LeadsTable
          leads={topLeads}
          onSelectLead={(lead) => setSelectedLead(lead)}
          onPreviewEmail={(lead) => setPreviewLead(lead)}
        />
      </Card>

      {/* Detail Drawer */}
      <LeadDrawer
        leadId={selectedLead?.id ?? null}
        onClose={() => setSelectedLead(null)}
        onPreviewEmail={(lead) => setPreviewLead(lead)}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        lead={previewLead}
        isOpen={previewLead !== null}
        onClose={() => setPreviewLead(null)}
        onSuccess={loadData}
      />
    </div>
  );
}
