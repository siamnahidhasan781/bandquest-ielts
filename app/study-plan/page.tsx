"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Plan {
  weeks: number;
  minutesPerDay: number;
  targetBand: number | null;
  focusArea: string;
  note: string;
  plan: { week: number; days: { day: string; minutes: number; tasks: string[] }[] }[];
}

export default function StudyPlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [weeks, setWeeks] = useState(8);
  const [loading, setLoading] = useState(false);
  const [openWeek, setOpenWeek] = useState(1);

  useEffect(() => {
    fetch("/api/study-plan").then((r) => {
      if (r.status === 401) { window.location.href = "/signin"; return null; }
      return r.json();
    }).then((d) => d && setPlan(d.plan));
  }, []);

  const generate = async () => {
    setLoading(true);
    const res = await fetch("/api/study-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeks }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setPlan(data.plan); setOpenWeek(1); }
    else alert(data.error || "Failed.");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">🗓️ Personal Study Plan</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">
        Generated from your profile: target band, weakest module, daily minutes.
      </p>

      {!plan ? (
        <div className="mt-6 rounded-2xl border border-navy-200 p-6 dark:border-navy-700">
          <p className="text-sm">First <Link href="/profile" className="text-accent-600 underline">set your target band and daily minutes</Link>, then generate.</p>
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm">Duration:
              <select value={weeks} onChange={(e) => setWeeks(parseInt(e.target.value))}
                className="ml-2 rounded-lg border border-navy-200 px-3 py-2 dark:border-navy-700 dark:bg-navy-900">
                {[4, 6, 8, 10, 12].map((w) => <option key={w} value={w}>{w} weeks</option>)}
              </select>
            </label>
            <button onClick={generate} disabled={loading} className="rounded-xl bg-navy-800 px-6 py-2.5 font-semibold text-white disabled:opacity-50 dark:bg-accent-600">
              {loading ? "Generating…" : "Generate my plan"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="rounded-2xl bg-navy-900 p-5 text-white dark:bg-navy-800">
            <p className="font-bold">{plan.weeks}-week plan · {plan.minutesPerDay} min/day · focus: {plan.focusArea}</p>
            <p className="mt-1 text-sm text-navy-200">{plan.note}</p>
            <button onClick={generate} disabled={loading} className="mt-3 rounded-lg border border-navy-600 px-4 py-1.5 text-sm">
              Regenerate
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {plan.plan.map((w) => (
              <div key={w.week} className="rounded-2xl border border-navy-200 dark:border-navy-700">
                <button onClick={() => setOpenWeek(openWeek === w.week ? 0 : w.week)}
                  className="flex w-full items-center justify-between px-5 py-3 font-semibold">
                  Week {w.week} {w.week === plan.plan.length ? "🎯" : ""}
                  <span>{openWeek === w.week ? "−" : "+"}</span>
                </button>
                {openWeek === w.week && (
                  <div className="grid gap-2 px-5 pb-4 sm:grid-cols-2">
                    {w.days.map((d, i) => (
                      <div key={i} className="rounded-xl bg-navy-50 p-3 text-sm dark:bg-navy-800/50">
                        <p className="font-semibold">{d.day} · {d.minutes} min</p>
                        <ul className="mt-1 list-disc pl-4 text-navy-600 dark:text-navy-300">
                          {d.tasks.map((t, j) => <li key={j}>{t}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
