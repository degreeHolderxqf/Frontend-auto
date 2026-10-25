"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { sendOutreachEmails, getBatchStatus } from "@/lib/api/email";
import { fetchEmailTemplates } from "@/lib/api/templates";
import type { EmailTemplateId } from "@/lib/api/templates";
import { useToast } from "@/components/ui/Toast";
import { AlertTriangle, Send, ShieldCheck, CheckCircle2, Loader2, XCircle } from "lucide-react";

interface BatchSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds?: number[];
  onSuccess?: () => void;
  totalReadyCount?: number;
}

type Phase = "configure" | "sending" | "done";

export function BatchSenderModal({
  isOpen,
  onClose,
  selectedLeadIds = [],
  onSuccess,
  totalReadyCount = 0,
}: BatchSenderModalProps) {
  const [batchLimit, setBatchLimit] = useState<number | "all">(
    selectedLeadIds.length > 0 ? selectedLeadIds.length : 10
  );
  const [isDryRun, setIsDryRun] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [phase, setPhase] = useState<Phase>("configure");
  const [batchId, setBatchId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [sent, setSent] = useState(0);
  const [failed, setFailed] = useState(0);
  const [pending, setPending] = useState(0);
  const [batchStatus, setBatchStatus] = useState<string>("");
  const [batchError, setBatchError] = useState<string | null>(null);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<EmailTemplateId | null>(null);
  const [activeTemplateName, setActiveTemplateName] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetchEmailTemplates()
      .then((response) => {
        if (cancelled) return;
        setActiveTemplateId(response.activeTemplateId);
        setActiveTemplateName(response.templates.find((template) => template.id === response.activeTemplateId)?.target || response.activeTemplateId);
      })
      .catch(() => {
        if (!cancelled) {
          setActiveTemplateId(null);
          setActiveTemplateName(null);
        }
      });
    return () => { cancelled = true; };
  }, [isOpen]);

  const isSpecificSelection = selectedLeadIds.length > 0;
  const targetCount = isSpecificSelection
    ? selectedLeadIds.length
    : batchLimit === "all"
    ? totalReadyCount
    : Math.min(batchLimit, totalReadyCount);

  // Poll batch status while in "sending" phase
  useEffect(() => {
    if (phase !== "sending" || !batchId) return;

    const poll = async () => {
      try {
        const data = await getBatchStatus(batchId);
        const b = data.batch;
        setTotal(b.total);
        setSent(b.sent);
        setFailed(b.failed);
        setPending(b.pending);
        setBatchStatus(b.status);

        if (b.status === "COMPLETED" || b.status === "FAILED") {
          clearPollTimer();
          setPhase("done");
          if (b.status === "COMPLETED") {
            setFinalMessage(
              `${isDryRun ? "Dry-run" : "Live"} batch completed: ${b.sent} sent, ${b.failed} failed out of ${b.total} total.`
            );
            if (!isDryRun) {
              toast.success(
                "Batch Complete",
                `${b.sent} email${b.sent !== 1 ? "s" : ""} dispatched successfully.`
              );
            } else {
              toast.info("Dry Run Complete", `Simulated ${b.sent} sends.`);
            }
          } else {
            setFinalMessage(`Batch failed: ${b.error || "Unknown error"}.`);
            toast.error("Batch Failed", b.error || "An error occurred during the batch.");
          }
          if (onSuccess) onSuccess();
        }
      } catch {
        // Poll errors are non-fatal — keep polling unless the batch is done
      }
    };

    // Poll every 3 seconds
    pollTimerRef.current = setTimeout(poll, 3000);

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, batchId]);

  function clearPollTimer() {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  function resetModal() {
    setPhase("configure");
    setBatchId(null);
    setTotal(0);
    setSent(0);
    setFailed(0);
    setPending(0);
    setBatchStatus("");
    setBatchError(null);
    setFinalMessage(null);
    clearPollTimer();
  }

  function handleClose() {
    clearPollTimer();
    resetModal();
    onClose();
  }

  const handleSend = async () => {
    try {
      setIsSending(true);
      setBatchError(null);
      const res = await sendOutreachEmails({
        limit: isSpecificSelection ? undefined : batchLimit,
        leadIds: isSpecificSelection ? selectedLeadIds : undefined,
        dryRun: isDryRun,
        templateId: activeTemplateId || undefined,
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to start batch.");
      }

      setBatchId(res.batchId || null);
      setTotal(res.results.total);
      setSent(res.results.sent || 0);
      setFailed(res.results.failed || 0);
      setPending(res.results.pending ?? res.results.total);
      setBatchStatus(res.status || "PROCESSING");
      setPhase("sending");
    } catch (err: any) {
      toast.error(
        "Outreach Error",
        err.message || "Failed to process email batch."
      );
      setBatchError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const progress = total > 0 ? ((sent + failed) / total) * 100 : 0;
  const statusLabel =
    batchStatus === "PROCESSING"
      ? "Sending..."
      : batchStatus === "COMPLETED"
      ? "Completed"
      : batchStatus === "FAILED"
      ? "Failed"
      : batchStatus || "Starting...";

  const statusColor =
    batchStatus === "COMPLETED"
      ? "text-emerald-400"
      : batchStatus === "FAILED"
      ? "text-rose-400"
      : "text-sky-400";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isDryRun
          ? "🧪 Test Dry-Run Outreach Batch"
          : phase === "sending" || phase === "done"
          ? `🚀 ${isDryRun ? "Dry-Run" : "Live"} Batch: ${statusLabel}`
          : "🚀 Confirm Live Batch Outreach"
      }
      description={activeTemplateId === "freelancingStores"
        ? "Send portfolio focused outreach with no resume/CV attached"
        : activeTemplateName
          ? `Send ${activeTemplateName} outreach with your resume attached`
          : "Send using the active template and its attachment settings"}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-slate-300">
        {/* Warning / Notice Card */}
        {phase === "configure" && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isDryRun
                ? "bg-sky-950/60 border-sky-800/60 text-sky-200"
                : "bg-amber-950/60 border-amber-800/60 text-amber-200"
            }`}
          >
            {isDryRun ? (
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-[11px] leading-relaxed">
              {isDryRun ? (
                <p>
                  <strong>Dry Run Enabled:</strong> Emails will be simulated and validated without dispatching real messages through Gmail SMTP.
                </p>
              ) : (
                <p>
                  <strong>Live Mode:</strong> You are about to send <strong>{targetCount} real emails</strong> via Gmail SMTP{activeTemplateId === "freelancingStores" ? " without a resume/CV attachment" : activeTemplateId ? " with your resume attached" : " using the active template's attachment settings"}.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Live Progress View */}
        {(phase === "sending" || phase === "done") && (
          <div className="space-y-3">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-semibold uppercase tracking-wide ${statusColor}`}>
                  {statusLabel}
                </span>
                <span className="text-slate-400">
                  {sent + failed} / {total} processed
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    batchStatus === "COMPLETED"
                      ? "bg-emerald-500"
                      : batchStatus === "FAILED"
                      ? "bg-rose-500"
                      : "bg-sky-500 animate-pulse"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/50 p-2.5 text-center">
                <div className="text-lg font-bold text-emerald-400">{sent}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Sent</div>
              </div>
              <div className="rounded-lg bg-rose-950/40 border border-rose-800/50 p-2.5 text-center">
                <div className="text-lg font-bold text-rose-400">{failed}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Failed</div>
              </div>
              <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-2.5 text-center">
                <div className="text-lg font-bold text-slate-300">{pending}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Pending</div>
              </div>
            </div>

            {/* Final message */}
            {phase === "done" && finalMessage && (
              <div
                className={`p-3 rounded-lg border text-[11px] ${
                  batchStatus === "COMPLETED"
                    ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                    : "bg-rose-950/40 border-rose-800/50 text-rose-300"
                }`}
              >
                {finalMessage}
              </div>
            )}

            {/* Error during sending */}
            {batchError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-[11px]">
                <span className="font-semibold">Error: </span>
                {batchError}
              </div>
            )}
          </div>
        )}

        {/* Phase: Configure */}
        {phase === "configure" && (
          <>
            {/* Batch Size Selector */}
            {!isSpecificSelection && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Batch Size (from ready queue of {totalReadyCount} leads):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 25, "all"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBatchLimit(val as any)}
                      className={`py-2 rounded-lg font-bold text-xs border transition-all ${
                        batchLimit === val
                          ? "bg-sky-500 text-slate-950 border-sky-400 shadow-sm"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {val === "all" ? "All Queue" : `${val} Leads`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode Toggle */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-[11px] text-slate-300">
              Email template: <strong className="text-sky-300">{activeTemplateName || "currently selected on the server"}</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block text-xs">Simulate only (Dry Run)</span>
                <span className="text-[10px] text-slate-400">Safe test mode without sending real emails</span>
              </div>
              <input
                type="checkbox"
                checked={isDryRun}
                onChange={(e) => setIsDryRun(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
              />
            </div>

            {/* Safety checklist */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strict Evidence-Based Contacts (0% synthetic / guessed emails)</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Previously contacted companies permanently excluded</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>5,000ms delay per email rate limiter enabled</span>
              </div>
            </div>

            {/* Error display */}
            {batchError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-[11px]">
                <span className="font-semibold">Error: </span>
                {batchError}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSending}
          >
            {phase === "sending" ? "Close" : "Cancel"}
          </Button>
          {phase === "configure" && (
            <Button
              variant={isDryRun ? "secondary" : "primary"}
              size="sm"
              onClick={handleSend}
              isLoading={isSending}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              {isDryRun ? `Run Dry-Run (${targetCount})` : `Confirm & Send (${targetCount} Live)`}
            </Button>
          )}
          {phase === "done" && (
            <Button
              variant="primary"
              size="sm"
              onClick={resetModal}
            >
              Send Another Batch
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
