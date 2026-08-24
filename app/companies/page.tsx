"use client";

import React, { useEffect, useState } from "react";
import { fetchLeads } from "@/lib/api/leads";
import { Lead } from "@/types";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { EmailPreviewModal } from "@/components/email/EmailPreviewModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Search, RefreshCw, Building2 } from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const toast = useToast();

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await fetchLeads({
        limit: "all",
        search: search.trim() || undefined,
      });
      setCompanies(data);
    } catch (err: any) {
      toast.error("Error loading companies", err.message || "Failed to fetch companies.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCompanies();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">All Discovered Companies</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full database of Shopify Partners discovered across India with services and domains.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadCompanies} isLoading={isLoading}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Search Filter */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name, city, services, or domain..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      {/* Companies Table */}
      <Card className="p-0 border-none bg-transparent">
        <LeadsTable
          leads={companies}
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
        onSuccess={loadCompanies}
      />
    </div>
  );
}
