"use client";

import React, { useRef, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { triggerDiscovery, triggerLeadWorkflow, triggerAppStoreDiscovery, triggerMerchantIngest } from "@/lib/api/actions";
import { useToast } from "@/components/ui/Toast";
import { Compass, Sparkles, Database, ShoppingBag, Building2, Store, Upload } from "lucide-react";

type DiscoverySource = "freelancing" | "appstore" | "partner";

export function DiscoveryRunner({ onCompleted }: { onCompleted?: () => void }) {
  const [source, setSource] = useState<DiscoverySource>("appstore");
  const [merchantFile, setMerchantFile] = useState<File | null>(null);
  const [merchantKeywords, setMerchantKeywords] = useState("Shopify stores");
  const [merchantCountry, setMerchantCountry] = useState("India");
  const [merchantTarget, setMerchantTarget] = useState(100);
  const merchantFileInput = useRef<HTMLInputElement>(null);
  const [isUploadingMerchants, setIsUploadingMerchants] = useState(false);
  const [candidatesTarget, setCandidatesTarget] = useState<number | "all">(200);
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);
  const [isRunningFullEngine, setIsRunningFullEngine] = useState(false);
  const toast = useToast();

  const handleRunDiscovery = async () => {
    if (source === "freelancing") return;
    try {
      setIsRunningDiscovery(true);
      const fetchAllPages = candidatesTarget === "all";
      const requestTarget = fetchAllPages ? 5000 : Number(candidatesTarget);

      if (source === "appstore") {
        // App Store discovery — primary source for app developers
        const description = fetchAllPages
          ? "Scanning all Shopify App Store directory pages"
          : `Fetching ~${requestTarget} apps with India-developer filtering...`;
        toast.info("Scraping Shopify App Store", description);
        const res = await triggerAppStoreDiscovery({
          maxApps: requestTarget,
          indiaOnly: true,
          fetchAllPages
        });
        const r = res.result || {};
        toast.success(
          "App Store Discovery Complete",
          `Saved ${r.savedCount || 0} companies, ${r.excludedCount || 0} excluded, ${r.duplicateCount || 0} duplicates.`
        );
      } else {
        // Partner Directory — fallback for service agencies
        const description = fetchAllPages
          ? "Scanning all Shopify directory pages until exhausted"
          : `Fetching ~${requestTarget} agencies with pagination...`;
        toast.info("Scraping Shopify Partner Directory", description);
        const res = await triggerDiscovery(requestTarget, fetchAllPages, "partner");
        const r = res.result || {};
        toast.success(
          "Partner Directory Discovery Complete",
          `Saved ${r.savedCount || 0} new, refreshed ${r.updatedCount || 0} existing.`
        );
      }
      if (onCompleted) onCompleted();
    } catch (err: any) {
      toast.error("Discovery Error", err.message || "Failed to execute discovery.");
    } finally {
      setIsRunningDiscovery(false);
    }
  };

  const handleRunFullEngine = async () => {
    try {
      setIsRunningFullEngine(true);
      const desc = source === "freelancing"
        ? "Searching public web results, verifying storefronts, and extracting published business details..."
        : source === "appstore"
          ? "Finding Shopify app developers and researching hiring contacts..."
          : "Finding Shopify Partners and researching hiring contacts...";
      toast.info("Starting Lead Generation", desc);
      const target = source === "freelancing" ? merchantTarget : 100;
      const res = await triggerLeadWorkflow(target, source, source === "freelancing"
        ? { keywords: merchantKeywords, country: merchantCountry }
        : {});
      const result = res.result || {};
      if (source === "freelancing") {
        const discovery = result.discovery || {};
        if (!discovery.candidates) {
          toast.warning("No search results", "Try broader store keywords or another country.");
        } else if (!discovery.verifiedShopifyStores && !discovery.contactBackedStores && discovery.robotsBlockedSites === discovery.candidates) {
          toast.info("Storefront crawling disallowed", `${discovery.robotsBlockedSites} candidate sites disallow crawling in robots.txt.`);
        } else if (!discovery.verifiedShopifyStores && !discovery.contactBackedStores) {
          toast.warning("No Shopify stores verified", `${discovery.candidates} candidates: ${discovery.rejectedNonShopifySites} were not Shopify storefronts, ${discovery.unreachableSites} were unreachable, ${discovery.robotsBlockedSites} blocked crawling.`);
        } else if (!discovery.importedStores && !discovery.updatedStores) {
          toast.info("Stores already current", `${discovery.verifiedShopifyStores} Shopify stores verified, ${discovery.contactBackedStores || 0} retained with known contacts; ${discovery.duplicateStores} were already saved.`);
        } else {
          toast.success(
            "Store details updated",
            `${discovery.importedStores || 0} new stores saved, ${discovery.updatedStores || 0} existing stores refreshed (${discovery.verifiedShopifyStores} Shopify verified, ${discovery.contactBackedStores || 0} retained with known contacts); ${result.storesWithEmail} with public email, ${result.storesWithPhone} with phone. Review them on the Companies page before outreach.`
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
      if (onCompleted) onCompleted();
    } catch (err: any) {
      toast.error("Pipeline Error", err.message || "Failed to execute pipeline.");
    } finally {
      setIsRunningFullEngine(false);
    }
  };

  const handleUploadMerchants = async () => {
    if (!merchantFile) {
      toast.error("Choose a file", "Select a CSV or JSON file containing Shopify store leads.");
      return;
    }
    try {
      setIsUploadingMerchants(true);
      const result = await triggerMerchantIngest(merchantFile.name, await merchantFile.text());
      const counts = result.results || {};
      toast.success(
        "Merchant leads imported",
        `${counts.imported || 0} imported, ${counts.skipped || 0} skipped, ${counts.errors || 0} errors.`
      );
      setMerchantFile(null);
      if (merchantFileInput.current) merchantFileInput.current.value = "";
      if (onCompleted) onCompleted();
    } catch (err: any) {
      toast.error("Merchant import failed", err.message || "Could not import the selected file.");
    } finally {
      setIsUploadingMerchants(false);
    }
  };

  const selectedSourceLabel = source === "freelancing"
    ? "Freelancing Stores"
    : source === "appstore" ? "App Store Developers" : "Shopify Partners";

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-none mb-4">
        <div>
          <CardTitle>Shopify Discovery Controls</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Choose a lead type. Freelancing searches public web results for Shopify stores; CSV/JSON import is optional.
          </p>
        </div>
      </CardHeader>

      {/* Source Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <button
          onClick={() => setSource("freelancing")}
          className={`p-3 rounded-xl border-2 transition-all text-left ${
            source === "freelancing"
              ? "border-emerald-500 bg-emerald-950/30"
              : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Store className={`w-4 h-4 ${source === "freelancing" ? "text-emerald-400" : "text-slate-500"}`} />
            <span className={`text-sm font-bold ${source === "freelancing" ? "text-emerald-300" : "text-slate-300"}`}>
              Freelancing Stores
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Discover Shopify stores from public search results, or optionally import your own CSV/JSON list.
          </p>
        </button>

        <button
          onClick={() => setSource("appstore")}
          className={`p-3 rounded-xl border-2 transition-all text-left ${
            source === "appstore"
              ? "border-purple-500 bg-purple-950/30"
              : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className={`w-4 h-4 ${source === "appstore" ? "text-purple-400" : "text-slate-500"}`} />
            <span className={`text-sm font-bold ${source === "appstore" ? "text-purple-300" : "text-slate-300"}`}>
              Shopify App Store
            </span>
            {source === "appstore" && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-900">
                Default
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">App developers; researches public Shopify app developer hiring contacts.</p>
        </button>

        <button
          onClick={() => setSource("partner")}
          className={`p-3 rounded-xl border-2 transition-all text-left ${
            source === "partner"
              ? "border-sky-500 bg-sky-950/30"
              : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Building2 className={`w-4 h-4 ${source === "partner" ? "text-sky-400" : "text-slate-500"}`} />
            <span className={`text-sm font-bold ${source === "partner" ? "text-sky-300" : "text-slate-300"}`}>
              Partner Directory
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Partner agencies; researches public Shopify developer hiring contacts.</p>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Crawler */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
          {source === "freelancing" ? (
            <>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Store className="w-4 h-4" />
                1. Find & Import Store Leads
              </div>
              <p className="text-xs text-slate-300">Verify imported leads and local pitch lists first, then use urlscan.io's free public store index and web search for more candidates. Stores are saved only when directly verified or confirmed by a recent successful public scan if robots.txt blocks crawling. Upload a StoreLeads/StoreCensus CSV below.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="merchant-search-keywords" className="text-[11px] font-semibold text-slate-400">Niche / product keywords</label>
                  <input
                    id="merchant-search-keywords"
                    value={merchantKeywords}
                    onChange={(event) => setMerchantKeywords(event.target.value)}
                    maxLength={120}
                    placeholder="e.g. skincare, cycling, coffee"
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="merchant-search-country" className="text-[11px] font-semibold text-slate-400">Country or region</label>
                  <input
                    id="merchant-search-country"
                    value={merchantCountry}
                    onChange={(event) => setMerchantCountry(event.target.value)}
                    maxLength={60}
                    placeholder="India or Worldwide"
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="merchant-search-target" className="text-[11px] font-semibold text-slate-400">Maximum stores to verify</label>
                <select
                  id="merchant-search-target"
                  value={merchantTarget}
                  onChange={(event) => setMerchantTarget(Number(event.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={10}>10 stores</option>
                  <option value={20}>20 stores</option>
                  <option value={30}>30 stores</option>
                  <option value={50}>50 stores</option>
                  <option value={100}>100 stores</option>
                </select>
              </div>
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <p className="text-[11px] font-semibold text-slate-400">Or import a CSV/JSON list</p>
              <input
                ref={merchantFileInput}
                type="file"
                accept=".csv,.json,application/json,text/csv"
                onChange={(event) => setMerchantFile(event.target.files?.[0] || null)}
                className="w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:text-slate-200"
              />
              <Button variant="secondary" onClick={handleUploadMerchants} isLoading={isUploadingMerchants} className="w-full">
                <Upload className="w-3.5 h-3.5 mr-1" />
                Import Selected File
              </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                1. Raw {source === "appstore" ? "App Store" : "Partner Directory"} Discovery
              </div>
              <p className="text-xs text-slate-300">
                {source === "appstore" ? (
                  <>Paginates through <code>apps.shopify.com/partners/directory</code> and extracts app developers.</>
                ) : (
                  <>Paginates through <code>shopify.com/in/partners/directory/locations/india</code> and extracts partner profiles.</>
                )}
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Target {source === "appstore" ? "Apps" : "Candidates"}:</label>
                <select
                  value={String(candidatesTarget)}
                  onChange={(e) => setCandidatesTarget(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={50}>50 (~3 Pages)</option>
                  <option value={100}>100 (~7 Pages)</option>
                  <option value={150}>150 (~10 Pages)</option>
                  <option value={200}>200 (~13 Pages)</option>
                  <option value={500}>500 (~30+ Pages)</option>
                  <option value="all">All Pages (scan until exhausted)</option>
                </select>
              </div>
              <Button variant="secondary" onClick={handleRunDiscovery} isLoading={isRunningDiscovery} className="w-full">
                <Database className="w-3.5 h-3.5 mr-1" />
                Run {source === "appstore" ? "App Store" : "Directory"} Crawler
              </Button>
            </>
          )}
        </div>

        {/* Step 2: Full Auto Pipeline */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              2. Generate {selectedSourceLabel}
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {source === "freelancing"
                ? "Searches the public web for candidate stores, verifies Shopify technology, and collects published store and business contact details. Discovered stores are added to the merchant inventory for review before outreach."
                : "Discovers only the selected company source, checks exclusions, and researches public hiring contacts before exporting results."}
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleRunFullEngine}
            isLoading={isRunningFullEngine}
            className="w-full"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {source === "freelancing" ? "Find & Save Shopify Stores" : `Run ${selectedSourceLabel} Pipeline`}
          </Button>
        </div>
      </div>
    </Card>
  );
}
