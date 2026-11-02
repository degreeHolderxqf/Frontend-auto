"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying email address…");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Verification link is missing its token.");
      setMessage("");
      return;
    }
    fetch("/api/proxy/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Email verification failed.");
        setMessage(result.message);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Email verification failed.");
        setMessage("");
      });
  }, [token]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <h1 className="text-xl font-semibold text-white">Email verification</h1>
        {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
        {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        {(message.includes("verified") || error) && (
          <Link className="mt-5 inline-block text-sm text-sky-400" href="/login">Continue to sign in</Link>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<p className="p-6 text-slate-300">Loading verification…</p>}><VerifyEmailForm /></Suspense>;
}
