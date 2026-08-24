"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { sendOutreachEmails } from "@/lib/api/email";
import { useToast } from "@/components/ui/Toast";
import { AlertTriangle, Send, ShieldCheck, CheckCircle2 } from "lucide-react";

interface BatchSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds?: number[];
  onSuccess?: () => void;
  totalReadyCount?: number;
}

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
  const toast = useToast();

  const isSpecificSelection = selectedLeadIds.length > 0;
  const targetCount = isSpecificSelection
    ? selectedLeadIds.length
    : batchLimit === "all"
    ? totalReadyCount
    : Math.min(batchLimit, totalReadyCount);

  const handleSend = async () => {
    try {
      setIsSending(true);
      const res = await sendOutreachEmails({
        limit: isSpecificSelection ? undefined : batchLimit,
        leadIds: isSpecificSelection ? selectedLeadIds : undefined,
        dryRun: isDryRun,
      });

      if (isDryRun) {
        toast.info("Simulation Finished", `Simulated sending to ${res.results.sent} leads.`);
      } else {
        toast.success("Batch Outreach Sent", `Dispatched ${res.results.sent} personalized emails successfully.`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Outreach Error", err.message || "Failed to process email batch.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDryRun ? "🧪 Test Dry-Run Outreach Batch" : "🚀 Confirm Live Batch Outreach"}
      description="Send personalized Shopify Developer applications with resume attached"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-slate-300">
        {/* Warning / Notice Card */}
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
                <strong>Live Mode:</strong> You are about to send <strong>{targetCount} real emails</strong> via Gmail SMTP with <code>26_Himanshu-Soni-Shopify.pdf</code> attached.
              </p>
            )}
          </div>
        </div>

        {/* Batch Size Selector if not selection */}
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
            <span>75+ previously contacted companies permanently excluded</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>5,000ms delay per email rate limiter enabled</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            variant={isDryRun ? "secondary" : "primary"}
            size="sm"
            onClick={handleSend}
            isLoading={isSending}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            {isDryRun ? `Run Dry-Run (${targetCount})` : `Confirm & Send (${targetCount} Live)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
