"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/proxy/api/auth/password-reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Password reset failed.");
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Password reset failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <h1 className="text-xl font-semibold text-white">Choose a new password</h1>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="12–128 characters"
          />
          <button className="w-full rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60" disabled={busy || !token}>
            {busy ? "Updating…" : "Reset password"}
          </button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        {message && <p role="status" className="mt-3 text-sm text-emerald-400">{message}</p>}
        {message && <Link className="mt-4 inline-block text-sm text-sky-400" href="/login">Sign in</Link>}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<p className="p-6 text-slate-300">Loading reset form…</p>}><ResetPasswordForm /></Suspense>;
}
