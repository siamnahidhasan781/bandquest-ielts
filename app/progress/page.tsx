"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Progress() {
  const [data, setData] = useState<{
    xp: number;
    streak: { current_streak: number; longest_streak: number };
    episodes: { passed: number; total: number };
    mockTrend: { overall_band: number; submitted_at: string }[];
    vocab: { due: number; learned: number };
    recent: { score: number; submitted_at: string }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => {
      if (r.status === 401) { window.location.href = "/signin"; return null; }
      return r.json();
    }).then((d) => d && setData(d));
  }, []);

  if (!data) return <p>Loading analytics…</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">📊 Progress & Analytics</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-navy-200 p-6 dark:border-navy-700">
          <h2 className="font-bold">Estimated band trend (mocks)</h2>
          {data.mockTrend.length < 2 ? (
            <p className="mt-2 text-sm text-navy-500">Take at least 2 mock tests to see your trend. <Link href="/mock" className="text-accent-600 underline">Start one</Link></p>
          ) : (
            <div className="mt-4">
              {data.mockTrend.map((m, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-navy-500">{m.submitted_at.slice(0, 10)}</span>
                  <div className="h-4 flex-1 rounded-full bg-navy-100 dark:bg-navy-800">
                    <div className="h-4 rounded-full bg-accent-500" style={{ width: `${(m.overall_band / 9) * 100}%` }} />
                  </div>
                  <span className="w-10 font-bold">{m.overall_band.toFixed(1)}</span>
                </div>
              ))}
              <p className="mt-3 text-xs text-navy-500">Practice estimates only — distinguish these from verified lesson mastery.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-navy-200 p-6 dark:border-navy-700">
          <h2 className="font-bold">Mastery vs estimates</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span>Episodes passed (verified)</span><strong>{data.episodes.passed}/{data.episodes.total}</strong></li>
            <li className="flex justify-between"><span>Vocabulary learned (recall ≥ 70%)</span><strong>{data.vocab.learned}</strong></li>
            <li className="flex justify-between"><span>Current streak</span><strong>{data.streak.current_streak} days</strong></li>
            <li className="flex justify-between"><span>Total XP</span><strong>{data.xp}</strong></li>
          </ul>
          <p className="mt-3 text-xs text-navy-500">Verified mastery (passed episodes) is the reliable signal. Band estimates guide direction, not guarantees.</p>
        </section>

        <section className="rounded-2xl border border-navy-200 p-6 dark:border-navy-700">
          <h2 className="font-bold">Checkpoint score history</h2>
          {data.recent.length === 0 ? (
            <p className="mt-2 text-sm text-navy-500">No attempts yet.</p>
          ) : (
            <div className="mt-3 flex h-28 items-end gap-1">
              {data.recent.slice().reverse().map((r, i) => (
                <div key={i} className="flex-1 rounded-t" title={`${r.score}%`}
                  style={{ height: `${Math.max(4, r.score)}%`, background: r.score >= 70 ? "#10b981" : "#f59e0b" }} />
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-navy-500">Green = passed (70%+). Each bar is one checkpoint attempt.</p>
        </section>

        <section className="rounded-2xl border border-navy-200 p-6 dark:border-navy-700">
          <h2 className="font-bold">🎯 Recommended next actions</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>→ <Link href="/journey" className="text-accent-600 underline">Continue your journey</Link></li>
            {data.vocab.due > 0 && <li>→ <Link href="/vocabulary" className="text-accent-600 underline">Review {data.vocab.due} due vocabulary words</Link></li>}
            <li>→ <Link href="/revision" className="text-accent-600 underline">Clear your mistake notebook</Link></li>
            <li>→ <Link href="/mock" className="text-accent-600 underline">Take a mock test to calibrate</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
