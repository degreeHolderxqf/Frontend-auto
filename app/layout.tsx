import type { Metadata } from "next";
import "./globals.css";
import { AuthShell } from "@/components/auth/AuthShell";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Shopify Lead AI — Partner → HR Lead Generation System",
  description: "Automated Shopify Partner research, HR discovery, lead qualification, and cold email outreach platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex antialiased selection:bg-sky-500 selection:text-slate-950">
        <ToastProvider>
          <AuthShell>
              {children}
          </AuthShell>
        </ToastProvider>
      </body>
    </html>
  );
}
