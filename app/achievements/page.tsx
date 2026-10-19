"use client";

import { useEffect, useState } from "react";

interface Ach {
  code: string;
  title: string;
  description: string;
  xp_reward: number;
  earned: boolean;
  earned_at: string | null;
}

export default function Achievements() {
  const [achs, setAchs] = useState<Ach[]>([]);

  useEffect(() => {
    fetch("/api/achievements").then((r) => r.json()).then((d) => setAchs(d.achievements ?? []));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">🏆 Achievements</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">Earned through real learning — never for just clicking around.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achs.map((a) => (
          <div key={a.code} className={`rounded-2xl border p-5 ${a.earned ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20" : "border-navy-200 opacity-60 dark:border-navy-700"}`}>
            <p className="text-3xl">{a.earned ? "🏅" : "🔒"}</p>
            <h3 className="mt-2 font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{a.description}</p>
            <p className="mt-2 text-xs text-navy-500">+{a.xp_reward} XP {a.earned_at && `· earned ${a.earned_at.slice(0, 10)}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
