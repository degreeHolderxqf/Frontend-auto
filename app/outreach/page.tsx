"use client";

import React, { useEffect, useState } from "react";
import { fetchLeads } from "@/lib/api/leads";
import { fetchEmailHistory } from "@/lib/api/email";
import { fetchWhatsAppLogs } from "@/lib/api/whatsapp";
import { fetchStats } from "@/lib/api/stats";
import { Lead, EmailLog, WhatsAppLog, CampaignStats } from "@/types";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { EmailPreviewModal } from "@/components/email/EmailPreviewModal";
import { WhatsAppPreviewModal } from "@/components/leads/WhatsAppPreviewModal";
import { BatchSenderModal } from "@/components/email/BatchSenderModal";
import { EmailHistoryTable } from "@/components/email/EmailHistoryTable";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Send, Clock, RefreshCw, MailCheck, ShieldCheck, MessageSquare, Phone } from "lucide-react";

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "emailHistory" | "whatsappHistory">("queue");
  const [readyLeads, setReadyLeads] = useState<Lead[]>([]);
  const [historyLogs, setHistoryLogs] = useState<EmailLog[]>([]);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const [previewWhatsAppLead, setPreviewWhatsAppLead] = useState<Lead | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [leadsData, historyData, waLogsData, statsData] = await Promise.all([
        fetchLeads({ status: "READY", limit: "all" }),
        fetchEmailHistory(),
        fetchWhatsAppLogs(),
        fetchStats(),
      ]);
      setReadyLeads(leadsData);
      setHistoryLogs(historyData);
      setWhatsAppLogs(waLogsData);
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
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Outreach &amp; Dispatch Center</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalized cold job applications dispatched via Email and WhatsApp (Evolution Go).
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
            Batch Email Outreach ({readyLeads.length})
          </Button>

          <Button variant="outline" size="sm" onClick={loadData} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">WhatsApp Sent</p>
            <p className="text-2xl font-bold text-teal-400 mt-0.5"> {whatsAppLogs?.length ?? 0}</p>
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
          onClick={() => setActiveTab("emailHistory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "emailHistory"
              ? "bg-slate-900 text-sky-400 border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MailCheck className="w-3.5 h-3.5" />
          Email Logs ({historyLogs.length})
        </button>

        <button
          onClick={() => setActiveTab("whatsappHistory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "whatsappHistory"
              ? "bg-slate-900 text-emerald-400 border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          WhatsApp Logs ( {whatsAppLogs?.length ?? 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "queue" ? (
        <Card className="p-0 border-none bg-transparent">
          <LeadsTable
            leads={readyLeads}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onPreviewEmail={(lead) => setPreviewLead(lead)}
            onPreviewWhatsApp={(lead) => setPreviewWhatsAppLead(lead)}
          />
        </Card>
      ) : activeTab === "emailHistory" ? (
        <Card className="p-0 border-none bg-transparent">
          <EmailHistoryTable logs={historyLogs} />
        </Card>
      ) : (
        <Card className="p-0 border-none bg-transparent">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Target Phone</th>
                  <th className="p-3.5">Message Snippet</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {whatsAppLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No WhatsApp outreach messages logged yet.
                    </td>
                  </tr>
                ) : (
                  whatsAppLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-200">{log.company_name || `Company #${log.company_id}`}</td>
                      <td className="p-3.5 font-mono text-sky-400">{log.phone}</td>
                      <td className="p-3.5 max-w-xs truncate text-slate-300">{log.message}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            log.status === "SENT" || log.status === "DRY_RUN_SENT"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : log.status === "REPLIED"
                              ? "bg-sky-950 text-sky-300 border-sky-800"
                              : log.status === "OPTED_OUT"
                              ? "bg-amber-950 text-amber-300 border-amber-800"
                              : "bg-rose-950 text-rose-300 border-rose-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{log.sent_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
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

      {/* WhatsApp Preview Modal */}
      <WhatsAppPreviewModal
        lead={previewWhatsAppLead}
        isOpen={previewWhatsAppLead !== null}
        onClose={() => setPreviewWhatsAppLead(null)}
        onSuccess={loadData}
      />

      {/* Batch Send Modal */}
      <BatchSenderModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedLeadIds={readyLeads.map((l) => l.id)}
        totalReadyCount={readyLeads.length}
        onSuccess={loadData}
      />
    </div>
  );
}
