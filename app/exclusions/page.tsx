"use client";

import React, { useEffect, useState } from "react";
import { fetchExclusions } from "@/lib/api/exclusions";
import { Exclusion, ContactedLead } from "@/types";
import { ExclusionsTable } from "@/components/exclusions/ExclusionsTable";
import { AddExclusionModal } from "@/components/exclusions/AddExclusionModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ShieldBan, ShieldPlus, Search, RefreshCw, MailCheck, Building2, Calendar, Globe, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ExclusionsPage() {
  const [activeTab, setActiveTab] = useState<"exclusions" | "contacted">("exclusions");
  const [exclusions, setExclusions] = useState<Exclusion[]>([]);
  const [contacted, setContacted] = useState<ContactedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchExclusions();
      setExclusions(res.exclusions);
      setContacted(res.contacted);
    } catch (err: any) {
      toast.error("Error loading exclusions", err.message || "Failed to fetch exclusions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredExclusions = exclusions.filter((ex) => {
    const q = search.toLowerCase();
    return (
      ex.company_name.toLowerCase().includes(q) ||
      (ex.domain && ex.domain.toLowerCase().includes(q)) ||
      (ex.reason && ex.reason.toLowerCase().includes(q))
    );
  });

  const filteredContacted = contacted.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.company_name.toLowerCase().includes(q) ||
      (c.domain && c.domain.toLowerCase().includes(q)) ||
      (c.sent_email && c.sent_email.toLowerCase().includes(q)) ||
      (c.email_subject && c.email_subject.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Exclusions & Contacted History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Companies permanently excluded from discovery, research, and outreach (including all past contacted leads).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <ShieldPlus className="w-3.5 h-3.5 mr-1" />
            Add Exclusion
          </Button>

          <Button variant="outline" size="sm" onClick={loadData} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("exclusions")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "exclusions"
              ? "bg-slate-800 text-sky-400 border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldBan className="w-3.5 h-3.5" />
          Exclusions Blacklist ({exclusions.length})
        </button>

        <button
          onClick={() => setActiveTab("contacted")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "contacted"
              ? "bg-slate-800 text-emerald-400 border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MailCheck className="w-3.5 h-3.5 text-emerald-400" />
          Previously Contacted ({contacted.length})
        </button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "exclusions"
                ? "Search excluded companies by name, domain, or reason..."
                : "Search contacted companies by name, domain, or email..."
            }
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      </Card>

      {/* Content View */}
      {activeTab === "exclusions" ? (
        <ExclusionsTable exclusions={filteredExclusions} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Recipient Email</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Sent Timestamp</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredContacted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <MailCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No contacted leads recorded yet.
                  </td>
                </tr>
              ) : (
                filteredContacted.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 max-w-[220px]">
                      <div className="font-semibold text-slate-100 truncate">{item.company_name}</div>
                      {item.domain && (
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <Globe className="w-2.5 h-2.5" />
                          {item.domain}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-200">{item.sent_email || "[Email Sent]"}</span>
                    </td>
                    <td className="p-3.5 max-w-[260px]">
                      <span className="text-[11px] text-slate-400 truncate block">
                        {item.email_subject || "Shopify App Developer — Application & Portfolio"}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                      {item.sent_at ? formatDate(item.sent_at) : "Sent"}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                        ● CONTACTED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Exclusion Modal */}
      <AddExclusionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
