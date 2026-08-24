import React from "react";
import { EmailLog } from "@/types";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, XCircle, Mail, Clock } from "lucide-react";

export function EmailHistoryTable({ logs }: { logs: EmailLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
        <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="font-semibold text-slate-300">No outreach history yet</p>
        <p className="text-slate-500 mt-1">Dispatched and simulated emails will be logged here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
          <tr>
            <th className="p-3.5">Recipient</th>
            <th className="p-3.5">Subject</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5 text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
              <td className="p-3.5 font-mono text-slate-200">{log.email}</td>
              <td className="p-3.5 max-w-md truncate text-slate-300">{log.subject || "Shopify Developer Application"}</td>
              <td className="p-3.5">
                {log.status === "SENT" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    <CheckCircle2 className="w-2.5 h-2.5" /> SENT
                  </span>
                ) : log.status === "SIMULATED" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800/60">
                    <Clock className="w-2.5 h-2.5" /> DRY RUN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800/60">
                    <XCircle className="w-2.5 h-2.5" /> FAILED
                  </span>
                )}
              </td>
              <td className="p-3.5 text-right text-slate-500 font-mono text-[11px]">
                {formatDate(log.sent_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
