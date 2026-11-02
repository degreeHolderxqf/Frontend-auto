"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

type SessionUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

type AuthState = "checking" | "ready" | "unavailable";

const publicPaths = new Set(["/login", "/verify-email", "/reset-password"]);

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [state, setState] = useState<AuthState>("checking");
  const [retryCount, setRetryCount] = useState(0);
  const isPublicPath = publicPaths.has(pathname);

  useEffect(() => {
    if (isPublicPath) {
      setState("ready");
      return;
    }

    let active = true;
    fetch("/api/proxy/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Unable to validate your account session.");
        const result = await response.json();
        if (!active) return;
        setUser(result.user);
        setState("ready");
        if (result.user.role !== "ADMIN" && pathname !== "/account") {
          router.replace("/account");
        }
      })
      .catch(() => {
        if (active) setState("unavailable");
      });

    return () => {
      active = false;
    };
  }, [isPublicPath, pathname, retryCount, router]);

  if (isPublicPath) return <>{children}</>;

  if (state === "unavailable") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-slate-100">
        <div className="max-w-md rounded-xl border border-red-900 bg-slate-900 p-6">
          <h1 className="text-lg font-semibold">Account service unavailable</h1>
          <p className="mt-2 text-sm text-slate-300">
            The secure account service could not validate this session. Please retry in a moment.
          </p>
          <button
            className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
            onClick={() => {
              setState("checking");
              setRetryCount((count) => count + 1);
            }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (state !== "ready" || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-slate-300">
        Checking account…
      </main>
    );
  }

  if (user.role !== "ADMIN") return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </>
  );
}
