"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Lead, WhatsAppPreview } from "@/types";
import { fetchWhatsAppPreview, sendWhatsAppMessage } from "@/lib/api/whatsapp";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { MessageSquare, Send, CheckCircle2, Phone, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface WhatsAppPreviewModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WhatsAppPreviewModal({ lead, isOpen, onClose, onSuccess }: WhatsAppPreviewModalProps) {
  const [preview, setPreview] = useState<WhatsAppPreview | null>(null);
  const [customText, setCustomText] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!lead || !isOpen) {
      setPreview(null);
      setCustomText("");
      setCustomPhone("");
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWhatsAppPreview(lead.id);
        setPreview(res);
        setCustomText(res.text);
        setCustomPhone(res.phone || lead.normalized_phone || lead.phone || "");
      } catch (err: any) {
        toast.error("Preview Error", err.message || "Failed to generate WhatsApp preview.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [lead, isOpen]);

  const handleSend = async () => {
    if (!lead) return;
    if (!customPhone.trim()) {
      toast.error("Missing Phone", "Please enter a valid target phone number.");
      return;
    }

    try {
      setIsSending(true);
      const res = await sendWhatsAppMessage(lead.id, customPhone.trim(), customText.trim());
      if (res.success) {
        if (res.dryRun) {
          toast.info("Simulation Sent", `Simulated WhatsApp dispatch to ${customPhone} (DRY RUN)`);
        } else {
          toast.success("WhatsApp Message Sent", `Message successfully delivered to ${customPhone}`);
        }
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Ensure error is always a string (never [object Object])
        const errMsg = typeof res.error === "string" ? res.error
          : res.error ? JSON.stringify(res.error)
          : "Failed to dispatch WhatsApp message.";
        toast.error("Delivery Failed", errMsg);
      }
    } catch (err: any) {
      const errMsg = typeof err?.message === "string" ? err.message
        : err ? String(err) : "Failed to send WhatsApp message.";
      toast.error("Send Error", errMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalized WhatsApp Outreach Preview"
      description={`Direct WhatsApp message preview for ${lead?.name || "Company"}`}
      maxWidth="2xl"
    >
      {isLoading || !preview ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4 text-xs text-slate-200">
          {/* Recipient & Phone Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Recipient:</span>
                <span className="font-semibold text-slate-100">{preview.recipientName}</span>
                <span className="text-slate-500">({preview.companyName})</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-emerald-400" /> WhatsApp Ready
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Phone className="w-3 h-3 text-sky-400" /> Target Phone:
              </span>
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="+919876543210"
                className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-sky-400 font-mono text-xs font-semibold focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Editable Message Body */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-semibold block">Message Content (Editable):</label>
            <textarea
              rows={8}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-sans text-slate-200 text-xs leading-relaxed focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Messages are dispatched via Evolution Go. Duplicate check prevents re-contacting the same lead.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSend}
              isLoading={isSending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send WhatsApp Message
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
