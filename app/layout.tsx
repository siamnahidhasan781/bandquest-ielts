import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";

export const metadata: Metadata = {
  title: "BandQuest IELTS — From Zero to IELTS-Ready",
  description: "A complete, free, AI-powered IELTS learning ecosystem. Grammar, vocabulary, and all four IELTS skills.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "BandQuest IELTS" },
};

export const viewport: Viewport = {
  themeColor: "#0f1f3d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bq-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Nav />
        <GuestBanner />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
        <footer className="border-t border-navy-100 dark:border-navy-800 py-8 text-center text-sm text-navy-500 dark:text-navy-300">
          <p className="font-semibold text-navy-800 dark:text-navy-100">BandQuest IELTS</p>
          <p>From Zero to IELTS-Ready · Free forever for learners</p>
          <p className="mt-2 text-xs">Practice materials are original BandQuest content, not official IELTS papers. AI scores are educational estimates, not official examiner scores.</p>
        </footer>
      </body>
    </html>
  );
}
