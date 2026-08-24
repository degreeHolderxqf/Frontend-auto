"use client";

import React, { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api/stats";
import { Activity, ShieldCheck, RefreshCw } from "lucide-react";
import { MobileNav } from "./MobileNav";

export function Header() {
  const [health, setHealth] = useState<{ status: string; uptime: number; mode: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    try {
      setIsChecking(true);
      const res = await fetchHealth();
      setHealth(res);
    } catch {
      setHealth(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">Candidate:</span>
          <span>Shopify Developer (3 Yrs Exp)</span>
        </div>
      </div>

      {/* Backend Status Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={checkStatus}
          title="Refresh backend status"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin text-sky-400" : ""}`} />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          {health ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium hidden sm:inline">Backend API:</span>
              <span className="text-emerald-400 font-semibold">Online</span>
              <span className="text-slate-400 text-[10px] hidden md:inline">
                ({health.mode === "DRY_RUN" ? "Simulation" : "Live"})
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 font-medium">Connecting...</span>
            </>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Strict No-Guess Contact Rule Active</span>
        </div>
      </div>
    </header>
  );
}
