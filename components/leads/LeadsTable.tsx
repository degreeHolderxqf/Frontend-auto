"use client";

import React from "react";
import { Lead } from "@/types";
import { StatusBadge, ConfidenceBadge, EmployeeVerificationBadge } from "@/components/ui/Badge";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { ExternalLink, Mail, Eye, Building2, Users, MessageSquare, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onPreviewEmail?: (lead: Lead) => void;
  onPreviewWhatsApp?: (lead: Lead) => void;
  onRefreshRevenue?: (lead: Lead) => void;
  refreshingRevenueId?: number | null;
  selectedLeadIds?: number[];
  onToggleSelectLead?: (id: number) => void;
  onToggleSelectAll?: () => void;
}

export function LeadsTable({
  leads,
  onSelectLead,
  onPreviewEmail,
  onPreviewWhatsApp,
  onRefreshRevenue,
  refreshingRevenueId = null,
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
          No companies match this filter. Run discovery or change the source filter to see other records.
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
            <th className="p-3.5">Source</th>
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
              (lead.employee_count ? `${lead.employee_count}+` : "Unknown");

            let displayStatus = lead.email_status || lead.status;
            if (!isHeadcountVerified && displayStatus === "READY") {
              displayStatus = "NOT_ELIGIBLE";
            }

            const phone = lead.normalized_phone || lead.phone;
            const whatsappStatus = lead.whatsapp_status || "READY";

            return (
              <tr
                key={lead.record_id ?? lead.contact_id ?? lead.id}
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
                  {lead.record_detail && (
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate" title={lead.record_detail}>
                      {lead.record_detail}
                    </p>
                  )}
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
                  {lead.source === "MERCHANT_UPLOAD" && (
                    <div className="mt-1.5 space-y-1">
                      {lead.store_description && (
                        <p className="text-[10px] text-slate-400 line-clamp-2" title={lead.store_description}>
                          {lead.store_description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(lead.installed_apps || []).slice(0, 3).map((app) => (
                          <span key={app} className="text-[9px] text-emerald-300 bg-emerald-950/50 border border-emerald-900/70 px-1.5 py-0.5 rounded">
                            {app}
                          </span>
                        ))}
                        {(lead.tech_stack || []).filter((item) => item !== "Shopify").slice(0, 2).map((item) => (
                          <span key={item} className="text-[9px] text-sky-300 bg-sky-950/50 border border-sky-900/70 px-1.5 py-0.5 rounded">
                            {item}
                          </span>
                        ))}
                        {lead.product_count != null && (
                          <span className="text-[9px] text-slate-400">{lead.product_count} product links found</span>
                        )}
                        {(() => {
                          const toNumber = (value: number | string | null | undefined) => {
                            if (value === null || value === undefined || value === "") return null;
                            const numeric = Number(value);
                            return Number.isFinite(numeric) ? numeric : null;
                          };

                          const revenueCurrency = String(lead.revenue_currency || "").trim().toUpperCase();
                          const money = (value: number | string | null | undefined, currency = revenueCurrency) => {
                            const numeric = toNumber(value);
                            if (numeric === null || !currency) return null;
                            try {
                              return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en", {
                                style: "currency",
                                currency,
                                maximumFractionDigits: 0,
                              }).format(numeric);
                            } catch {
                              return `${Math.round(numeric)} ${currency}`;
                            }
                          };

                          const exactRevenue = toNumber(lead.estimated_monthly_revenue);
                          const lowRevenue = toNumber(lead.estimated_monthly_revenue_min);
                          const highRevenue = toNumber(lead.estimated_monthly_revenue_max);
                          const revenueStatus = String(lead.revenue_estimation_status || "").toUpperCase();
                          const hasCalculatedEstimate = ["SUCCESS", "ESTIMATED"].includes(revenueStatus) &&
                            (exactRevenue !== null || lowRevenue !== null || highRevenue !== null);

                          const lowMoney = lowRevenue !== null ? money(lowRevenue) : null;
                          const highMoney = highRevenue !== null ? money(highRevenue) : null;
                          const range = lowMoney && highMoney ? `${lowMoney} – ${highMoney}` : "";
                          const exactMoney = exactRevenue !== null ? money(exactRevenue) : null;
                          const revenueDisplay = exactMoney ? `${exactMoney}/mo` : range ? `${range}/mo` : null;

                          const estimateDetails = [
                            lead.revenue_estimation_method ? `Method: ${lead.revenue_estimation_method.replace(/_/g, " ")}` : null,
                            lead.revenue_estimation_confidence ? `Confidence: ${lead.revenue_estimation_confidence}` : null,
                            range ? `Monthly scenario range: ${range}` : null,
                            lead.estimated_annual_revenue != null ? `Annualized run rate: ${money(lead.estimated_annual_revenue)}` : null,
                            lead.estimated_aov != null ? `Median product price proxy: ${money(lead.estimated_aov)}` : null,
                            lead.estimated_conversion_rate != null ? `Assumed base conversion rate: ${(lead.estimated_conversion_rate * 100).toFixed(2)}%` : null,
                            lead.estimated_monthly_visits != null ? `Traffic input: ${lead.estimated_monthly_visits.toLocaleString()} (${lead.revenue_traffic_provider || "provider"}; ${lead.revenue_traffic_metric || "metric not specified"})` : null,
                            lead.revenue_last_updated_at ? `Last updated: ${new Date(lead.revenue_last_updated_at).toLocaleString()}` : null,
                            lead.revenue_estimation_reason || null,
                            ...(lead.revenue_assumptions || []),
                          ].filter(Boolean).join("\n");

                          const revenueLabel = revenueDisplay
                            ? `Estimated monthly revenue: ${revenueDisplay}`
                            : lead.estimated_revenue
                              ? `Revenue (source-provided): ${lead.estimated_revenue}`
                              : lead.revenue_estimation_status === "TRAFFIC_DATA_UNAVAILABLE"
                                ? "Revenue estimate: unavailable"
                                : lead.revenue_estimation_status
                                  ? "Revenue estimate: insufficient data"
                                  : "Revenue estimate: unavailable";

                          return (
                            <span className="text-[12px] text-slate-500" title={estimateDetails || lead.revenue_estimation_reason || "No revenue estimate has been generated."}>
                              {revenueLabel}
                              {hasCalculatedEstimate && lead.revenue_estimation_confidence
                                ? ` · ${lead.revenue_estimation_confidence} confidence`
                                : ""}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </td>

                {/* Source */}
                <td className="p-3.5 whitespace-nowrap">
                  {lead.source === "SHOPIFY_APP_STORE" ? (
                    <span
                      title="Discovered from Shopify App Store (app developer)"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded"
                    >
                      App Store
                    </span>
                  ) : lead.source === "MERCHANT_UPLOAD" ? (
                    <span
                      title="Imported Shopify merchant lead"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded"
                    >
                      Merchant Store
                    </span>
                  ) : (
                    <span
                      title="Discovered from Shopify Partner Directory (service agency)"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded"
                    >
                      Partner Dir
                    </span>
                  )}
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
                  {onRefreshRevenue && lead.source === "MERCHANT_UPLOAD" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRefreshRevenue(lead)}
                      isLoading={refreshingRevenueId === lead.id}
                      title="Refresh this store's revenue estimate"
                      className="h-7 text-xs px-2"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh revenue
                    </Button>
                  )}
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
