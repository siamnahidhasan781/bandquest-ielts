"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** "Continue with Google" button — only rendered when the admin configured OAuth. */
export function GoogleSignInButton({ mode }: { mode: "signin" | "signup" }) {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((d) => setEnabled(Boolean(d.googleEnabled)))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 text-xs text-navy-400 dark:text-navy-500">
        <span className="h-px flex-1 bg-navy-200 dark:bg-navy-700" />
        or
        <span className="h-px flex-1 bg-navy-200 dark:bg-navy-700" />
      </div>
      <a
        href={`/api/auth/google?next=${encodeURIComponent(pathname === "/signup" || pathname === "/signin" ? "/dashboard" : pathname)}`}
        className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-navy-200 bg-white py-3 font-semibold text-navy-800 transition hover:bg-navy-50 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100 dark:hover:bg-navy-800"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.5z"/>
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.7 2.9v.1C3.3 21.3 7.3 24 12 24z"/>
          <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.7-2.9-.1.1C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.9-3z"/>
          <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l3.9 3.1c1-2.9 3.7-5 6.8-5z"/>
        </svg>
        {mode === "signin" ? "Continue with Google" : "Sign up with Google"}
      </a>
    </div>
  );
}
