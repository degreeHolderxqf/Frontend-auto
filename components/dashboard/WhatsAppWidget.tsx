"use client";

import React, { useEffect, useState } from "react";
import { fetchWhatsAppStatus, connectWhatsApp, simulateWhatsAppConnect, disconnectWhatsApp } from "@/lib/api/whatsapp";
import { WhatsAppConnectionStatus } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { MessageSquare, RefreshCw, QrCode, CheckCircle2, XCircle, Smartphone, AlertTriangle, ExternalLink, Zap, LogOut } from "lucide-react";
import Link from "next/link";

export function WhatsAppWidget() {
  const [status, setStatus] = useState<WhatsAppConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  const toast = useToast();

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWhatsAppStatus();
      setStatus(res);
      if (res.connected && qrModalOpen) {
        setQrModalOpen(false);
        toast.success("WhatsApp Connected", "Your WhatsApp session is active and ready.");
      }
    } catch {
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Poll for connection status when QR modal is open (if not simulated)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (qrModalOpen && !isSimulationMode && (!status || !status.connected)) {
      interval = setInterval(() => {
        fetchWhatsAppStatus()
          .then((res) => {
            setStatus(res);
            if (res.connected) {
              setQrModalOpen(false);
              toast.success("WhatsApp Connected!", "Successfully paired with Evolution API.");
            }
          })
          .catch(() => {});
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrModalOpen, isSimulationMode, status]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const res = await connectWhatsApp();
      if (res.success && (res.qrcode || res.pairingCode)) {
        setQrCodeData(res.qrcode || null);
        setPairingCode(res.pairingCode || null);
        setIsSimulationMode(Boolean(res.simulation));
        setQrModalOpen(true);
        if (res.simulation) {
          toast.info("Simulation Mode", res.message || "Previewing simulated QR code for testing.");
        }
      } else if ((res as any).errorCode === "EVOLUTION_AUTH_ERROR") {
        toast.error("Authentication Error", "Invalid or missing Evolution API Key. Please check Settings.");
      } else if ((res as any).errorCode === "EVOLUTION_OFFLINE") {
        toast.error("Service Unavailable", "Evolution API is currently offline. Try again in a few moments.");
      } else if ((res as any).errorCode === "EVOLUTION_SERVICE_SUSPENDED") {
        toast.error("Service Suspended", "Evolution API has been suspended by its hosting provider. Re-deploy or restore it in your Render dashboard.");
      } else {
        toast.error("Connection Notice", res.message || res.error || "Evolution API did not return a live QR code. Check API Key in Settings.");
      }
    } catch (err: any) {
      toast.error("Evolution API Error", err.message || "Failed to initiate WhatsApp pairing.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnectWhatsApp();
      await loadStatus();
      toast.info("WhatsApp Disconnected", "Your WhatsApp session has been logged out.");
    } catch (err: any) {
      toast.error("Disconnect Error", err.message || "Failed to logout WhatsApp session.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleToggleSimulateConnect = async (connect: boolean) => {
    try {
      setIsSimulating(true);
      await simulateWhatsAppConnect(connect);
      await loadStatus();
      if (connect) {
        setQrModalOpen(false);
        toast.success("Connected (Simulated)", "WhatsApp test connection is now active. You can test message previews & dry-run sending.");
      } else {
        toast.info("Disconnected", "Simulated WhatsApp session ended.");
      }
    } catch (err: any) {
      toast.error("Simulation Error", err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const isConnected = status?.connected || status?.state === "OPEN" || status?.state === "CONNECTED";

  return (
    <>
      <Card className="p-5">
        <CardHeader className="p-0 pb-3 border-none flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <CardTitle>WhatsApp Outreach (Evolution API)</CardTitle>
            {status?.version && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                v{status.version}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                isConnected
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                  : "bg-rose-950/80 text-rose-300 border-rose-800"
              }`}
            >
              {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {isConnected ? "CONNECTED" : "DISCONNECTED"}
            </span>
          </div>
        </CardHeader>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                Instance: <span className="text-sky-400">{status?.instanceName || "job-search"}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {status?.online
                  ? `API Online at ${status.apiUrl}`
                  : `Service offline at ${status?.apiUrl || "https://evolution-api-latest-h0yy.onrender.com"}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={loadStatus} isLoading={isLoading} className="h-8 px-2.5">
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Refresh
              </Button>
              <Button
                size="sm"
                variant={isConnected ? "outline" : "primary"}
                onClick={handleConnect}
                isLoading={isConnecting}
                className="h-8 px-3"
              >
                <QrCode className="w-3.5 h-3.5 mr-1" />
                {isConnected ? "Show QR Code" : "Connect WhatsApp"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Sending Mode:</span>
              <span className={`font-semibold ${status?.dryRun ? "text-amber-400" : "text-emerald-400"}`}>
                {status?.dryRun ? "🧪 DRY RUN (Safe)" : "🚀 LIVE SEND"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Anti-Ban Delay:</span>
              <span className="text-slate-200 font-mono">{(status?.delayMs || 15000) / 1000}s between msgs</span>
            </div>
          </div>

          {/* Offline Helper Box & Local Simulation Quick Action */}
          {!status?.online && !isConnected && (
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Evolution API is not responding at <code>{status?.apiUrl || "https://evolution-api-latest-h0yy.onrender.com"}</code>. You can configure credentials in Settings or test in simulation mode.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <Link href="/settings" className="text-[11px] text-sky-400 hover:underline flex items-center gap-1">
                  Configure API URL & Key <ExternalLink className="w-3 h-3" />
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleToggleSimulateConnect(true)}
                  isLoading={isSimulating}
                  className="h-7 text-xs bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800"
                >
                  <Zap className="w-3 h-3 mr-1 text-emerald-400" />
                  Test Connected Mode
                </Button>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for WhatsApp outreach
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                isLoading={isDisconnecting}
                className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Disconnect Session
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* QR Code Modal */}
      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Pair WhatsApp with Evolution API">
        <div className="space-y-4 text-center py-2">
          {isSimulationMode ? (
            <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs">
              ⚠️ <strong>Local Simulation Mode</strong>: Evolution API is running in test/dry-run mode. You can test the scanning and connection flow below.
            </div>
          ) : (
            <p className="text-xs text-slate-300">
              Open WhatsApp on your phone &gt; <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong>, then scan the QR code below:
            </p>
          )}

          <div className="flex justify-center p-4 bg-white rounded-xl shadow-inner max-w-[280px] mx-auto">
            {qrCodeData ? (
              <img
                src={qrCodeData.startsWith("data:") ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
                alt="WhatsApp QR Code"
                className="w-56 h-56 object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-500 gap-2">
                <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
                <span className="text-xs">Generating QR Code...</span>
              </div>
            )}
          </div>

          {pairingCode && (
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">Pairing Code:</span>
              <span className="font-mono text-base font-bold text-sky-400 tracking-wider">{pairingCode}</span>
            </div>
          )}

          {isSimulationMode ? (
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleToggleSimulateConnect(true)}
                isLoading={isSimulating}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                Simulate Successful Pairing (Enter Connected State)
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>Waiting for scan... (Auto-closes when connected)</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
