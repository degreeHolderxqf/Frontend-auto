import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
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
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
