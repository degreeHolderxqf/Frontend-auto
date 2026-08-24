"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Compass,
  Send,
  ShieldBan,
  Settings,
  Flame,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/api/client";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Qualified Leads", href: "/leads", icon: Users },
  { label: "Email Outreach", href: "/outreach", icon: Send },
  { label: "Partner Discovery", href: "/discovery", icon: Compass },
  { label: "All Companies", href: "/companies", icon: Building2 },
  { label: "Exclusions", href: "/exclusions", icon: ShieldBan },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");

  useEffect(() => {
    setBaseUrl(getApiBaseUrl());
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-emerald-400 flex items-center justify-center shadow-md shadow-sky-500/20">
          <Flame className="w-4 h-4 text-slate-950" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-tight">Shopify Lead AI</h1>
          <p className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">Partner → HR Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-300"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Export Quick Box */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Lead Exports
          </div>
          <p className="text-[11px] text-slate-400">
            Export the current 26-column qualified database anytime.
          </p>
          <div className="flex gap-2 pt-1">
            <a
              href={`${baseUrl.replace(/\/$/, "")}/download/csv`}
              className="flex-1 text-center py-1 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors border border-slate-700/60"
              download
            >
              CSV
            </a>
            <a
              href={`${baseUrl.replace(/\/$/, "")}/download/xlsx`}
              className="flex-1 text-center py-1 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors border border-slate-700/60"
              download
            >
              Excel
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
