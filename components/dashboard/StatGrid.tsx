import React from "react";
import { CampaignStats } from "@/types";
import { Users, MailCheck, Send, ShieldAlert, Sparkles, Building2, UserCheck, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatGridProps {
  stats: CampaignStats | null;
  isLoading?: boolean;
}

export function StatGrid({ stats, isLoading }: StatGridProps) {
  const cards = [
    {
      title: "Total Discovered",
      value: stats?.totalDiscovered ?? "—",
      sub: `${stats?.candidates ?? 0} active candidates`,
      icon: Building2,
      color: "text-slate-100",
      iconColor: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Employee Size Verified",
      value: stats?.employeeVerified ?? stats?.qualified ?? "—",
      sub: "≥ 30 Employees verified",
      icon: UserCheck,
      color: "text-emerald-400",
      iconColor: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Real Public Contacts",
      value: stats?.totalContacts ?? "—",
      sub: `${stats?.highConfidence ?? 0} HIGH confidence`,
      icon: MailCheck,
      color: "text-sky-400",
      iconColor: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Ready for Outreach",
      value: stats?.readyToSend ?? "—",
      sub: "Verified & uncontacted",
      icon: Users,
      color: "text-amber-400",
      iconColor: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Emails Sent",
      value: stats?.sent ?? "—",
      sub: `${stats?.failed ?? 0} failed / 0 spam`,
      icon: Send,
      color: "text-indigo-400",
      iconColor: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Excluded / Too Low",
      value: (stats?.excluded ?? 0) + (stats?.employeeTooLow ?? 0),
      sub: `${stats?.employeeTooLow ?? 0} < 30 employees, ${stats?.excluded ?? 0} blacklisted`,
      icon: ShieldAlert,
      color: "text-rose-400",
      iconColor: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card
            key={i}
            className="flex items-center justify-between p-5 hover:border-slate-700 transition-all hover:translate-y-[-1px]"
          >
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                {isLoading ? "..." : card.value}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{card.sub}</p>
            </div>
            <div className={`p-3 rounded-xl border ${card.bg}`}>
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
