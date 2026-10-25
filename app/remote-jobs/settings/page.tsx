"use client";

import React, { useEffect, useState } from "react";
import { fetchRemoteJobSettings, updateRemoteJobSettings } from "@/lib/api/remote-jobs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Settings, Save } from "lucide-react";
import { RemoteJobSettings } from "@/types";

export default function RemoteJobSettingsPage() {
  const [settings, setSettings] = useState<RemoteJobSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await fetchRemoteJobSettings();
      setSettings(data);
    } catch (err: any) {
      toast.error("Error loading settings", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      const updated = await updateRemoteJobSettings(settings);
      setSettings(updated);
      toast.success("Settings saved", "Your remote job settings have been updated.");
    } catch (err: any) {
      toast.error("Error saving settings", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-sky-400" />
            Remote Jobs Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure discovery, scoring thresholds, and auto-apply behavior.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-1.5" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Card title="Discovery">
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div>
              <div className="font-medium text-slate-100">Enable Remote Job Discovery</div>
              <p className="text-sm text-slate-400 mt-0.5">
                Master switch for fetching jobs from external sources.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.remoteJobDiscoveryEnabled}
              onChange={(e) =>
                setSettings({ ...settings, remoteJobDiscoveryEnabled: e.target.checked })
              }
              className="w-4 h-4"
            />
          </label>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <label className="block">
              <div className="font-medium text-slate-100">Max Jobs Per Source</div>
              <p className="text-sm text-slate-400 mt-0.5 mb-2">
                Cap on jobs fetched from a single source per discovery run.
              </p>
              <input
                type="number"
                min={10}
                max={500}
                value={settings.maxRemoteJobsPerSource}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxRemoteJobsPerSource: parseInt(e.target.value, 10) || 100,
                  })
                }
                className="w-32 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
              />
            </label>
          </div>
        </div>
      </Card>

      <Card title="Scoring">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <label className="block">
            <div className="font-medium text-slate-100">Minimum Relevance Score</div>
            <p className="text-sm text-slate-400 mt-0.5 mb-2">
              Jobs below this score are flagged as low relevance.
            </p>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.minRemoteJobRelevanceScore}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  minRemoteJobRelevanceScore: parseInt(e.target.value, 10) || 60,
                })
              }
              className="w-32 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-100"
            />
          </label>
        </div>
      </Card>

      <Card title="Auto Apply (Human in the Loop)">
        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div>
            <div className="font-medium text-slate-100">Default Auto-Apply to OFF</div>
            <p className="text-sm text-slate-400 mt-0.5">
              When enabled, applications are prepared but require manual submission.
              This is the recommended safe default.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoApplyDefault}
            onChange={(e) =>
              setSettings({ ...settings, autoApplyDefault: e.target.checked })
            }
            className="w-4 h-4"
          />
        </label>
        <p className="text-xs text-amber-400 mt-3">
          ⚠ Disabling the human-in-the-loop is discouraged. You remain responsible for every
          application submitted on your behalf.
        </p>
      </Card>
    </div>
  );
}
