import React from "react";
import { CampaignStats, DashboardMetricKey } from "@/types";
import { Users, MailCheck, Send, ShieldAlert, Building2, UserCheck, Store } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatGridProps {
  stats: CampaignStats | null;
  isLoading?: boolean;
  selectedMetric?: DashboardMetricKey | null;
  onSelectMetric?: (metric: DashboardMetricKey) => void;
}

export function StatGrid({ stats, isLoading, selectedMetric, onSelectMetric }: StatGridProps) {
  const cards: Array<{
    key: DashboardMetricKey;
    title: string;
    value: string | number;
    sub: string;
    icon: typeof Building2;
    color: string;
    iconColor: string;
    bg: string;
  }> = [
    {
      key: "discovered",
      title: "Total Discovered",
      value: stats?.totalDiscovered ?? "—",
      sub: `${stats?.candidates ?? 0} active candidates`,
      icon: Building2,
      color: "text-slate-100",
      iconColor: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      key: "merchantContacts",
      title: "Merchant Stores With Contacts",
      value: `${stats?.merchantStoresWithContact ?? 0} / ${stats?.merchantStores ?? 0}`,
      sub: `${stats?.merchantStoresWithEmail ?? 0} email · ${stats?.merchantStoresWithPhone ?? 0} phone · ${stats?.merchantStoresWithWhatsApp ?? 0} WhatsApp`,
      icon: Store,
      color: "text-violet-400",
      iconColor: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      key: "employeeVerified",
      title: "Employee Size Verified",
      value: stats?.employeeVerified ?? stats?.qualified ?? "—",
      sub: stats?.minEmployeeCount
        ? `≥ ${stats.minEmployeeCount} employees verified`
        : "Employee-size filter disabled",
      icon: UserCheck,
      color: "text-emerald-400",
      iconColor: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      key: "emailContacts",
      title: "Email Contact Records",
      value: stats?.totalContacts ?? "—",
      sub: `${stats?.highConfidence ?? 0} HIGH confidence`,
      icon: MailCheck,
      color: "text-sky-400",
      iconColor: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      key: "readyToSend",
      title: "Ready for Outreach",
      value: stats?.readyToSend ?? "—",
      sub: "Uncontacted emails meeting filters",
      icon: Users,
      color: "text-amber-400",
      iconColor: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      key: "emailsSent",
      title: "Emails Sent",
      value: stats?.sent ?? "—",
      sub: `${stats?.failed ?? 0} failed / 0 spam`,
      icon: Send,
      color: "text-indigo-400",
      iconColor: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      key: "excludedTooLow",
      title: "Excluded / Too Low",
      value: stats?.excludedOrTooLow ?? ((stats?.excluded ?? 0) + (stats?.employeeTooLow ?? 0)),
      sub: `${stats?.employeeTooLow ?? 0} < 30 employees, ${stats?.excluded ?? 0} blacklisted`,
      icon: ShieldAlert,
      color: "text-rose-400",
      iconColor: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedMetric === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectMetric?.(card.key)}
            disabled={isLoading || !onSelectMetric}
            aria-label={`View ${card.title} records`}
            aria-pressed={isSelected}
            className="w-full text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-wait"
          >
            <Card
              className={`h-full flex items-center justify-between p-5 transition-all hover:translate-y-[-1px] hover:border-slate-600 cursor-pointer ${
                isSelected ? "border-sky-500/60 ring-1 ring-sky-500/30" : ""
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                  {isLoading ? "..." : card.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{card.sub}</p>
                <p className="text-[10px] text-sky-500/80 mt-2">Click to view records</p>
              </div>
              <div className={`p-3 rounded-xl border ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
