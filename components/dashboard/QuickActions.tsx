"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Compass, Sparkles, Send, Download, FileSpreadsheet } from "lucide-react";
import { triggerLeadWorkflow } from "@/lib/api/actions";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { getDownloadUrl } from "@/lib/api/leads";

export function QuickActions({ onRefresh }: { onRefresh?: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [source, setSource] = useState<"freelancing" | "appstore" | "partner">("appstore");
  const [merchantKeywords, setMerchantKeywords] = useState("Shopify stores");
  const [merchantCountry, setMerchantCountry] = useState("India");
  const toast = useToast();

  const handleRunLeadEngine = async () => {
    try {
      setIsRunning(true);
      toast.info("Starting Lead Engine", `Generating ${source} leads from the selected source...`);
      const res = await triggerLeadWorkflow(
        100,
        source,
        source === "freelancing" ? { keywords: merchantKeywords, country: merchantCountry } : {}
      );
      const result = res.result || {};
      if (source === "freelancing") {
        const discovery = result.discovery || {};
        if (!discovery.candidates) {
          toast.warning("No search results", "Try broader store keywords or another country on the Discovery page.");
        } else if (!discovery.verifiedShopifyStores && !discovery.contactBackedStores && discovery.robotsBlockedSites === discovery.candidates) {
          toast.info("Storefront crawling disallowed", `${discovery.robotsBlockedSites} candidate sites disallow crawling in robots.txt.`);
        } else if (!discovery.verifiedShopifyStores && !discovery.contactBackedStores) {
          toast.warning("No Shopify stores verified", `${discovery.candidates} candidates: ${discovery.rejectedNonShopifySites} were not Shopify storefronts, ${discovery.unreachableSites} were unreachable, ${discovery.robotsBlockedSites} blocked crawling.`);
        } else if (!discovery.importedStores && !discovery.updatedStores) {
          toast.info("Stores already current", `${discovery.verifiedShopifyStores} Shopify stores verified, ${discovery.contactBackedStores || 0} retained with known contacts; ${discovery.duplicateStores} were already saved.`);
        } else {
          toast.success(
            "Store details updated",
            `${discovery.importedStores || 0} new stores saved, ${discovery.updatedStores || 0} existing stores refreshed (${discovery.verifiedShopifyStores} Shopify verified, ${discovery.contactBackedStores || 0} retained with known contacts); ${result.storesWithEmail} with public email, ${result.storesWithPhone} with phone. View them on the Companies page.`
          );
        }
      } else {
        const discovery = result.discovery || {};
        const newStores = discovery.savedCount || 0;
        const refreshedStores = discovery.updatedCount || 0;
        const totalStores = result.totalSourceCompanies || 0;
        const description = `${newStores} new stores saved, ${refreshedStores} existing stores updated; ${totalStores} total in this source, ${result.evaluated || 0} researched, ${result.readyForOutreach || 0} ready for outreach.`;
        if (newStores === 0 && totalStores === 0) {
          toast.warning("No stores discovered", `No ${source} companies were saved. Check discovery source availability and filtering, then retry.`);
        } else if (newStores === 0 && refreshedStores === 0) {
          toast.info("No new stores added", description);
        } else {
          toast.success("Stores discovered", description);
        }
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error("Lead Engine Error", err.message || "Failed to trigger pipeline.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-none mb-4">
        <div>
          <CardTitle>Fast Actions</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Trigger automated workflows or jump to outreach and export controls.
          </p>
        </div>
      </CardHeader>

      <div className="mb-3">
        <label htmlFor="quick-action-lead-source" className="sr-only">Lead source</label>
        <select
          id="quick-action-lead-source"
          value={source}
          onChange={(event) => setSource(event.target.value as "freelancing" | "appstore" | "partner")}
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="freelancing">Freelancing - imported Shopify stores</option>
          <option value="appstore">Shopify App Store - app developers</option>
          <option value="partner">Shopify Partners - service agencies</option>
        </select>
      </div>
      {source === "freelancing" && (
        <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="quick-merchant-keywords">Store niche or product keywords</label>
          <input
            id="quick-merchant-keywords"
            value={merchantKeywords}
            onChange={(event) => setMerchantKeywords(event.target.value)}
            maxLength={120}
            placeholder="Niche or product keywords"
            className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
          <label className="sr-only" htmlFor="quick-merchant-country">Country</label>
          <input
            id="quick-merchant-country"
            value={merchantCountry}
            onChange={(event) => setMerchantCountry(event.target.value)}
            maxLength={60}
            placeholder="Country or Worldwide"
            className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="primary"
          onClick={handleRunLeadEngine}
          isLoading={isRunning}
          className="w-full justify-start "
        >
          <Sparkles className="w-4 h-4" />
          <div className="text-left leading-tight">
            <p className="text-xs font-bold">Run 100-Lead Engine</p>
            <p className="text-[10px] opacity-80">Selected source only</p>
          </div>
        </Button>

        <Link href="/outreach" className="w-full">
          <Button variant="secondary" className="w-full justify-start ">
            <Send className="w-4 h-4 text-emerald-400" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold">Send Outreach</p>
              <p className="text-[10px] text-slate-400">Preview & Batch Send</p>
            </div>
          </Button>
        </Link>

        <Link href="/discovery" className="w-full">
          <Button variant="secondary" className="w-full justify-start ">
            <Compass className="w-4 h-4 text-sky-400" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold">Discovery Crawler</p>
              <p className="text-[10px] text-slate-400">Scrape Directory</p>
            </div>
          </Button>
        </Link>

        <a href={getDownloadUrl("xlsx")} className="w-full" download>
          <Button variant="secondary" className="w-full justify-start ">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold">Download Excel</p>
              <p className="text-[10px] text-slate-400">Full 26 Columns</p>
            </div>
          </Button>
        </a>
      </div>
    </Card>
  );
}
