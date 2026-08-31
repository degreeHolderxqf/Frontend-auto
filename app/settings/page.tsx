"use client";

import React, { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api/stats";
import { fetchSettings, updateSettings, testSmtpConnection } from "@/lib/api/settings";
import { testEvolutionApi } from "@/lib/api/whatsapp";
import { RENDER_BACKEND_URL } from "@/lib/api/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { AppSettings } from "@/types";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Shield,
  Mail,
  User,
  Send,
  Save,
  Globe,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Sliders,
  Zap
} from "lucide-react";

export default function SettingsPage() {
  const [health, setHealth] = useState<{ status: string; uptime: number; mode: string } | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingEvolution, setIsTestingEvolution] = useState(false);
  const [evolutionTestResult, setEvolutionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const toast = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [healthRes, settingsRes] = await Promise.allSettled([fetchHealth(), fetchSettings()]);

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value);
      } else {
        setHealth(null);
      }

      if (settingsRes.status === "fulfilled") {
        setSettings(settingsRes.value);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      const payload: Partial<AppSettings> = {
        ...settings,
        smtpPass: newPassword.trim() ? newPassword.trim() : settings.smtpPass
      };

      const res = await updateSettings(payload);
      setSettings(res.settings);
      setNewPassword("");
      toast.success("Settings Saved", "All configuration and profile parameters updated successfully.");
      
      // Re-fetch health to update sending mode
      fetchHealth().then(setHealth).catch(() => {});
    } catch (err: any) {
      toast.error("Failed to Save", err.message || "An error occurred while updating settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!settings) return;

    try {
      setIsTestingSmtp(true);
      setSmtpTestResult(null);

      const smtpPayload = {
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpSecure: settings.smtpSecure,
        smtpUser: settings.smtpUser,
        smtpPass: newPassword.trim() ? newPassword.trim() : settings.smtpPass
      };

      const res = await testSmtpConnection(smtpPayload);
      if (res.success) {
        setSmtpTestResult({
          success: true,
          message: res.message || "SMTP connection verified successfully! Authentication is valid."
        });
        toast.success("SMTP Connection Verified", "Successfully connected and authenticated with mail server.");
      } else {
        setSmtpTestResult({
          success: false,
          message: res.error || "SMTP authentication failed. Please check host, username, and app password."
        });
        toast.error("SMTP Test Failed", res.error || "Failed to authenticate with mail server.");
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.message || "Network error while testing SMTP."
      });
      toast.error("SMTP Test Error", err.message || "Unable to test SMTP connection.");
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleTestEvolution = async () => {
    if (!settings) return;

    try {
      setIsTestingEvolution(true);
      setEvolutionTestResult(null);

      const evolutionPayload = {
        evolutionApiUrl: settings.evolutionApiUrl || "https://evolution-api-latest-h0yy.onrender.com",
        evolutionApiKey: settings.evolutionApiKey,
        evolutionInstanceName: settings.evolutionInstanceName || "job-search"
      };

      const res = await testEvolutionApi(evolutionPayload);
      if (res.success) {
        setEvolutionTestResult({
          success: true,
          message: res.message || `Evolution API connection verified! (Version: ${res.version || "2.x"})`
        });
        toast.success("Evolution API Verified", res.message || "Successfully connected to Evolution API.");
      } else {
        setEvolutionTestResult({
          success: false,
          message: (res as any).error || "Failed to connect to Evolution API."
        });
        toast.error("Evolution API Test Failed", (res as any).error || "Failed to reach Evolution API.");
      }
    } catch (err: any) {
      setEvolutionTestResult({
        success: false,
        message: err.message || "Network error while testing Evolution API."
      });
      toast.error("Evolution API Test Error", err.message || "Unable to test Evolution API connection.");
    } finally {
      setIsTestingEvolution(false);
    }
  };

  const isEmployeeThresholdEnabled = settings?.minEmployeeCount !== null && settings?.minEmployeeCount !== undefined;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            System & User Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure SMTP credentials, candidate outreach profile, employee verification rules, and lead discovery parameters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={loadData} isLoading={isLoading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Reload
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving} disabled={isLoading || !settings}>
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Settings
          </Button>
        </div>
      </div>

      {isLoading || !settings ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 h-64 animate-pulse bg-slate-900/40" />
          <Card className="p-6 h-64 animate-pulse bg-slate-900/40" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Candidate / User Profile Card */}
            <Card className="p-6 space-y-4">
              <CardHeader className="p-0 pb-3 border-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-400" />
                  <CardTitle>Candidate Outreach Profile</CardTitle>
                </div>
                <span className="text-[11px] text-slate-500">Used in generated emails</span>
              </CardHeader>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Full Name:</label>
                    <input
                      type="text"
                      value={settings.candidateName || ""}
                      onChange={(e) => setSettings({ ...settings, candidateName: e.target.value })}
                      placeholder="e.g. Himanshu Soni"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Target Role / Headline:</label>
                    <input
                      type="text"
                      value={settings.candidateRole || ""}
                      onChange={(e) => setSettings({ ...settings, candidateRole: e.target.value })}
                      placeholder="e.g. Shopify Developer"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Experience Level:</label>
                    <input
                      type="text"
                      value={settings.candidateExperience || ""}
                      onChange={(e) => setSettings({ ...settings, candidateExperience: e.target.value })}
                      placeholder="e.g. 3 years"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Contact Email:</label>
                    <input
                      type="email"
                      value={settings.candidateEmail || ""}
                      onChange={(e) => setSettings({ ...settings, candidateEmail: e.target.value })}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Phone Number (Optional):</label>
                  <input
                    type="text"
                    value={settings.candidatePhone || ""}
                    onChange={(e) => setSettings({ ...settings, candidatePhone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Key Technical Skills (one per line):
                  </label>
                  <textarea
                    rows={4}
                    value={Array.isArray(settings.candidateSkills) ? settings.candidateSkills.join("\n") : ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        candidateSkills: e.target.value.split("\n")
                      })
                    }
                    placeholder="Liquid, Theme Customization&#10;Node.js, React, Remix&#10;Shopify GraphQL & REST APIs"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </Card>

            {/* 2. SMTP Server Configuration Card */}
            <Card className="p-6 space-y-4">
              <CardHeader className="p-0 pb-3 border-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <CardTitle>SMTP Email Server & Credentials</CardTitle>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleTestSmtp}
                  isLoading={isTestingSmtp}
                  className="h-7 text-xs px-2.5"
                >
                  <Send className="w-3 h-3 mr-1 text-sky-400" />
                  Test SMTP
                </Button>
              </CardHeader>

              {smtpTestResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    smtpTestResult.success
                      ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-300"
                      : "bg-rose-950/60 border-rose-800/60 text-rose-300"
                  }`}
                >
                  {smtpTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block">
                      {smtpTestResult.success ? "Connection Verified" : "Authentication Failed"}
                    </span>
                    <span className="text-[11px] opacity-90">{smtpTestResult.message}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-xs text-slate-300">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-slate-400 font-semibold block mb-1">SMTP Host:</label>
                    <input
                      type="text"
                      value={settings.smtpHost || ""}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Port:</label>
                    <input
                      type="number"
                      value={settings.smtpPort || 587}
                      onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value, 10) || 587 })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">SMTP Username / Email:</label>
                  <input
                    type="email"
                    value={settings.smtpUser || ""}
                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">SMTP App Password:</label>
                    <span className="text-[10px] text-slate-500">
                      {settings.smtpPass ? "✓ Password configured" : "Not set"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={settings.smtpPass ? "•••••••• (Leave blank to keep existing)" : "Enter App Password"}
                      className="w-full px-3 py-2 pr-10 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    For Gmail, use a 16-character <strong>Google App Password</strong> (generated via Google Account &gt; Security &gt; 2-Step Verification).
                  </p>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Sender &quot;From&quot; Header:</label>
                  <input
                    type="text"
                    value={settings.emailFrom || ""}
                    onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                    placeholder='Himanshu Soni <himanshusoni7899@gmail.com>'
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </Card>

            {/* 3. Lead Discovery & Targeting Card */}
            <Card className="p-6 space-y-4">
              <CardHeader className="p-0 pb-3 border-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <CardTitle>Discovery &amp; Relevance Targeting</CardTitle>
                </div>
              </CardHeader>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Shopify Directory URL:</label>
                  <input
                    type="text"
                    value={settings.shopifyDirectoryUrl || ""}
                    onChange={(e) => setSettings({ ...settings, shopifyDirectoryUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-[11px] focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Target Country:</label>
                    <input
                      type="text"
                      value={settings.targetCountry || "India"}
                      onChange={(e) => setSettings({ ...settings, targetCountry: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Target Leads:</label>
                    <input
                      type="number"
                      value={settings.targetLeads || 100}
                      onChange={(e) => setSettings({ ...settings, targetLeads: parseInt(e.target.value, 10) || 100 })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Min App Score:</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={settings.minAppRelevanceScore || 70}
                      onChange={(e) => setSettings({ ...settings, minAppRelevanceScore: parseInt(e.target.value, 10) || 70 })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. Employee Size Verification Card */}
            <Card className="p-6 space-y-4">
              <CardHeader className="p-0 pb-3 border-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <CardTitle>Employee Size Verification</CardTitle>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isEmployeeThresholdEnabled
                    ? "text-emerald-400 bg-emerald-950/80 border-emerald-800"
                    : "text-slate-400 bg-slate-900 border-slate-800"
                }`}>
                  {isEmployeeThresholdEnabled ? `≥ ${settings.minEmployeeCount} Required` : "Optional / Disabled"}
                </span>
              </CardHeader>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-200">Enforce Minimum Employee Threshold</p>
                    <p className="text-[11px] text-slate-400">
                      When enabled, only companies meeting this minimum verified headcount become eligible for outreach.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEmployeeThresholdEnabled}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        minEmployeeCount: e.target.checked ? 30 : null
                      });
                    }}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                {isEmployeeThresholdEnabled && (
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">
                      Minimum Verified Employees (Threshold):
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={settings.minEmployeeCount || 30}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minEmployeeCount: parseInt(e.target.value, 10) || 30
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none font-semibold text-sky-400"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Companies with verified headcount &ge; {settings.minEmployeeCount || 30} will qualify. Ambiguous ranges (e.g. 11-50) require secondary confirmation.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* 5. Evolution API WhatsApp Settings Card */}
            <Card className="p-6 space-y-4 lg:col-span-2">
              <CardHeader className="p-0 pb-3 border-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <CardTitle>Evolution API WhatsApp Configuration</CardTitle>
                </div>
                <span className="text-[11px] text-slate-400">Evolution API Gateway (v2.3.7)</span>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-300">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Evolution API URL:</label>
                  <input
                    type="text"
                    value={settings.evolutionApiUrl || "https://evolution-api-latest-h0yy.onrender.com"}
                    onChange={(e) => setSettings({ ...settings, evolutionApiUrl: e.target.value })}
                    placeholder="https://evolution-api-latest-h0yy.onrender.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Instance Name:</label>
                  <input
                    type="text"
                    value={settings.evolutionInstanceName || "job-search"}
                    onChange={(e) => setSettings({ ...settings, evolutionInstanceName: e.target.value })}
                    placeholder="job-search"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Evolution API Key (Optional):</label>
                  <input
                    type="password"
                    value={settings.evolutionApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, evolutionApiKey: e.target.value })}
                    placeholder={settings.evolutionApiKey ? "•••••••• (Leave blank to keep)" : "Enter API Key"}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">WhatsApp Enabled:</span>
                    <span className="text-[11px] text-slate-400">
                      {settings.whatsAppEnabled !== false ? "✓ Enabled in UI & Workflows" : "✕ Disabled"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.whatsAppEnabled !== false}
                    onChange={(e) => setSettings({ ...settings, whatsAppEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">WhatsApp Dry Run:</span>
                    <span className="text-[11px] text-slate-400">
                      {settings.whatsAppDryRun !== false ? "🧪 Simulation (No real WhatsApp)" : "🚀 Real WhatsApp Messages"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.whatsAppDryRun !== false}
                    onChange={(e) => setSettings({ ...settings, whatsAppDryRun: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Anti-Ban Delay Between WhatsApp (ms):</label>
                  <input
                    type="number"
                    min={5000}
                    value={settings.whatsAppDelayMs || 15000}
                    onChange={(e) => setSettings({ ...settings, whatsAppDelayMs: parseInt(e.target.value, 10) || 15000 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Test Evolution API Action & Result Feedback */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestEvolution}
                    isLoading={isTestingEvolution}
                    className="text-xs h-8 bg-slate-950 hover:bg-slate-900 border-slate-700 text-emerald-300"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Test Evolution API Connection
                  </Button>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Verifies connection to {settings.evolutionApiUrl || "https://evolution-api-latest-h0yy.onrender.com"}
                  </span>
                </div>

                {evolutionTestResult && (
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border animate-fade-in ${
                      evolutionTestResult.success
                        ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                        : "bg-rose-950/60 border-rose-800 text-rose-300"
                    }`}
                  >
                    {evolutionTestResult.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    )}
                    <span className="truncate max-w-sm">{evolutionTestResult.message}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* 6. Outreach & Safety Guardrails Card */}
            <Card className="p-6 space-y-4 lg:col-span-2">
              <CardHeader className="p-0 pb-3 border-none flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <CardTitle>Safety &amp; Sending Guardrails</CardTitle>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Dry Run Mode:</span>
                    <span className="text-[11px] text-slate-400">
                      {settings.dryRun ? "🧪 Simulation (No real emails)" : "🚀 Live Email Delivery"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dryRun}
                    onChange={(e) => setSettings({ ...settings, dryRun: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Batch Send Limit:</label>
                  <input
                    type="number"
                    value={settings.sendLimit || 50}
                    onChange={(e) => setSettings({ ...settings, sendLimit: parseInt(e.target.value, 10) || 50 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Delay Between Emails (ms):</label>
                  <input
                    type="number"
                    value={settings.emailDelayMs || 5000}
                    onChange={(e) => setSettings({ ...settings, emailDelayMs: parseInt(e.target.value, 10) || 5000 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Batch Size:</label>
                  <input
                    type="number"
                    value={settings.batchSize || 10}
                    onChange={(e) => setSettings({ ...settings, batchSize: parseInt(e.target.value, 10) || 10 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" size="md" onClick={loadData}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              <Save className="w-4 h-4 mr-1.5" />
              Save All Settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
