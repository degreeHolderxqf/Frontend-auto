import React from "react";
import { cn } from "@/lib/utils";
import { LeadStatus, EmailConfidence } from "@/types";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        variant === "default" && "bg-slate-800 border-slate-700 text-slate-300",
        variant === "success" && "bg-emerald-950/60 border-emerald-800/60 text-emerald-400",
        variant === "warning" && "bg-amber-950/60 border-amber-800/60 text-amber-400",
        variant === "danger" && "bg-rose-950/60 border-rose-800/60 text-rose-400",
        variant === "info" && "bg-sky-950/60 border-sky-800/60 text-sky-400",
        variant === "purple" && "bg-indigo-950/60 border-indigo-800/60 text-indigo-400",
        variant === "neutral" && "bg-slate-900 border-slate-800 text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: LeadStatus | string }) {
  switch (status) {
    case "READY":
    case "APPROVED":
      return <Badge variant="success">READY</Badge>;
    case "SENT":
      return <Badge variant="purple">SENT</Badge>;
    case "EMAIL_FOUND":
      return <Badge variant="info">EMAIL FOUND</Badge>;
    case "DISCOVERED":
      return <Badge variant="default">DISCOVERED</Badge>;
    case "RESEARCHING":
      return <Badge variant="warning">RESEARCHING</Badge>;
    case "NO_CONTACT":
      return <Badge variant="neutral">NO CONTACT</Badge>;
    case "EXCLUDED":
      return <Badge variant="danger">EXCLUDED</Badge>;
    case "FAILED":
      return <Badge variant="danger">FAILED</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export function ConfidenceBadge({ confidence }: { confidence?: EmailConfidence }) {
  if (!confidence || confidence === "NONE") {
    return <Badge variant="neutral">NONE</Badge>;
  }
  if (confidence === "HIGH") {
    return <Badge variant="success">HIGH</Badge>;
  }
  if (confidence === "MEDIUM") {
    return <Badge variant="warning">MEDIUM</Badge>;
  }
  return <Badge variant="neutral">LOW</Badge>;
}
