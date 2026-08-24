"use client";

import React, { useEffect, useState } from "react";
import { fetchLeads } from "@/lib/api/leads";
import { fetchEmailHistory } from "@/lib/api/email";
import { fetchStats } from "@/lib/api/stats";
import { Lead, EmailLog, CampaignStats } from "@/types";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { EmailPreviewModal } from "@/components/email/EmailPreviewModal";
import { BatchSenderModal } from "@/components/email/BatchSenderModal";
import { EmailHistoryTable } from "@/components/email/EmailHistoryTable";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Send, Clock, RefreshCw, MailCheck, ShieldCheck } from "lucide-react";

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");
  const [readyLeads, setReadyLeads] = useState<Lead[]>([]);
  const [historyLogs, setHistoryLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [leadsData, historyData, statsData] = await Promise.all([
        fetchLeads({ status: "READY", limit: "all" }),
        fetchEmailHistory(),
        fetchStats(),
      ]);
      setReadyLeads(leadsData);
      setHistoryLogs(historyData);
      setStats(statsData);
    } catch (err: any) {
      toast.error("Error loading outreach", err.message || "Failed to fetch outreach data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Email Outreach Center</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalized cold job applications dispatched to verified HR and recruitment contacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsBatchModalOpen(true)}
            disabled={readyLeads.length === 0}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Launch Batch Outreach ({readyLeads.length})
          </Button>

          <Button variant="outline" size="sm" onClick={loadData} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Ready in Queue</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{stats?.readyToSend ?? 0}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Emails Dispatched</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{stats?.sent ?? 0}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Verified Contacts</p>
            <p className="text-2xl font-bold text-sky-400 mt-0.5">{stats?.totalContacts ?? 0}</p>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "queue"
              ? "bg-slate-900 text-sky-400 border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Ready Queue ({readyLeads.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "history"
              ? "bg-slate-900 text-sky-400 border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MailCheck className="w-3.5 h-3.5" />
          Send History ({historyLogs.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "queue" ? (
        <Card className="p-0 border-none bg-transparent">
          <LeadsTable
            leads={readyLeads}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onPreviewEmail={(lead) => setPreviewLead(lead)}
          />
        </Card>
      ) : (
        <EmailHistoryTable logs={historyLogs} />
      )}

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

      {/* Batch Send Modal */}
      <BatchSenderModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        totalReadyCount={readyLeads.length}
        onSuccess={loadData}
      />
    </div>
  );
}
