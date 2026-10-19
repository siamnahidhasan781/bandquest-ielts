"use client";

import { useEffect, useState } from "react";

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [denied, setDenied] = useState(false);

  const load = (t: string) => {
    setTab(t);
    fetch(`/api/admin?tab=${t}`).then((r) => {
      if (r.status === 403 || r.status === 401) { setDenied(true); return null; }
      return r.json();
    }).then((d) => d && setData(d));
  };

  useEffect(() => { load("overview"); }, []);

  if (denied) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold">🔒 Admin only</h1>
        <p className="mt-2 text-navy-500">Sign in with an administrator account to access this dashboard.</p>
      </div>
    );
  }

  const setEpisodeStatus = async (id: string, status: string) => {
    await fetch("/api/admin?tab=episode-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load("episodes");
  };

  const setConfig = async (key: string, value: string) => {
    await fetch("/api/admin?tab=config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    load("config");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">⚙ Admin Dashboard</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {["overview", "episodes", "questions", "config"].map((t) => (
          <button key={t} onClick={() => load(t)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${tab === t ? "bg-navy-800 text-white dark:bg-accent-600" : "border border-navy-200 dark:border-navy-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && data && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[["Users", (data as { users: number }).users], ["Attempts", (data as { attempts: number }).attempts],
            ["Questions", (data as { questions: number }).questions], ["Episodes", (data as { episodes: number }).episodes]]
            .map(([l, v]) => (
              <div key={l as string} className="rounded-2xl border border-navy-200 p-4 text-center dark:border-navy-700">
                <p className="text-sm text-navy-500">{l}</p>
                <p className="text-2xl font-bold">{v}</p>
              </div>
            ))}
          <div className="col-span-2 rounded-2xl border border-navy-200 p-4 dark:border-navy-700 sm:col-span-4">
            <h3 className="font-semibold">AI usage today</h3>
            {((data as { aiToday: { feature: string; c: number; t: number }[] }).aiToday ?? []).length === 0
              ? <p className="text-sm text-navy-500">No AI calls today.</p>
              : <ul className="mt-2 text-sm">{(data as { aiToday: { feature: string; c: number; t: number }[] }).aiToday.map((a) => (
                <li key={a.feature}>{a.feature}: {a.c} calls, {a.t ?? 0} tokens</li>))}
              </ul>}
          </div>
        </div>
      )}

      {tab === "episodes" && data && (
        <div className="mt-6 space-y-2">
          {((data as { episodes: { id: string; title: string; status: string; course_title: string }[] }).episodes ?? []).map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border border-navy-200 px-4 py-3 text-sm dark:border-navy-700">
              <span><strong>{e.course_title}</strong> · {e.title} <span className="text-navy-500">({e.status})</span></span>
              <select value={e.status} onChange={(ev) => setEpisodeStatus(e.id, ev.target.value)}
                className="rounded-lg border border-navy-200 px-2 py-1 dark:border-navy-700 dark:bg-navy-900">
                <option value="draft">draft</option>
                <option value="review">review</option>
                <option value="published">published</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === "questions" && data && (
        <div className="mt-6 space-y-2">
          <p className="text-sm text-navy-500">Showing {(data as { questions: unknown[] }).questions?.length ?? 0} published questions. Use POST /api/admin?tab=question to add more.</p>
          {((data as { questions: { id: string; module: string; qtype: string; difficulty: number; prompt_md: string; episode_title: string }[] }).questions ?? []).slice(0, 50).map((q) => (
            <div key={q.id} className="rounded-xl border border-navy-100 px-4 py-3 text-sm dark:border-navy-800">
              <p className="font-medium">{q.prompt_md.slice(0, 120)}</p>
              <p className="mt-1 text-xs text-navy-500">{q.module} · {q.qtype} · difficulty {q.difficulty} · {q.episode_title ?? "no episode"}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "config" && data && (
        <div className="mt-6 space-y-2">
          {((data as { config: { key: string; value: string }[] }).config ?? []).map((c) => (
            <div key={c.key} className="flex items-center gap-3 rounded-xl border border-navy-200 px-4 py-3 text-sm dark:border-navy-700">
              <code className="min-w-48 font-mono text-xs">{c.key}</code>
              <input defaultValue={c.value} id={`cfg-${c.key}`}
                className="flex-1 rounded-lg border border-navy-200 px-3 py-1.5 dark:border-navy-700 dark:bg-navy-900" />
              <button onClick={() => {
                const el = document.getElementById(`cfg-${c.key}`) as HTMLInputElement;
                setConfig(c.key, el.value);
              }} className="rounded-lg bg-navy-800 px-3 py-1.5 text-white dark:bg-accent-600">Save</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
