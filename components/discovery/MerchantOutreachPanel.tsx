"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import {
  getMerchantQueueStatus,
  MerchantQueueBatch,
  previewMerchantMessage,
  startMerchantQueue
} from "@/lib/api/merchant";
import { Eye, Mail, MessageSquare, Send, RefreshCw } from "lucide-react";

interface MerchantOutreachPanelProps {
  leadIds: number[];
  onQueued?: () => void;
}

export function MerchantOutreachPanel({ leadIds, onQueued }: MerchantOutreachPanelProps) {
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [dryRun, setDryRun] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewMerchantMessage>> | null>(null);
  const [batch, setBatch] = useState<MerchantQueueBatch | null>(null);
  const toast = useToast();
  const counts = batch?.results || batch;

  const handlePreview = async () => {
    const leadId = leadIds[0];
    if (!leadId) {
      toast.warning("Select a store", "Select at least one merchant store before previewing a pitch.");
      return;
    }
    try {
      setIsLoading(true);
      setPreview(await previewMerchantMessage(leadId, channel));
    } catch (error: any) {
      toast.error("Preview failed", error.message || "Could not create a personalized merchant pitch.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueue = async () => {
    if (leadIds.length === 0) {
      toast.warning("Select stores", "Select one or more merchant stores before starting the queue.");
      return;
    }
    if (!dryRun && !window.confirm(`Send ${channel} messages to ${leadIds.length} stores? Messages will be separated by randomized 2-5 minute delays.`)) {
      return;
    }
    try {
      setIsLoading(true);
      const response = await startMerchantQueue(leadIds, channel, dryRun, preview?.templateId);
      setBatch(response.batch);
      toast.success(
        dryRun ? "Merchant dry-run queued" : "Merchant live queue started",
        `${response.batch?.total || leadIds.length} selected. The queue serializes messages with a 2-5 minute delay.`
      );
      if (onQueued) onQueued();
    } catch (error: any) {
      toast.error("Could not start merchant queue", error.message || "The merchant message queue failed to start.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshBatch = async () => {
    if (!batch?.id) return;
    try {
      setIsLoading(true);
      const response = await getMerchantQueueStatus(batch.id);
      setBatch(response.batch);
    } catch (error: any) {
      toast.error("Could not refresh queue", error.message || "Failed to load merchant queue status.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-100">Review &amp; Pitch Merchant Stores</h3>
        <p className="mt-1 text-xs text-slate-400">
          Preview the app-personalized pitch, then queue selected stores. Live messages are serialized with 2-5 minute randomized delays.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="merchant-outreach-channel">Message channel</label>
        <select
          id="merchant-outreach-channel"
          value={channel}
          onChange={(event) => {
            setChannel(event.target.value as "email" | "whatsapp");
            setPreview(null);
          }}
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200"
        >
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <label className="inline-flex items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} />
          Dry run (no messages sent)
        </label>
        <span className="text-xs text-slate-400">{leadIds.length} store(s) selected</span>
        <Button variant="secondary" onClick={handlePreview} isLoading={isLoading} disabled={!leadIds.length}>
          <Eye className="w-3.5 h-3.5 mr-1" />
          Preview first selected
        </Button>
        <Button variant="primary" onClick={handleQueue} isLoading={isLoading} disabled={!leadIds.length}>
          {channel === "email" ? <Mail className="w-3.5 h-3.5 mr-1" /> : <MessageSquare className="w-3.5 h-3.5 mr-1" />}
          <Send className="w-3.5 h-3.5 mr-1" />
          Queue selected
        </Button>
      </div>

      {preview && (
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs text-slate-400">
            To: <span className="text-slate-200">{preview.to || "No recipient for this channel"}</span>
          </p>
          {preview.subject && (
            <p className="mt-1 text-xs text-slate-400">
              Subject: <span className="text-slate-200">{preview.subject}</span>
            </p>
          )}
          {preview.channel === "whatsapp" && preview.templateTarget && (
            <p className="mt-1 text-xs text-slate-400">
              Active outreach template: <span className="text-slate-200">{preview.templateTarget}</span>
              {preview.includeResume ? " · Resume will be attached" : " · No resume attachment"}
            </p>
          )}
          <pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-200">
            {preview.text || preview.body}
          </pre>
          {preview.installedApps.length > 0 && (
            <p className="mt-3 text-[11px] text-emerald-300">
              Personalized using: {preview.installedApps.join(", ")}
            </p>
          )}
        </div>
      )}

      {batch && (
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              Batch <code>{batch.id}</code> · {batch.status} · {counts?.pending ?? 0} pending · {counts?.sent ?? 0} sent · {counts?.failed ?? 0} failed · {counts?.skipped ?? 0} skipped
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshBatch} isLoading={isLoading}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh status
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
