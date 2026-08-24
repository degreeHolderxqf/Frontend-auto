import React from "react";
import { Exclusion } from "@/types";
import { ShieldBan, Globe, Building2 } from "lucide-react";

export function ExclusionsTable({ exclusions }: { exclusions: Exclusion[] }) {
  if (exclusions.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
        <ShieldBan className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="font-semibold text-slate-300">No exclusions listed</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
          <tr>
            <th className="p-3.5">Company Name</th>
            <th className="p-3.5">Domain</th>
            <th className="p-3.5">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {exclusions.map((ex) => (
            <tr key={ex.id} className="hover:bg-slate-900/60 transition-colors">
              <td className="p-3.5 font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{ex.company_name}</span>
                </div>
              </td>
              <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                {ex.domain ? (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{ex.domain}</span>
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-3.5 text-slate-400">{ex.reason || "Previously Researched Lead"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
