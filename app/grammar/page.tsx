"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Concept {
  concept: string;
  mastery: number;
  attempts: number;
}

export default function Grammar() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grammar/mastery")
      .then((r) => r.json())
      .then((d) => setConcepts(d.concepts ?? []))
      .finally(() => setLoading(false));
  }, []);

  const bar = (m: number) => {
    const pct = Math.round(m * 100);
    const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400";
    return (
      <div className="h-2 w-full rounded-full bg-navy-100 dark:bg-navy-800">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">📐 Grammar Academy</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">
        Standalone grammar training. Mastery is tracked per concept — one correct answer doesn't mark it mastered.
      </p>

      <div className="mt-6 flex gap-3">
        <Link href="/journey" className="rounded-xl bg-navy-800 px-5 py-2.5 font-semibold text-white dark:bg-accent-600">
          Study the 10 foundation episodes →
        </Link>
      </div>

      <h2 className="mt-8 text-xl font-bold">Your concept mastery</h2>
      {loading ? (
        <p className="mt-4">Loading… (sign in to see your mastery)</p>
      ) : concepts.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-navy-200 p-6 text-center dark:border-navy-700">
          <p>No attempts yet. Complete a checkpoint in the <Link href="/journey" className="text-accent-600 underline">journey</Link> and your per-concept mastery will appear here.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {concepts.map((c) => (
            <div key={c.concept} className="rounded-xl border border-navy-200 p-4 dark:border-navy-700">
              <div className="flex items-center justify-between">
                <p className="font-medium capitalize">{c.concept.replace(/-/g, " ")}</p>
                <p className="text-sm text-navy-500">{Math.round(c.mastery * 100)}%</p>
              </div>
              <div className="mt-2">{bar(c.mastery)}</div>
              <p className="mt-1 text-xs text-navy-500">{c.attempts} attempts</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-amber-50 p-5 text-sm dark:bg-amber-900/20">
        <p>💡 Concepts below 60% are automatically scheduled into your <Link href="/revision" className="underline">revision</Link>. Nothing is marked "mastered" permanently after a single correct response.</p>
      </div>
    </div>
  );
}
