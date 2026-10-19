"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isGuest?: boolean;
}

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/journey", label: "My Journey" },
  { href: "/listening", label: "Listening" },
  { href: "/reading", label: "Reading" },
  { href: "/writing", label: "Writing" },
  { href: "/speaking", label: "Speaking" },
  { href: "/grammar", label: "Grammar" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/mock", label: "Mock Tests" },
  { href: "/study-plan", label: "Study Plan" },
  { href: "/revision", label: "Revision" },
  { href: "/progress", label: "Progress" },
  { href: "/achievements", label: "Achievements" },
  { href: "/resources", label: "Resources" },
];

export function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  const toggleTheme = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("bq-theme", dark ? "dark" : "light");
    } catch {}
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur dark:border-navy-800 dark:bg-navy-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-800 text-lg font-black text-white dark:bg-accent-500">
            BQ
          </span>
          <span className="font-bold text-navy-900 dark:text-white">
            BandQuest <span className="text-accent-600 dark:text-accent-400">IELTS</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-lg border border-navy-200 px-3 py-1.5 text-sm dark:border-navy-700"
          >
            ◐
          </button>
          {user ? (
            <>
              {user.isGuest ? (
                <Link
                  href="/signup"
                  className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
                >
                  Guest — Sign up free
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="hidden rounded-lg bg-navy-800 px-3 py-1.5 text-sm font-medium text-white sm:block dark:bg-accent-600"
                >
                  {user.displayName}
                </Link>
              )}
              <button onClick={logout} className="rounded-lg border border-navy-200 px-3 py-1.5 text-sm dark:border-navy-700">
                {user.isGuest ? "End guest session" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="rounded-lg border border-navy-200 px-3 py-1.5 text-sm dark:border-navy-700">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-lg bg-navy-800 px-3 py-1.5 text-sm font-medium text-white dark:bg-accent-600">
                Get started
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
            className="rounded-lg border border-navy-200 px-3 py-1.5 text-sm dark:border-navy-700"
          >
            ☰
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-navy-100 dark:border-navy-800" aria-label="Main navigation">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-1 px-4 py-3 sm:grid-cols-4 sm:px-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm hover:bg-navy-50 dark:hover:bg-navy-800 ${
                  pathname === l.href ? "bg-navy-100 font-semibold dark:bg-navy-800" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
              >
                Admin ⚙
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
