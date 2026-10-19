"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function Signin() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md"><h1 className="text-3xl font-bold">Welcome back</h1></div>}>
      <SigninForm />
    </Suspense>
  );
}

function SigninForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Surface OAuth failures (e.g. user cancelled at Google).
  useEffect(() => {
    const e = searchParams.get("error");
    if (e) setError(e);
  }, [searchParams]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed.");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">Pick up right where you left off.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900" />
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-navy-800 py-3 font-semibold text-white disabled:opacity-50 dark:bg-accent-600">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">New here? <Link href="/signup" className="font-semibold text-accent-600">Create a free account</Link></p>
      <GoogleSignInButton mode="signin" />
    </div>
  );
}
