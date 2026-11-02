"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthResponse = {
  success: boolean;
  error?: string;
  user?: { role: "USER" | "ADMIN" };
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/proxy/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        router.replace(result.user.role === "ADMIN" ? "/" : "/account");
      })
      .catch(() => setError("Could not check an existing session. You can still sign in below."));
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch(`/api/proxy/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as AuthResponse;
      if (!response.ok || !result.success || !result.user) {
        throw new Error(result.error || "Unable to complete account request.");
      }
      router.replace(result.user.role === "ADMIN" ? "/" : "/account");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to complete account request.");
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/proxy/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to request password reset.");
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to request password reset.");
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Bulk Leads</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          New accounts include five unique saved leads. Existing accounts keep their eligible access.
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm text-slate-300">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block text-sm text-slate-300">
            Password
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={12}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {mode === "register" && <span className="mt-1 block text-xs text-slate-500">Use 12–128 characters.</span>}
          </label>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
          <button
            className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-60"
            disabled={busy}
            type="submit"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {mode === "login" && (
          <button className="mt-4 text-sm text-sky-400 hover:text-sky-300" onClick={requestPasswordReset} type="button">
            Send password reset link to this email
          </button>
        )}
        <p className="mt-6 text-sm text-slate-400">
          {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
          <button
            className="font-medium text-sky-400 hover:text-sky-300"
            onClick={() => {
              setError("");
              setMessage("");
              setMode(mode === "login" ? "register" : "login");
            }}
            type="button"
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
        <Link className="mt-4 inline-block text-xs text-slate-500 hover:text-slate-300" href="/">
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
