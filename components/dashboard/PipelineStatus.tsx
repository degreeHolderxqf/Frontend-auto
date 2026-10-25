import React from "react";
import { CampaignStats } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Database, Filter, Search, CheckCircle2, Send, ShoppingBag, Building2 } from "lucide-react";

export function PipelineStatus({ stats }: { stats: CampaignStats | null }) {
  const steps = [
    {
      label: "Discovery",
      count: stats?.totalDiscovered ?? 0,
      desc: "Partner, app, and merchant records",
      icon: Database,
    },
    {
      label: "Exclusions Filter",
      count: (stats?.totalDiscovered ?? 0) - (stats?.excluded ?? 0),
      desc: "75+ blacklist filtered",
      icon: Filter,
    },
    {
      label: "Multi-Source Research",
      count: stats?.totalContacts ?? 0,
      desc: "Websites & careers emails",
      icon: Search,
    },
    {
      label: "Scored & Ready",
      count: stats?.readyToSend ?? 0,
      desc: "Uncontacted email contacts",
      icon: CheckCircle2,
    },
    {
      label: "Outreach Dispatched",
      count: stats?.sent ?? 0,
      desc: "Personalized emails sent",
      icon: Send,
    },
  ];

  // Build source breakdown from bySource array
  const sourceBreakdown = stats?.bySource ?? [];
  const appStoreCount = sourceBreakdown.find((s) => s.source === "SHOPIFY_APP_STORE")?.count ?? 0;
  const partnerCount = sourceBreakdown.find((s) => s.source === "SHOPIFY_PARTNER_DIRECTORY")?.count ?? 0;
  const merchantCount = sourceBreakdown.find((s) => s.source === "MERCHANT_UPLOAD")?.count ?? 0;
  const totalFromBreakdown = sourceBreakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-none mb-6">
        <div>
          <CardTitle>Lead Generation Pipeline Funnel</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-stage discovery, filtration, evidence-based contact research, and outreach status.
          </p>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  Step 0{i + 1}
                </span>
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-100">{step.count}</p>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">{step.label}</p>
                <p className="text-[11px] text-slate-500 mt-1">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source Breakdown */}
      {totalFromBreakdown > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Source Breakdown
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-950/40 border border-purple-900/60">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold text-purple-300">
                App Store: {appStoreCount}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-950/40 border border-sky-900/60">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs font-bold text-sky-300">
                Partner Directory: {partnerCount}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-900/60">
              <span className="text-xs font-bold text-emerald-300">
                Merchant Stores: {merchantCount}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold text-slate-400">
                Total: {totalFromBreakdown}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
