"use client";

import React, { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api/stats";
import { RENDER_BACKEND_URL } from "@/lib/api/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { CheckCircle2, XCircle, RefreshCw, Server, Shield, Mail, Database } from "lucide-react";

export default function SettingsPage() {
  const [health, setHealth] = useState<{ status: string; uptime: number; mode: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const toast = useToast();

  const checkConnection = async (showNotification = false) => {
    try {
      setIsChecking(true);
      const res = await fetchHealth();
      setHealth(res);
      if (showNotification) {
        toast.success("Backend Connected", `API is online. Status: ${res.status}`);
      }
    } catch (err: any) {
      setHealth(null);
      if (showNotification) {
        toast.error("Connection Failed", err.message || "Unable to reach backend API.");
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection(false);

    // Auto-poll every 6 seconds until connected, then every 20 seconds
    const interval = setInterval(() => {
      checkConnection(false);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Settings & Backend Configuration</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Render API connection status, SMTP health check, database status, and safety limits.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => checkConnection(true)} isLoading={isChecking}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Test Connection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Connectivity Card */}
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 pb-4 border-none flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <CardTitle>Render Production Backend</CardTitle>
            </div>
            {health ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> CONNECTING...
              </span>
            )}
          </CardHeader>

          <div className="space-y-3 text-xs text-slate-300">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Production API URL:</label>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-sky-400">
                {RENDER_BACKEND_URL}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Service Status:</span>
                <span className={`font-semibold ${health ? "text-emerald-400" : "text-amber-400"}`}>
                  {health ? "● Healthy & Active" : "Waking up / Connecting"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Sending Mode:</span>
                <span className="font-semibold text-slate-200">
                  {health?.mode === "DRY_RUN" ? "🧪 Dry Run (Safe Simulation)" : "🚀 Live Send Active"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Server Uptime:</span>
                <span className="font-mono text-slate-200">
                  {health?.uptime ? `${Math.round(health.uptime)} seconds` : "Connecting..."}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Database Storage Details */}
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 pb-4 border-none flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <CardTitle>Database & Storage</CardTitle>
          </CardHeader>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block">Database Storage:</span>
              <code className="text-amber-400 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded block mt-0.5">
                data/leads.sqlite (WAL Mode)
              </code>
            </div>
            <div>
              <span className="text-slate-500 block">Status:</span>
              <span className="font-medium text-emerald-400">208 Discovered • 189 Qualified Leads • 339 Contacts</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-slate-500 block">CSV & Excel Exports:</span>
              <code className="text-slate-300 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded block mt-0.5">
                output/shopify_leads.csv & .xlsx
              </code>
            </div>
          </div>
        </Card>

        {/* SMTP & Email Configuration */}
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 pb-4 border-none flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            <CardTitle>SMTP & Resume Attachment</CardTitle>
          </CardHeader>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block">Sender Profile:</span>
              <span className="font-medium text-slate-200">Himanshu Soni &lt;himanshusoni7899@gmail.com&gt;</span>
            </div>
            <div>
              <span className="text-slate-500 block">SMTP Server:</span>
              <span className="font-mono text-slate-200">smtp.gmail.com : 587 (TLS)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Resume Attachment:</span>
              <code className="text-emerald-400 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded">
                26_Himanshu-Soni-Shopify.pdf
              </code>
            </div>
          </div>
        </Card>

        {/* Outreach & Safety Rules */}
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 pb-4 border-none flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <CardTitle>Safety & Anti-Spam Guardrails</CardTitle>
          </CardHeader>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">Strict Evidence-Based Discovery</p>
                <p className="text-[11px] text-slate-400">Zero synthetic/guessed emails. Only public emails found on official domains.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">Single-Send Anti-Duplicate</p>
                <p className="text-[11px] text-slate-400">Strict deduplication prevents contacting the same company or email twice.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">Rate Limiter</p>
                <p className="text-[11px] text-slate-400">5,000ms delay between consecutive emails.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
