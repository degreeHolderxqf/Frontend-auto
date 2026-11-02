"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AccountResponse = {
  success: boolean;
  user: { email: string; role: string; emailVerified: boolean };
  access: {
    freeLeadLimit: number;
    freeLeadsUsed: number;
    freeLeadsRemaining: number | null;
    hasLifetimeAccess: boolean;
    accessType: string;
  };
};

type SavedLead = {
  id: string;
  canonical_key: string;
  source: string;
  payload: Record<string, unknown>;
  saved_at: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [error, setError] = useState("");
  const [bootstrapToken, setBootstrapToken] = useState("");
  const [message, setMessage] = useState("");
  const [leadJson, setLeadJson] = useState('[{"name":"Example Company","website":"https://example.com"}]');
  const [savingLeads, setSavingLeads] = useState(false);

  async function loadAccount() {
    const [accountResponse, leadsResponse] = await Promise.all([
      fetch("/api/proxy/api/auth/me", { cache: "no-store" }),
      fetch("/api/proxy/api/account/leads", { cache: "no-store" }),
    ]);
    if (!accountResponse.ok || !leadsResponse.ok) throw new Error("Unable to load account details.");
    const [accountResult, leadResult] = await Promise.all([accountResponse.json(), leadsResponse.json()]);
    setAccount(accountResult);
    setLeads(leadResult.leads);
  }

  useEffect(() => {
    loadAccount().catch((loadError) => setError(loadError.message));
  }, []);

  async function requestVerification() {
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/proxy/api/auth/email-verification/request", { method: "POST" });
      const result = await response.json();
      if (!response.ok) setError(result.error || "Unable to request verification.");
      else setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to request verification.");
    }
  }

  async function completeAdminBootstrap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/proxy/api/auth/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bootstrapToken }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Administrator bootstrap failed.");
        return;
      }
      setBootstrapToken("");
      setMessage("Administrator access is enabled.");
      router.replace("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Administrator bootstrap failed.");
    }
  }

  async function logout() {
    try {
      const response = await fetch("/api/proxy/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Sign out failed.");
      }
      router.replace("/login");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Sign out failed.");
    }
  }

  async function saveLeads(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    let leads: unknown;
    try {
      leads = JSON.parse(leadJson);
    } catch {
      setError("Enter valid JSON containing an array of lead objects.");
      return;
    }
    if (!Array.isArray(leads) || leads.length > 100) {
      setError("Enter an array containing no more than 100 leads.");
      return;
    }

    setSavingLeads(true);
    try {
      const response = await fetch("/api/proxy/api/account/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      const result = await response.json();
      await loadAccount();
      const summary = `${result.saved?.length || 0} saved; ${result.duplicates || 0} duplicates ignored.`;
      setMessage(response.status === 402
        ? `${summary} The free limit is reached; paid access is not available yet.`
        : summary);
      if (!response.ok && response.status !== 402) {
        setError(result.error || "Unable to save leads.");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save leads.");
    } finally {
      setSavingLeads(false);
    }
  }

  if (error && !account) return <p className="p-6 text-sm text-red-400" role="alert">{error}</p>;
  if (!account) return <p className="p-6 text-sm text-slate-300">Loading account…</p>;

  const isEligibleAdmin = account.user.email.toLowerCase() === "himanshusoni7899@gmail.com";
  const { access } = account;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Your workspace</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Account</h1>
          <p className="mt-1 text-sm text-slate-400">{account.user.email}</p>
        </div>
        <button className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200" onClick={logout}>
          Sign out
        </button>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="font-semibold text-white">Lead access</h2>
        <p className="mt-2 text-sm text-slate-300">
          {access.hasLifetimeAccess
            ? "Your account has unlimited saved-lead access."
            : `${access.freeLeadsUsed} of ${access.freeLeadLimit} unique leads saved; ${access.freeLeadsRemaining} remaining.`}
        </p>
        <p className="mt-1 text-xs text-slate-500">Access type: {access.accessType}</p>
        <p className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-400">
          Your leads are stored in a private account workspace. The shared legacy lead dataset is not exposed to regular accounts.
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="font-semibold text-white">Your saved leads</h2>
        {leads.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No leads have been saved to this account yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-800">
            {leads.map((lead) => {
              const payloadName = lead.payload.name || lead.payload.company_name || lead.payload.companyName;
              return (
                <li className="py-3" key={lead.id}>
                  <p className="text-sm font-medium text-slate-100">
                    {typeof payloadName === "string" ? payloadName : lead.canonical_key}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{lead.source} · {new Date(lead.saved_at).toLocaleDateString()}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="font-semibold text-white">Save your own lead data</h2>
        <p className="mt-2 text-sm text-slate-400">
          Paste an array of lead objects. Each account stores its own records; a stable website, app slug, or Shopify listing URL is required.
        </p>
        <form className="mt-4 space-y-3" onSubmit={saveLeads}>
          <textarea
            className="min-h-32 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100"
            value={leadJson}
            onChange={(event) => setLeadJson(event.target.value)}
            aria-label="Leads JSON"
            spellCheck={false}
          />
          <button
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            type="submit"
            disabled={savingLeads}
          >
            {savingLeads ? "Saving…" : "Save leads"}
          </button>
        </form>
      </section>

      {!account.user.emailVerified && (
        <section className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-5">
          <h2 className="font-semibold text-white">Verify your email</h2>
          <p className="mt-2 text-sm text-slate-300">Email verification is required before administrator bootstrap.</p>
          <button className="mt-4 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950" onClick={requestVerification}>
            Send verification email
          </button>
        </section>
      )}

      {isEligibleAdmin && account.user.emailVerified && account.user.role !== "ADMIN" && (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-semibold text-white">One-time administrator setup</h2>
          <p className="mt-2 text-sm text-slate-400">
            Requires a verified account and the one-time token configured by the operator.
          </p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={completeAdminBootstrap}>
            <input
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              type="password"
              autoComplete="off"
              required
              value={bootstrapToken}
              onChange={(event) => setBootstrapToken(event.target.value)}
              placeholder="Administrator bootstrap token"
            />
            <button className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950" type="submit">
              Enable administrator
            </button>
          </form>
        </section>
      )}

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
    </main>
  );
}
