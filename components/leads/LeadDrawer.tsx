"use client";

import React, { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Lead, Contact, Source, EmailLog } from "@/types";
import { fetchLeadById } from "@/lib/api/leads";
import { StatusBadge, ConfidenceBadge, EmployeeVerificationBadge } from "@/components/ui/Badge";
import { LeadScoreBadge } from "./LeadScoreBadge";
import {
  Building2,
  Globe,
  Mail,
  Linkedin,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Send,
  Users,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

interface LeadDrawerProps {
  leadId: number | null;
  onClose: () => void;
  onPreviewEmail?: (lead: Lead) => void;
}

export function LeadDrawer({ leadId, onClose, onPreviewEmail }: LeadDrawerProps) {
  const [data, setData] = useState<{
    company: Lead;
    contacts: Contact[];
    sources: Source[];
    emailLogs: EmailLog[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!leadId) {
      setData(null);
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetchLeadById(leadId);
        setData(res);
      } catch {
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [leadId]);

  const company = data?.company;
  const isHeadcountVerified =
    company?.employee_count_verified === 1 ||
    company?.employee_count_status === "QUALIFIED" ||
    (company?.employee_count !== null && company?.employee_count !== undefined && company.employee_count >= 30) ||
    (company?.employee_count_min !== null && company?.employee_count_min !== undefined && company.employee_count_min >= 30);

  return (
    <Drawer
      isOpen={leadId !== null}
      onClose={onClose}
      title={company?.name || "Lead Details"}
      description={company?.domain || "Shopify Partner"}
      width="lg"
    >
      {isLoading || !company ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="space-y-6 text-xs text-slate-300">
          {/* Header Summary Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={!isHeadcountVerified && company.status === "READY" ? "NOT_ELIGIBLE" : company.status} />
                <span className="text-slate-500">•</span>
                <span className="font-semibold text-slate-200">{company.partner_tier || "Shopify Partner"}</span>
              </div>
              <LeadScoreBadge score={company.lead_score} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-400">Headcount:</span>{" "}
                <span className="font-bold text-indigo-300">
                  {company.employee_size_range || (company.employee_count ? `${company.employee_count}+` : "30+")}
                </span>
              </div>
              <div>
                <span className="text-slate-400">App Relevance:</span>{" "}
                <span className="font-bold text-slate-100">{company.app_relevance_score}/100</span>
              </div>
              <div>
                <span className="text-slate-400">Location:</span>{" "}
                <span className="font-semibold text-slate-100 truncate">
                  {company.city ? `${company.city}` : company.country}
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-2 pt-2">
              {company.official_website && (
                <a
                  href={company.official_website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-medium transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  Website
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              )}
              {company.shopify_partner_url && (
                <a
                  href={company.shopify_partner_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/50 text-[11px] font-medium transition-colors"
                >
                  <Building2 className="w-3 h-3" />
                  Shopify Partner Profile
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              )}
              {company.linkedin_url && (
                <a
                  href={company.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-950/60 hover:bg-blue-900/60 text-blue-400 border border-blue-800/50 text-[11px] font-medium transition-colors"
                >
                  <Linkedin className="w-3 h-3" />
                  LinkedIn
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              )}
            </div>
          </div>

          {/* Employee Size Verification Card */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Employee-Size Verification Evidence
              </h4>
              <EmployeeVerificationBadge
                verified={company.employee_count_verified}
                status={company.employee_count_status}
                sizeRange={company.employee_size_range}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400">Headcount Range:</span>{" "}
                <span className="font-semibold text-slate-200">{company.employee_size_range || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400">Exact / Min Count:</span>{" "}
                <span className="font-semibold text-slate-200">{company.employee_count || company.employee_count_min || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400">Primary Source:</span>{" "}
                <span className="font-semibold text-slate-200">{company.employee_count_source || "LinkedIn / Website"}</span>
              </div>
              <div>
                <span className="text-slate-400">Threshold Rule:</span>{" "}
                <span className="font-semibold text-emerald-400">&ge; 30 Employees</span>
              </div>
            </div>

            {company.notes && (
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                <span className="font-medium text-slate-400">Evidence Note: </span>
                {company.notes}
              </div>
            )}
          </div>

          {/* Contacts Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Discovered Public Contacts ({data.contacts.length})
              </h4>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Evidence-Based
              </span>
            </div>

            {data.contacts.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center text-slate-500 text-xs">
                No public email address found on official website or directory profile.
              </div>
            ) : (
              <div className="space-y-2">
                {data.contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">{c.email}</span>
                        <ConfidenceBadge confidence={c.confidence} />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{c.email_type}</span>
                        {c.mx_valid === 1 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> MX Valid
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {onPreviewEmail && isHeadcountVerified && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onPreviewEmail(company);
                          onClose();
                        }}
                      >
                        <Send className="w-3 h-3 text-sky-400 mr-1" />
                        Outreach
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shopify Services & Apps */}
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              Shopify Services & Capabilities
            </h4>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {company.shopify_services || "General Shopify development, custom apps, theme customization."}
              </p>
              {company.public_apps && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Public Shopify App Store Presence:
                  </span>
                  <p className="text-[11px] text-emerald-400 font-mono">{company.public_apps}</p>
                </div>
              )}
            </div>
          </div>

          {/* Discovered Sources Evidence */}
          {data.sources && data.sources.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2">
                Public Verification Sources ({data.sources.length})
              </h4>
              <div className="space-y-1.5">
                {data.sources.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{s.title || s.source_type}</p>
                      <p className="text-slate-500 text-[10px] truncate max-w-[320px]">{s.evidence || s.url}</p>
                    </div>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300 p-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email History Logs */}
          {data.emailLogs && data.emailLogs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2">
                Outreach History
              </h4>
              <div className="space-y-1.5">
                {data.emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{log.subject}</p>
                      <p className="text-slate-500 text-[10px]">{formatDate(log.sent_at)}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
