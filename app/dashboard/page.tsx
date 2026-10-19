"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Dashboard {
  xp: number;
  streak: { current_streak: number; longest_streak: number };
  episodes: { passed: number; total: number };
  nextUp: { id: string; title: string; course_title: string; status: string }[];
  recent: { id: string; score: number; stars: number; passed: number; submitted_at: string; episode_title: string }[];
  mockTrend: { overall_band: number; submitted_at: string }[];
  vocab: { due: number; learned: number };
  weakConcepts: { concept: string; mastery: number }[];
  achievements: { code: string; title: string; earned_at: string }[];
  activity: { d: string; xp: number }[];
}

export default function Dashboard() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (r.status === 401) { window.location.href = "/signin"; return null; }
        return r.json();
      })
      .then((d) => d && setData(d));
  }, []);

  if (!data) return <p>Loading your dashboard…</p>;

  const maxXp = Math.max(1, ...data.activity.map((a) => a.xp));

  return (
    <div>
      <h1 className="text-3xl font-bold">Learning Dashboard</h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["⚡ XP", String(data.xp)],
          ["🔥 Streak", `${data.streak.current_streak} days`],
          ["📖 Episodes", `${data.episodes.passed}/${data.episodes.total}`],
          ["📚 Vocab due", String(data.vocab.due)],
        ].map(([label, val]) => (
          <div key={label} className="rounded-2xl border border-navy-200 p-4 text-center dark:border-navy-700">
            <p className="text-sm text-navy-500">{label}</p>
            <p className="text-2xl font-bold">{val}</p>
          </div>
        ))}
      </div>

      {/* Continue */}
      {data.nextUp.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">▶ Continue learning</h2>
          <div className="mt-3 space-y-3">
            {data.nextUp.map((n) => (
              <Link key={n.id} href={`/lesson/${n.id}`} className="flex items-center justify-between rounded-2xl border border-navy-200 p-4 hover:border-accent-400 dark:border-navy-700">
                <div>
                  <p className="text-xs text-navy-500">{n.course_title}</p>
                  <p className="font-semibold">{n.title}</p>
                </div>
                <span className="text-accent-600">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Activity */}
        <section className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
          <h2 className="font-bold">7-day XP activity</h2>
          <div className="mt-4 flex h-24 items-end gap-2">
            {data.activity.map((a) => (
              <div key={a.d} className="flex-1" title={`${a.d}: ${a.xp} XP`}>
                <div className="rounded-t bg-accent-500" style={{ height: `${Math.max(4, (a.xp / maxXp) * 90)}px` }} />
                <p className="mt-1 text-center text-xs text-navy-500">{a.d.slice(5)}</p>
              </div>
            ))}
            {data.activity.length === 0 && <p className="text-sm text-navy-500">No activity yet — start your first lesson!</p>}
          </div>
        </section>

        {/* Weak spots */}
        <section className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
          <h2 className="font-bold">🎯 Focus areas</h2>
          {data.weakConcepts.length === 0 ? (
            <p className="mt-2 text-sm text-navy-500">No weak spots detected yet. Keep practising!</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {data.weakConcepts.map((w) => (
                <li key={w.concept} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{w.concept.replace(/-/g, " ")}</span>
                  <span className="text-navy-500">{Math.round(w.mastery * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/revision" className="mt-3 inline-block text-sm text-accent-600">Open mistake notebook →</Link>
        </section>

        {/* Mock trend */}
        <section className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
          <h2 className="font-bold">📈 Mock band trend</h2>
          {data.mockTrend.length === 0 ? (
            <p className="mt-2 text-sm text-navy-500">No mocks yet. <Link href="/mock" className="text-accent-600 underline">Take one</Link></p>
          ) : (
            <div className="mt-2 flex items-end gap-2">
              {data.mockTrend.map((m, i) => (
                <div key={i} className="flex-1 text-center" title={`${m.submitted_at}: ${m.overall_band}`}>
                  <p className="text-lg font-bold">{m.overall_band.toFixed(1)}</p>
                  <div className="mx-auto h-16 w-8 rounded-t bg-navy-700" style={{ height: `${(m.overall_band / 9) * 64}px` }} />
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-navy-500">Estimated practice bands only — not official scores.</p>
        </section>

        {/* Achievements */}
        <section className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
          <h2 className="font-bold">🏆 Recent achievements</h2>
          {data.achievements.length === 0 ? (
            <p className="mt-2 text-sm text-navy-500">None yet — your first is one lesson away.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {data.achievements.map((a) => <li key={a.code}>🏅 {a.title}</li>)}
            </ul>
          )}
          <Link href="/achievements" className="mt-3 inline-block text-sm text-accent-600">All achievements →</Link>
        </section>
      </div>

      {/* Recent attempts */}
      {data.recent.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">Recent attempts</h2>
          <div className="mt-3 space-y-2">
            {data.recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 text-sm dark:border-navy-800">
                <span>{r.episode_title ?? "Practice"}</span>
                <span>{r.passed ? "✅" : "📝"} {r.score}% {"★".repeat(r.stars)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
