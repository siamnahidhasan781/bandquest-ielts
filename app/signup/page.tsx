"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function Signup() {
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed.");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Create your free account</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">Free forever. No card, no paywall.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Your name</label>
          <input id="name" required minLength={2} maxLength={60} value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="w-full rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900" placeholder="e.g. Rahim Uddin" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" type="password" required minLength={8} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900" placeholder="At least 8 characters" />
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-navy-800 py-3 font-semibold text-white disabled:opacity-50 dark:bg-accent-600">
          {loading ? "Creating…" : "Create free account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">Already have an account? <Link href="/signin" className="font-semibold text-accent-600">Sign in</Link></p>
      <GoogleSignInButton mode="signup" />
    </div>
  );
}
