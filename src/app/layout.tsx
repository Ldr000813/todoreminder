import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f11" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: "TaskFlow | Calendar Todo",
  description: "Beautiful, calendar-synced task management app for your daily life.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TaskFlow"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} antialiased bg-slate-50 dark:bg-[#0f0f11] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 touch-manipulation`}
      >
        <div className="mx-auto max-w-md min-h-[100dvh] relative overflow-hidden bg-slate-50 dark:bg-[#0f0f11] shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10">
          {children}
        </div>
      </body>
    </html>
  );
}
