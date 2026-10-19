"use client";

import Link from "next/link";

/** Friendly upgrade card shown when a guest hits a registered-only feature. */
export function SignupNudge({ feature }: { feature: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-accent-200 bg-accent-50 p-8 text-center dark:border-accent-900 dark:bg-accent-950/30">
      <p className="text-4xl">🔓</p>
      <h2 className="mt-3 text-xl font-bold">Free account needed for {feature}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-navy-600 dark:text-navy-300">
        {feature} uses your personal history and AI — that needs an account.
        It takes 30 seconds, it's free forever, and everything you've done as a
        guest carries over automatically.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link
          href="/signup"
          className="rounded-xl bg-navy-800 px-6 py-2.5 font-semibold text-white dark:bg-accent-600"
        >
          Create free account
        </Link>
        <Link
          href="/signin"
          className="rounded-xl border border-navy-200 px-6 py-2.5 font-semibold dark:border-navy-700"
        >
          I have an account
        </Link>
      </div>
    </div>
  );
}
