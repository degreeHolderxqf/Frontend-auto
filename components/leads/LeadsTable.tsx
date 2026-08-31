"use client";

import React from "react";
import { Lead } from "@/types";
import { StatusBadge, ConfidenceBadge, EmployeeVerificationBadge } from "@/components/ui/Badge";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { ExternalLink, Mail, Eye, Building2, Users, Link2, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onPreviewEmail?: (lead: Lead) => void;
  onPreviewWhatsApp?: (lead: Lead) => void;
  selectedLeadIds?: number[];
  onToggleSelectLead?: (id: number) => void;
  onToggleSelectAll?: () => void;
}

export function LeadsTable({
  leads,
  onSelectLead,
  onPreviewEmail,
  onPreviewWhatsApp,
  selectedLeadIds = [],
  onToggleSelectLead,
  onToggleSelectAll,
}: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="py-16 text-center bg-slate-900/40 rounded-xl border border-slate-800">
        <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-200">No active leads found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          All active leads shown here meet the requirement of verified uncontacted status. Run discovery to gather more qualified companies.
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
            <th className="p-3.5">Employees / Size</th>
            <th className="p-3.5">Verification</th>
            <th className="p-3.5">Email</th>
            <th className="p-3.5">Phone / WhatsApp</th>
            <th className="p-3.5 text-center">Score</th>
            <th className="p-3.5">Email Status</th>
            <th className="p-3.5">WhatsApp Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {leads.map((lead) => {
            const isSelected = selectedLeadIds.includes(lead.id);
            const isHeadcountVerified =
              lead.employee_count_verified === 1 ||
              lead.employee_count_status === "QUALIFIED" ||
              (lead.employee_count !== null && lead.employee_count !== undefined && lead.employee_count >= 30) ||
              (lead.employee_count_min !== null && lead.employee_count_min !== undefined && lead.employee_count_min >= 30);

            const displaySize =
              lead.employee_size_range ||
              (lead.employee_count ? `${lead.employee_count}+` : "30+");

            const displaySource =
              lead.employee_count_source ||
              (lead.linkedin_url ? "LinkedIn" : "Website");

            let displayStatus = lead.status;
            if (!isHeadcountVerified && lead.status === "READY") {
              displayStatus = "NOT_ELIGIBLE";
            }

            const phone = lead.normalized_phone || lead.phone;
            const hasWhatsApp = Boolean(phone);
            const whatsappStatus = lead.whatsapp_status || "READY";

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
                <td className="p-3.5 max-w-[170px]">
                  <div className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                    {lead.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {lead.official_website || lead.domain ? (
                      <a
                        href={lead.official_website || `https://${lead.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 truncate max-w-[110px]"
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

                {/* Employees / Company Size */}
                <td className="p-3.5 whitespace-nowrap">
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3 text-indigo-400" />
                    <span>{displaySize}</span>
                  </div>
                </td>

                {/* Employee Verification Badge */}
                <td className="p-3.5 whitespace-nowrap">
                  <EmployeeVerificationBadge
                    verified={lead.employee_count_verified}
                    status={lead.employee_count_status}
                    sizeRange={lead.employee_size_range}
                  />
                </td>

                {/* Contact Email */}
                <td className="p-3.5 max-w-[180px]">
                  {lead.email ? (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate max-w-[140px]">
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

                {/* Phone & WhatsApp Availability */}
                <td className="p-3.5 max-w-[170px]">
                  {phone ? (
                    <div>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-sky-300">
                        <Phone className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate">{phone}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-0.5">
                          <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                        </span>
                        {lead.phone_type && (
                          <span className="text-[10px] text-slate-500 truncate">{lead.phone_type}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No Phone</span>
                  )}
                </td>

                {/* Lead Score */}
                <td className="p-3.5 text-center">
                  <LeadScoreBadge score={lead.lead_score} />
                </td>

                {/* Email Status */}
                <td className="p-3.5 whitespace-nowrap">
                  <StatusBadge status={displayStatus} />
                </td>

                {/* WhatsApp Status */}
                <td className="p-3.5 whitespace-nowrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      whatsappStatus === "SENT"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : whatsappStatus === "REPLIED"
                        ? "bg-sky-950 text-sky-300 border-sky-800"
                        : whatsappStatus === "FAILED"
                        ? "bg-rose-950 text-rose-300 border-rose-800"
                        : whatsappStatus === "OPTED_OUT"
                        ? "bg-amber-950 text-amber-300 border-amber-800"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    {whatsappStatus}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectLead(lead)}
                    className="h-7 text-xs px-2"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Details
                  </Button>

                  {onPreviewEmail && lead.email && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onPreviewEmail(lead)}
                      className="h-7 text-xs px-2"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                  )}

                  {onPreviewWhatsApp && phone && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onPreviewWhatsApp(lead)}
                      className="h-7 text-xs px-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
