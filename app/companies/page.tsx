"use client";

import React, { useEffect, useState } from "react";
import { fetchCompanies, refreshCompanyRevenue } from "@/lib/api/leads";
import { Lead } from "@/types";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { EmailPreviewModal } from "@/components/email/EmailPreviewModal";
import { MerchantOutreachPanel } from "@/components/discovery/MerchantOutreachPanel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Search, RefreshCw, Building2 } from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [refreshingRevenueId, setRefreshingRevenueId] = useState<number | null>(null);
  const toast = useToast();

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCompanies({
        limit: "all",
        source,
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
    setSelectedLeadIds([]);
    loadCompanies();
  }, [source]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedLeadIds([]);
    loadCompanies();
  };

  const toggleLeadSelection = (leadId: number) => {
    setSelectedLeadIds((selected) =>
      selected.includes(leadId)
        ? selected.filter((id) => id !== leadId)
        : [...selected, leadId]
    );
  };

  const toggleAllLeadSelection = () => {
    setSelectedLeadIds((selected) =>
      selected.length === companies.length
        ? []
        : companies.map((company) => company.id)
    );
  };

  const handleRefreshRevenue = async (lead: Lead) => {
    setRefreshingRevenueId(lead.id);
    try {
      const estimate = await refreshCompanyRevenue(lead.id);
      await loadCompanies();
      if (estimate.status === "SUCCESS") {
        toast.success("Revenue estimate refreshed", `${lead.name}: ${String(estimate.estimated_revenue || "Estimate saved")}`);
      } else {
        toast.info("Revenue estimate unavailable", String(estimate.reason || estimate.status || "Required public data is unavailable."));
      }
    } catch (err: any) {
      toast.error("Revenue refresh failed", err.message || "The estimate could not be refreshed.");
    } finally {
      setRefreshingRevenueId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">All Discovered Companies</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            All discovered companies and uploaded Shopify stores, including records that do not yet have outreach-ready contacts.
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
          <label htmlFor="companies-source-filter" className="sr-only">Filter by lead source</label>
          <select
            id="companies-source-filter"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All sources</option>
            <option value="SHOPIFY_APP_STORE">App Store</option>
            <option value="SHOPIFY_PARTNER_DIRECTORY">Partner Directory</option>
            <option value="MERCHANT_UPLOAD">Freelancing stores</option>
          </select>
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

      {source === "MERCHANT_UPLOAD" && (
        <MerchantOutreachPanel
          leadIds={selectedLeadIds}
          onQueued={loadCompanies}
        />
      )}

      {/* Companies Table */}
      <Card className="p-0 border-none bg-transparent">
        <LeadsTable
          leads={companies}
          onSelectLead={(lead) => setSelectedLead(lead)}
          selectedLeadIds={selectedLeadIds}
          onToggleSelectLead={source === "MERCHANT_UPLOAD" ? toggleLeadSelection : undefined}
          onToggleSelectAll={source === "MERCHANT_UPLOAD" ? toggleAllLeadSelection : undefined}
          onRefreshRevenue={handleRefreshRevenue}
          refreshingRevenueId={refreshingRevenueId}
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
