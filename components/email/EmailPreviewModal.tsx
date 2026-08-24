"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Lead, EmailPreviewData } from "@/types";
import { fetchEmailPreview, sendOutreachEmails } from "@/lib/api/email";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Send, FileText, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface EmailPreviewModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EmailPreviewModal({ lead, isOpen, onClose, onSuccess }: EmailPreviewModalProps) {
  const [preview, setPreview] = useState<EmailPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!lead || !isOpen) {
      setPreview(null);
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetchEmailPreview(lead.id);
        setPreview(res);
      } catch (err: any) {
        toast.error("Preview Error", err.message || "Failed to generate email preview.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [lead, isOpen]);

  const handleSendLive = async () => {
    if (!lead) return;
    try {
      setIsSending(true);
      const res = await sendOutreachEmails({
        leadIds: [lead.id],
        dryRun: false,
      });
      toast.success("Email Sent", `Personalized email dispatched to ${preview?.to}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Send Error", err.message || "Failed to dispatch email.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendDryRun = async () => {
    if (!lead) return;
    try {
      setIsSending(true);
      await sendOutreachEmails({
        leadIds: [lead.id],
        dryRun: true,
      });
      toast.info("Simulation Successful", `Simulated email sending to ${preview?.to}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Simulation Error", err.message || "Failed to simulate email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalized Outreach Email Preview"
      description={`Generated tailored application for ${lead?.name || "Company"}`}
      maxWidth="2xl"
    >
      {isLoading || !preview ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4 text-xs text-slate-200">
          {/* Metadata Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">To:</span>
                <span className="font-mono text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                  {preview.to}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Confidence: {preview.confidence}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 font-semibold">Subject:</span>
              <span className="text-slate-100 font-medium">{preview.subject}</span>
            </div>
          </div>

          {/* Body Preview */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-[320px] overflow-y-auto">
            <pre className="font-sans whitespace-pre-wrap text-slate-300 text-xs leading-relaxed">
              {preview.text}
            </pre>
          </div>

          {/* Attachment Pill */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-[11px]">{preview.resumeAttachment}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Auto-Attached PDF
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSendDryRun}
              isLoading={isSending}
            >
              🧪 Test (Dry Run)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendLive}
              isLoading={isSending}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              🚀 Send Live Email
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
