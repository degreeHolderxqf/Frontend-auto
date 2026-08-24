"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { addExclusion } from "@/lib/api/exclusions";
import { useToast } from "@/components/ui/Toast";
import { ShieldPlus } from "lucide-react";

interface AddExclusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddExclusionModal({ isOpen, onClose, onSuccess }: AddExclusionModalProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Validation Error", "Company name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addExclusion(name.trim(), domain.trim() || undefined, reason.trim() || "Manual Exclusion");
      toast.success("Exclusion Added", `"${name}" added to permanent blacklist.`);
      setName("");
      setDomain("");
      setReason("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to add exclusion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Excluded Company"
      description="Permanently blacklist a company from discovery and automated email outreach"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Company Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Commerce"
            className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Official Domain (Optional)
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g. acmecommerce.com"
            className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Reason for Exclusion
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Past employer / Already contacted"
            className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            <ShieldPlus className="w-3.5 h-3.5 mr-1" />
            Add to Blacklist
          </Button>
        </div>
      </form>
    </Modal>
  );
}
