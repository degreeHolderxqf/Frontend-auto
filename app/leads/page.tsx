"use client";

import React, { useEffect, useState } from "react";
import { fetchLeads, getDownloadUrl } from "@/lib/api/leads";
import { Lead } from "@/types";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { EmailPreviewModal } from "@/components/email/EmailPreviewModal";
import { BatchSenderModal } from "@/components/email/BatchSenderModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Search, Download, Send, RefreshCw, FileSpreadsheet, Filter } from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const toast = useToast();

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const data = await fetchLeads({
        limit: "all",
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        minScore: minScore > 0 ? minScore : undefined,
        search: search.trim() || undefined,
      });
      setLeads(data);
    } catch (err: any) {
      toast.error("Error loading leads", err.message || "Failed to fetch leads from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter, minScore]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLeads();
  };

  const handleToggleSelectLead = (id: number) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Qualified Shopify Leads</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified Indian Shopify Partners with evidence-based HR/hiring contact discovery.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedLeadIds.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsBatchModalOpen(true)}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send Selected ({selectedLeadIds.length})
            </Button>
          )}

          <a href={getDownloadUrl("csv")} download>
            <Button variant="secondary" size="sm">
              <Download className="w-3.5 h-3.5 mr-1" />
              CSV
            </Button>
          </a>

          <a href={getDownloadUrl("xlsx")} download>
            <Button variant="secondary" size="sm">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Excel
            </Button>
          </a>

          <Button variant="outline" size="sm" onClick={loadLeads} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company name, domain, city, email, or services..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary">
              Search
            </Button>
          </form>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {["ALL", "READY", "SENT", "NO_CONTACT", "EXCLUDED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? "bg-sky-500 text-slate-950 shadow-xs"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Min Score Filter */}
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500 w-full md:w-auto"
          >
            <option value={0}>All Scores</option>
            <option value={70}>Score ≥ 70 (Qualified)</option>
            <option value={80}>Score ≥ 80 (High Priority)</option>
            <option value={90}>Score ≥ 90 (Top Elite)</option>
          </select>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="p-0 border-none bg-transparent">
        <LeadsTable
          leads={leads}
          onSelectLead={(lead) => setSelectedLead(lead)}
          onPreviewEmail={(lead) => setPreviewLead(lead)}
          selectedLeadIds={selectedLeadIds}
          onToggleSelectLead={handleToggleSelectLead}
          onToggleSelectAll={handleToggleSelectAll}
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
        onSuccess={loadLeads}
      />

      {/* Batch Send Modal */}
      <BatchSenderModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedLeadIds={selectedLeadIds}
        totalReadyCount={leads.filter((l) => l.status === "READY").length}
        onSuccess={() => {
          setSelectedLeadIds([]);
          loadLeads();
        }}
      />
    </div>
  );
}
