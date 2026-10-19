"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Markdown } from "@/components/Markdown";

interface Mistake {
  id: string;
  category: string;
  review_due: string;
  created_at: string;
  prompt_md: string | null;
  explanation_md: string | null;
}

export default function Revision() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [weak, setWeak] = useState<{ concept: string; mastery: number }[]>([]);

  const load = () => {
    fetch("/api/revision").then((r) => r.json()).then((d) => {
      setMistakes(d.mistakes ?? []);
      setWeak(d.weakConcepts ?? []);
    });
  };
  useEffect(load, []);

  const resolve = async (id: string, resolved: boolean) => {
    await fetch("/api/revision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, resolved }),
    });
    load();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">📝 Revision & Mistake Notebook</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">Every mistake is logged here. Fix them, mark resolved, and they stop coming back.</p>

      {weak.length > 0 && (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
          <h2 className="font-bold">⚠️ Concepts needing revision</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {weak.map((w) => (
              <span key={w.concept} className="rounded-full bg-white px-3 py-1 text-sm capitalize dark:bg-navy-900">
                {w.concept.replace(/-/g, " ")} · {Math.round(w.mastery * 100)}%
              </span>
            ))}
          </div>
          <Link href="/journey" className="mt-3 inline-block text-sm font-medium text-amber-700 dark:text-amber-300">Re-study these in the journey →</Link>
        </section>
      )}

      <h2 className="mt-8 text-xl font-bold">Open mistakes ({mistakes.length})</h2>
      {mistakes.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-navy-200 p-6 text-center text-navy-500 dark:border-navy-700">
          Nothing here — either you're perfect (unlikely 😉) or you haven't attempted a checkpoint yet.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {mistakes.map((m) => (
            <div key={m.id} className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-200">{m.category}</span>
                <button onClick={() => resolve(m.id, true)} className="text-sm text-emerald-600 underline">Mark resolved ✓</button>
              </div>
              {m.prompt_md && <div className="mt-3 text-sm"><Markdown text={m.prompt_md} /></div>}
              {m.explanation_md && (
                <div className="mt-3 rounded-xl bg-navy-50 p-4 text-sm dark:bg-navy-800/50">
                  <Markdown text={m.explanation_md} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
