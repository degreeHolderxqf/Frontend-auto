import React from "react";
import { cn } from "@/lib/utils";

export function LeadScoreBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-slate-500 font-medium">N/A</span>;
  }

  let colorClass = "bg-slate-800 text-slate-300 border-slate-700";
  if (score >= 85) {
    colorClass = "bg-emerald-950/80 text-emerald-300 border-emerald-700/80";
  } else if (score >= 70) {
    colorClass = "bg-sky-950/80 text-sky-300 border-sky-700/80";
  } else if (score >= 50) {
    colorClass = "bg-amber-950/80 text-amber-300 border-amber-700/80";
  } else {
    colorClass = "bg-rose-950/80 text-rose-300 border-rose-700/80";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs",
        colorClass
      )}
    >
      {score}/100
    </span>
  );
}
