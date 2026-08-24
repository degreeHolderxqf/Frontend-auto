"use client";

import React, { useEffect, useState } from "react";
import { fetchExclusions } from "@/lib/api/exclusions";
import { Exclusion } from "@/types";
import { ExclusionsTable } from "@/components/exclusions/ExclusionsTable";
import { AddExclusionModal } from "@/components/exclusions/AddExclusionModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ShieldBan, ShieldPlus, Search, RefreshCw } from "lucide-react";

export default function ExclusionsPage() {
  const [exclusions, setExclusions] = useState<Exclusion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const toast = useToast();

  const loadExclusions = async () => {
    try {
      setIsLoading(true);
      const data = await fetchExclusions();
      setExclusions(data);
    } catch (err: any) {
      toast.error("Error loading exclusions", err.message || "Failed to fetch exclusions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExclusions();
  }, []);

  const filtered = exclusions.filter((ex) => {
    const q = search.toLowerCase();
    return (
      ex.company_name.toLowerCase().includes(q) ||
      (ex.domain && ex.domain.toLowerCase().includes(q)) ||
      (ex.reason && ex.reason.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Excluded Companies Blacklist</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Companies permanently excluded from discovery, research, and outreach (75+ preloaded).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <ShieldPlus className="w-3.5 h-3.5 mr-1" />
            Add Exclusion
          </Button>

          <Button variant="outline" size="sm" onClick={loadExclusions} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search excluded companies by name, domain, or reason..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      </Card>

      {/* Exclusions Table */}
      <ExclusionsTable exclusions={filtered} />

      {/* Add Exclusion Modal */}
      <AddExclusionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadExclusions}
      />
    </div>
  );
}
