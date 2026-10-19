"use client";

import { useEffect, useState } from "react";

interface Source {
  title: string;
  url: string;
  category: string;
  skill: string;
}

export default function Resources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/resources").then((r) => r.json()).then((d) => setSources(d.sources ?? []));
  }, []);

  const filtered = filter === "all" ? sources : sources.filter((s) => s.skill === filter || s.category === filter);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">📚 Study Resources</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">Curated official and community resources. BandQuest practice materials are original — these links take you to legitimate external sources.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {["all", "official", "community"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${filter === f ? "bg-navy-800 text-white dark:bg-accent-600" : "border border-navy-200 dark:border-navy-700"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
            className="block rounded-2xl border border-navy-200 p-5 hover:border-accent-400 dark:border-navy-700">
            <h3 className="font-semibold">{s.title} ↗</h3>
            <p className="mt-1 text-xs text-navy-500 capitalize">{s.category} · {s.skill}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-navy-50 p-5 text-sm dark:bg-navy-800/50">
        <h2 className="font-bold">Content honesty</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Official samples:</strong> from ielts.org, British Council, Cambridge — linked above.</li>
          <li><strong>BandQuest originals:</strong> all in-app lessons, questions and mock materials are written by us.</li>
          <li>We never reproduce copyrighted Cambridge books or claim leaked questions will appear in your exam.</li>
        </ul>
      </div>
    </div>
  );
}
