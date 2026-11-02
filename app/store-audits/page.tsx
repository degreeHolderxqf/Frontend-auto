"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, FileText, Gauge, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { Lead } from "@/types";
import { fetchCompanies } from "@/lib/api/leads";
import {
  approveStoreAudit,
  createStoreAudit,
  fetchStoreAudits,
  getStoreAuditReportUrl,
  sendApprovedStoreAudit,
  StorePerformanceAudit,
  updateStoreAuditDraft
} from "@/lib/api/storeAudits";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export default function StoreAuditsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audits, setAudits] = useState<StorePerformanceAudit[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);
  const [mode, setMode] = useState<"short" | "report">("report");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();

  const selectedAudit = useMemo(
    () => audits.find((audit) => audit.id === selectedAuditId) || null,
    [audits, selectedAuditId]
  );
  const selectedLead = useMemo(
    () => leads.find((lead) => String(lead.id) === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [merchantLeads, auditRows] = await Promise.all([
        fetchCompanies({ source: "MERCHANT_UPLOAD", limit: 10000 }),
        fetchStoreAudits()
      ]);
      setLeads(merchantLeads.filter((lead) => Boolean(lead.domain || lead.official_website)));
      setAudits(auditRows);
      if (selectedAuditId && !auditRows.some((audit) => audit.id === selectedAuditId)) {
        setSelectedAuditId(null);
      }
    } catch (error) {
      toast.error("Could not load store audits", error instanceof Error ? error.message : "Backend request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setSubject(selectedAudit?.email_subject || "");
    setBody(selectedAudit?.email_body || "");
  }, [selectedAudit]);

  const handleCreateAudit = async () => {
    if (!selectedLead) return;
    try {
      setIsAuditing(true);
      const audit = await createStoreAudit({ leadId: selectedLead.id, mode, strategy });
      setAudits((current) => [audit, ...current.filter((item) => item.id !== audit.id)]);
      setSelectedAuditId(audit.id);
      toast.success("Store audit ready for review", `${audit.store_name} — ${audit.report?.issues.length ?? 0} finding(s) across ${audit.report?.pagesInspected.length ?? 0} inspected page(s)`);
    } catch (error) {
      toast.error("Audit failed", error instanceof Error ? error.message : "The audit could not be completed.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedAudit) return;
    try {
      setIsSaving(true);
      const updated = await updateStoreAuditDraft(selectedAudit.id, {
        subject,
        body,
        mode: selectedAudit.email_mode
      });
      setAudits((current) => current.map((audit) => audit.id === updated.id ? updated : audit));
      toast.success("Draft saved", "Review the message before approving it.");
    } catch (error) {
      toast.error("Could not save draft", error instanceof Error ? error.message : "The draft could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedAudit) return;
    try {
      setIsSaving(true);
      const changedDraft = subject !== selectedAudit.email_subject || body !== selectedAudit.email_body;
      const reviewed = changedDraft
        ? await updateStoreAuditDraft(selectedAudit.id, {
            subject,
            body,
            mode: selectedAudit.email_mode
          })
        : selectedAudit;
      const approved = await approveStoreAudit(reviewed.id);
      setAudits((current) => current.map((audit) => audit.id === approved.id ? approved : audit));
      toast.success("Draft approved", "Sending remains a separate manual action.");
    } catch (error) {
      toast.error("Approval failed", error instanceof Error ? error.message : "The draft could not be approved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!selectedAudit || !window.confirm(`Send the approved audit email to ${selectedAudit.recipient_email || "this store"}?`)) return;
    try {
      setIsSending(true);
      const sent = await sendApprovedStoreAudit(selectedAudit.id);
      setAudits((current) => current.map((audit) => audit.id === sent.id ? sent : audit));
      toast.success(sent.status === "DRY_RUN_SENT" ? "Dry run complete" : "Audit email sent", sent.recipient_email || "");
    } catch (error) {
      toast.error("Could not send audit email", error instanceof Error ? error.message : "The email could not be sent.");
      await loadData();
    } finally {
      setIsSending(false);
    }
  };

  const selectAudit = (audit: StorePerformanceAudit) => {
    setSelectedAuditId(audit.id);
  };

  const canEdit = selectedAudit?.status === "REVIEW";
  const isReportMode = selectedAudit?.email_mode === "report";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Shopify Store Performance & CRO Audits</h1>
          <p className="mt-1 text-sm text-slate-400">
            Inspect the homepage and linked product, collection, and policy pages, combine verified observations with PageSpeed data, then review the report before outreach.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadData()} isLoading={isLoading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </header>

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-sky-400" />
          <h2 className="font-semibold text-slate-100">Start a merchant audit</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-xs text-slate-400">
            Shopify merchant
            <select
              value={selectedLeadId}
              onChange={(event) => setSelectedLeadId(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Select a merchant lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} — {lead.domain || lead.official_website}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs text-slate-400">
            Email option
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as "short" | "report")}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="short">A — Short email, no PDF attached</option>
              <option value="report">B — Email with detailed PDF attached</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-slate-400">
            PageSpeed strategy
            <select
              value={strategy}
              onChange={(event) => setStrategy(event.target.value as "mobile" | "desktop")}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
          </label>
        </div>
        {selectedLead && !selectedLead.email && (
          <p className="flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            No contact email is currently recorded for this store; the audit can run, but sending will require a verified contact.
          </p>
        )}
        <Button onClick={() => void handleCreateAudit()} disabled={!selectedLead || isAuditing} isLoading={isAuditing}>
          <Gauge className="h-4 w-4" />
          Run audit and generate draft
        </Button>
        <p className="text-xs text-slate-500">
          The public-page review is bounded and respects robots.txt. PageSpeed Insights requires PAGESPEED_API_KEY; Gemini is optional and a verified-evidence email fallback is used if it is unavailable.
          No email is sent until you approve and separately choose Send.
        </p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.6fr)]">
        <Card className="space-y-3 p-4">
          <h2 className="font-semibold text-slate-100">Audit history</h2>
          {audits.length === 0 && <p className="text-sm text-slate-500">{isLoading ? "Loading audits..." : "No audits yet."}</p>}
          <div className="max-h-[650px] space-y-2 overflow-y-auto">
            {audits.map((audit) => (
              <button
                key={audit.id}
                type="button"
                onClick={() => selectAudit(audit)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  audit.id === selectedAuditId
                    ? "border-sky-500/50 bg-sky-500/10"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <span className="block truncate text-sm font-medium text-slate-100">{audit.store_name}</span>
                <span className="mt-1 block text-xs text-slate-400">{audit.domain || audit.website_url}</span>
                <span className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{audit.created_at}</span>
                  <span className={audit.status === "REVIEW" ? "text-amber-300" : "text-sky-300"}>{audit.status}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          {!selectedAudit ? (
            <div className="py-10 text-center text-sm text-slate-500">Select an audit to review its findings and email draft.</div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">{selectedAudit.store_name}</h2>
                  <a className="text-sm text-sky-300 underline" href={selectedAudit.website_url} target="_blank" rel="noreferrer">
                    {selectedAudit.website_url}
                  </a>
                  <p className="mt-1 text-xs text-slate-500">
                    Public storefront inspection + Google PageSpeed Insights · {selectedAudit.strategy} · {selectedAudit.created_at}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-center">
                  <span className="block text-xs uppercase text-slate-400">Performance</span>
                  <span className="text-xl font-bold text-slate-100">
                    {selectedAudit.performance_score === null ? "N/A" : `${selectedAudit.performance_score}/100`}
                  </span>
                  <a
                    className="mt-1 flex items-center justify-center gap-1 text-xs text-sky-300 underline"
                    href={getStoreAuditReportUrl(selectedAudit.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Download PDF
                  </a>
                </div>
              </div>

              {selectedAudit.report && (
                <section className="space-y-3 rounded-xl border border-sky-900/60 bg-sky-950/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Detailed store audit</h3>
                      <p className="mt-1 text-xs text-slate-400">{selectedAudit.report.overallAssessment} · {selectedAudit.report.pagesInspected.length} page(s) inspected · {selectedAudit.report.verifiedCount} verified · {selectedAudit.report.needsVerificationCount} require verification</p>
                    </div>
                    <span className="text-xs text-slate-400">PDF includes the full evidence and scope notes</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{selectedAudit.report.executiveSummary}</p>
                  {selectedAudit.report.issues.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-4">
                      {(["critical", "high", "medium", "low"] as const).map((priority) => (
                        <div key={priority} className="rounded border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs">
                          <span className="capitalize text-slate-400">{priority}</span>
                          <span className="float-right font-semibold text-slate-100">{selectedAudit.report?.priorityCounts[priority] || 0}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedAudit.report.recommendedFirstSteps.length > 0 && (
                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                      <h4 className="text-xs font-semibold text-slate-300">Recommended first steps</h4>
                      <ol className="mt-1 list-inside list-decimal space-y-1 text-xs text-slate-400">
                        {selectedAudit.report.recommendedFirstSteps.map((step) => <li key={step}>{step}</li>)}
                      </ol>
                    </div>
                  )}
                  <div className="space-y-2">
                    {selectedAudit.report.issues.map((issue) => (
                      <article key={issue.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-sky-300">{issue.category}</span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-amber-200">{issue.priority}</span>
                          {issue.verificationStatus !== "verified" && (
                            <span className="text-[10px] text-orange-300">Needs verification</span>
                          )}
                        </div>
                        <h4 className="mt-1 text-sm font-medium text-slate-100">{issue.title}</h4>
                        <p className="mt-1 text-sm text-slate-300">{issue.observation}</p>
                        {issue.evidence.map((evidence) => (
                          <p key={`${issue.id}-${evidence.url}`} className="mt-1 break-all text-xs text-slate-500">
                            Evidence: <a className="text-sky-300 underline" href={evidence.url} target="_blank" rel="noreferrer">{evidence.url}</a> — {evidence.description}
                          </p>
                        ))}
                        <p className="mt-2 text-xs text-slate-400">Why it may matter: {issue.businessImpact}</p>
                        <p className="mt-1 text-xs text-emerald-300">Recommended next step: {issue.recommendation}</p>
                        <p className="mt-1 text-[10px] text-slate-500">Effort: {issue.effort} · Confidence: {issue.confidence}</p>
                      </article>
                    ))}
                  </div>
                  {selectedAudit.report.limitations.length > 0 && (
                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                      <h4 className="text-xs font-semibold text-slate-300">Scope and limitations</h4>
                      {selectedAudit.report.limitations.map((limitation) => (
                        <p key={limitation} className="mt-1 text-xs text-slate-400">{limitation}</p>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-200">Verified PageSpeed observations</h3>
                {!selectedAudit.email_subject && (
                  <p className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-400">
                    The audit report is available, but no verified observation was suitable for an outreach email. Review or download the report; no draft can be approved or sent from this audit.
                  </p>
                )}
                {selectedAudit.findings.length === 0 && (
                  <p className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-400">
                    No qualifying performance issue was found. The system did not create an outreach draft from an unverified claim.
                  </p>
                )}
                {selectedAudit.findings.map((finding) => (
                  <div key={finding.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-sm font-medium text-slate-100">{finding.title} <span className="text-slate-400">({finding.displayValue})</span></p>
                    <p className="mt-1 text-sm text-slate-300">{finding.observation}</p>
                    <p className="mt-2 text-xs text-emerald-300">Possible solution: {finding.solution}</p>
                  </div>
                ))}
              </section>

              {Object.keys(selectedAudit.metrics).length > 0 && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold text-slate-200">Core Web Vitals / metrics</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(selectedAudit.metrics).map(([name, value]) => (
                      <div key={name} className="rounded border border-slate-800 bg-slate-950 px-3 py-2 text-xs">
                        <span className="text-slate-400">{name}</span>
                        <span className="float-right font-medium text-slate-100">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {selectedAudit.email_subject && selectedAudit.email_body && (
                <section className="space-y-3 border-t border-slate-800 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <ClipboardCheck className="h-4 w-4 text-sky-400" />
                      Human review — {isReportMode ? "Option B with PDF attachment" : "Option A short email"}
                    </h3>
                    {isReportMode && <span className="text-xs text-slate-400">Detailed PDF attaches when sent</span>}
                  </div>
                  <p className="text-xs text-slate-400">To: {selectedAudit.recipient_email || "No contact email recorded"}</p>
                  <label className="block space-y-1 text-xs text-slate-400">
                    Subject
                    <input
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      disabled={!canEdit}
                      maxLength={200}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-70"
                    />
                  </label>
                  <label className="block space-y-1 text-xs text-slate-400">
                    Email body
                    <textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      disabled={!canEdit}
                      rows={12}
                      maxLength={5000}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-sans text-sm text-slate-100 disabled:opacity-70"
                    />
                  </label>
                  {selectedAudit.error && <p className="text-sm text-rose-300">{selectedAudit.error}</p>}
                  <div className="flex flex-wrap gap-2">
                    {canEdit && (
                      <>
                        <Button variant="secondary" onClick={() => void handleSaveDraft()} isLoading={isSaving}>
                          Save reviewed draft
                        </Button>
                        <Button onClick={() => void handleApprove()} isLoading={isSaving}>
                          <ShieldCheck className="h-4 w-4" />
                          Approve draft
                        </Button>
                      </>
                    )}
                    {selectedAudit.status === "APPROVED" && (
                      <Button variant="success" onClick={() => void handleSend()} isLoading={isSending}>
                        <Send className="h-4 w-4" />
                        Send approved email
                      </Button>
                    )}
                    {selectedAudit.status === "DRY_RUN_SENT" && (
                      <p className="self-center text-sm text-amber-300">Dry run only; no message was sent.</p>
                    )}
                    {selectedAudit.status === "SENT" && (
                      <p className="self-center text-sm text-emerald-300">Email sent {selectedAudit.sent_at || ""}.</p>
                    )}
                  </div>
                  {canEdit && (
                    <p className="text-xs text-slate-500">
                      Saving a draft does not approve or send it. Approval locks the copy; sending is a second explicit action.
                    </p>
                  )}
                </section>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
