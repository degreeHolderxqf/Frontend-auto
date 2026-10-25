"use client";

import React, { useEffect, useRef, useState } from "react";
import { fetchStats } from "@/lib/api/stats";
import { fetchDashboardMetricRecords, fetchLeads } from "@/lib/api/leads";
import { CampaignStats, DashboardMetricKey, DashboardMetricRecord, Lead } from "@/types";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { PipelineStatus } from "@/components/dashboard/PipelineStatus";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WhatsAppWidget } from "@/components/dashboard/WhatsAppWidget";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { EmailPreviewModal } from "@/components/email/EmailPreviewModal";
import { WhatsAppPreviewModal } from "@/components/leads/WhatsAppPreviewModal";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, RefreshCw, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [topLeads, setTopLeads] = useState<Lead[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<DashboardMetricKey | null>(null);
  const [metricRecords, setMetricRecords] = useState<DashboardMetricRecord[]>([]);
  const [isMetricLoading, setIsMetricLoading] = useState(false);
  const [metricError, setMetricError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const [previewWhatsAppLead, setPreviewWhatsAppLead] = useState<Lead | null>(null);
  const metricRequestId = useRef(0);
  const toast = useToast();

  const metricTitles: Record<DashboardMetricKey, string> = {
    discovered: "Total Discovered",
    merchantContacts: "Merchant Stores With Contacts",
    employeeVerified: "Employee Size Verified",
    emailContacts: "Email Contact Records",
    readyToSend: "Ready for Outreach",
    emailsSent: "Emails Sent",
    excludedTooLow: "Excluded / Too Low",
  };

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

  const loadMetricRecords = async (metric: DashboardMetricKey, requestId: number) => {
    setIsMetricLoading(true);
    setMetricError(null);
    try {
      const records = await fetchDashboardMetricRecords(metric);
      if (requestId === metricRequestId.current) setMetricRecords(records);
    } catch (err: any) {
      if (requestId === metricRequestId.current) {
        const message = err.message || "Failed to load matching records.";
        setMetricError(message);
        toast.error("Could not load metric records", message);
      }
    } finally {
      if (requestId === metricRequestId.current) setIsMetricLoading(false);
    }
  };

  const handleSelectMetric = (metric: DashboardMetricKey) => {
    const requestId = ++metricRequestId.current;
    if (selectedMetric === metric) {
      setSelectedMetric(null);
      setMetricRecords([]);
      setMetricError(null);
      setIsMetricLoading(false);
      return;
    }

    setSelectedMetric(metric);
    setMetricRecords([]);
    setMetricError(null);
    void loadMetricRecords(metric, requestId);
  };

  const closeMetricRecords = () => {
    metricRequestId.current += 1;
    setSelectedMetric(null);
    setMetricRecords([]);
    setMetricError(null);
    setIsMetricLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Campaign Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated Indian Shopify Partner discovery, evidence-based contact research, and job outreach via Email &amp; WhatsApp.
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
      <StatGrid
        stats={stats}
        isLoading={isLoading}
        selectedMetric={selectedMetric}
        onSelectMetric={handleSelectMetric}
      />

      {selectedMetric && (
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-5 border-b border-slate-800">
            <div>
              <CardTitle>{metricTitles[selectedMetric]}</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                {isMetricLoading ? "Loading records…" : metricError ? "Could not load records" : `${metricRecords.length} matching record(s)`}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={closeMetricRecords} aria-label="Close metric records">
              <X className="w-4 h-4" />
            </Button>
          </div>
          {isMetricLoading ? (
            <div className="p-10 text-center text-sm text-slate-400">Loading matching records…</div>
          ) : metricError ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-rose-300">Could not load these records</p>
              <p className="text-xs text-slate-400 mt-2">{metricError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  const requestId = ++metricRequestId.current;
                  void loadMetricRecords(selectedMetric, requestId);
                }}
              >
                Retry
              </Button>
            </div>
          ) : metricRecords.length > 0 ? (
            <LeadsTable
              leads={metricRecords}
              onSelectLead={(lead) => setSelectedLead(lead)}
            />
          ) : (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-slate-200">No records for this metric</p>
              <p className="text-xs text-slate-500 mt-1">The current database has no matching entries.</p>
            </div>
          )}
        </Card>
      )}

      {/* WhatsApp Connection Widget + Quick Action Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WhatsAppWidget />
        <QuickActions onRefresh={loadData} />
      </div>

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
          onPreviewWhatsApp={(lead) => setPreviewWhatsAppLead(lead)}
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

      {/* WhatsApp Preview Modal */}
      <WhatsAppPreviewModal
        lead={previewWhatsAppLead}
        isOpen={previewWhatsAppLead !== null}
        onClose={() => setPreviewWhatsAppLead(null)}
        onSuccess={loadData}
      />
    </div>
  );
}
