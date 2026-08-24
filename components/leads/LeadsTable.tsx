"use client";

import React from "react";
import { Lead } from "@/types";
import { StatusBadge, ConfidenceBadge } from "@/components/ui/Badge";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { ExternalLink, Mail, Eye, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onPreviewEmail?: (lead: Lead) => void;
  selectedLeadIds?: number[];
  onToggleSelectLead?: (id: number) => void;
  onToggleSelectAll?: () => void;
}

export function LeadsTable({
  leads,
  onSelectLead,
  onPreviewEmail,
  selectedLeadIds = [],
  onToggleSelectLead,
  onToggleSelectAll,
}: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="py-16 text-center bg-slate-900/40 rounded-xl border border-slate-800">
        <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-200">No leads found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Try clearing your search filters, or run the Shopify Partner Discovery engine to populate more leads.
        </p>
      </div>
    );
  }

  const allSelected = leads.length > 0 && selectedLeadIds.length === leads.length;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
          <tr>
            {onToggleSelectLead && (
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                />
              </th>
            )}
            <th className="p-3.5">Company</th>
            <th className="p-3.5">Location</th>
            <th className="p-3.5">Tier / Services</th>
            <th className="p-3.5">Contact & Email</th>
            <th className="p-3.5 text-center">App Score</th>
            <th className="p-3.5 text-center">Lead Score</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {leads.map((lead) => {
            const isSelected = selectedLeadIds.includes(lead.id);
            return (
              <tr
                key={lead.id}
                className={`hover:bg-slate-900/60 transition-colors ${
                  isSelected ? "bg-sky-950/20" : ""
                }`}
              >
                {onToggleSelectLead && (
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectLead(lead.id)}
                      className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                    />
                  </td>
                )}

                {/* Company Name & Website */}
                <td className="p-3.5 max-w-[220px]">
                  <div className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                    {lead.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {lead.official_website || lead.domain ? (
                      <a
                        href={lead.official_website || `https://${lead.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 truncate max-w-[140px]"
                      >
                        {lead.domain || "Website"}
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500">No URL</span>
                    )}
                    {lead.shopify_partner_url && (
                      <a
                        href={lead.shopify_partner_url}
                        target="_blank"
                        rel="noreferrer"
                        title="View Official Shopify Partner Profile"
                        className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40 hover:bg-emerald-900/80"
                      >
                        Shopify
                      </a>
                    )}
                  </div>
                </td>

                {/* Location */}
                <td className="p-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{lead.city ? `${lead.city}, ${lead.country || "India"}` : lead.country || "India"}</span>
                  </div>
                </td>

                {/* Partner Tier & Services */}
                <td className="p-3.5 max-w-[200px]">
                  <div className="text-[11px] font-medium text-slate-200 truncate">
                    {lead.partner_tier || "Shopify Partner"}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {lead.shopify_services || "Custom apps, liquid development, theme setup"}
                  </p>
                </td>

                {/* Contact Email & Confidence */}
                <td className="p-3.5">
                  {lead.email ? (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate max-w-[180px]">
                          {lead.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <ConfidenceBadge confidence={lead.email_confidence} />
                        <span className="text-[10px] text-slate-400 truncate">
                          {lead.email_type || "Contact"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No Public Email</span>
                  )}
                </td>

                {/* App Relevance Score */}
                <td className="p-3.5 text-center">
                  <span className="font-semibold text-slate-300">
                    {lead.app_relevance_score}/100
                  </span>
                </td>

                {/* Lead Score */}
                <td className="p-3.5 text-center">
                  <LeadScoreBadge score={lead.lead_score} />
                </td>

                {/* Status */}
                <td className="p-3.5 whitespace-nowrap">
                  <StatusBadge status={lead.status} />
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {onPreviewEmail && lead.email && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onPreviewEmail(lead)}
                        title="Preview personalized outreach email"
                      >
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectLead(lead)}
                      title="View all lead details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
