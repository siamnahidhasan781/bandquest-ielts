"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Shown to trial (guest) visitors across the app: their progress IS being
 * saved, and a free account keeps it on all devices + unlocks AI & mocks.
 */
export function GuestBanner() {
  const [isGuest, setIsGuest] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsGuest(Boolean(d.user?.isGuest)))
      .catch(() => setIsGuest(false));
  }, [pathname]);

  if (!isGuest) return null;
  if (pathname === "/signin" || pathname === "/signup") return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm sm:px-6">
        <span className="font-semibold text-amber-900 dark:text-amber-200">
          👋 You're exploring as a guest
        </span>
        <span className="text-amber-800 dark:text-amber-300">
          — your progress is being saved in this browser.
        </span>
        <Link href="/signup" className="font-semibold text-accent-600 underline dark:text-accent-400">
          Create a free account
        </Link>
        <span className="text-amber-800 dark:text-amber-300">
          to keep it on all devices and unlock AI feedback + mock tests.
        </span>
      </div>
    </div>
  );
}
