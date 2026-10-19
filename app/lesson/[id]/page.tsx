"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Markdown } from "@/components/Markdown";

interface Episode {
  id: string;
  title: string;
  title_bn: string;
  sort_order: number;
  objectives: string[];
  content_md: string;
  content_md_bn: string;
  vocab: Array<{ word: string; pos: string; definition: string; bn: string; example: string; collocations?: string[] }>;
  pass_threshold: number;
  progress: { status: string; best_score: number | null; best_stars: number | null; attempts_count: number };
}

export default function Lesson() {
  const params = useParams();
  const router = useRouter();
  const [ep, setEp] = useState<Episode | null>(null);
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/episodes/${params.id}`)
      .then((r) => r.json())
      .then((d) => setEp(d.episode ?? null));
  }, [params.id]);

  const startCheckpoint = async () => {
    setError("");
    setStarting(true);
    try {
      const res = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId: params.id, kind: "checkpoint" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkpoint.");
      router.push(`/checkpoint/${data.attemptId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkpoint.");
    } finally {
      setStarting(false);
    }
  };

  if (!ep) return <p>Loading lesson…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/journey" className="text-sm text-accent-600">← Back to journey</Link>
      <h1 className="mt-2 text-3xl font-bold">Episode {ep.sort_order}: {ep.title}</h1>
      <p className="text-lg text-navy-500">{ep.title_bn}</p>

      <div className="mt-4 rounded-2xl bg-navy-50 p-5 dark:bg-navy-800/50">
        <h2 className="font-semibold">🎯 Learning objectives</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {ep.objectives.map((o, i) => <li key={i}>{o}</li>)}
        </ul>
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={() => setLang("en")} className={`rounded-lg px-4 py-2 text-sm font-medium ${lang === "en" ? "bg-navy-800 text-white dark:bg-accent-600" : "border border-navy-200 dark:border-navy-700"}`}>English</button>
        <button onClick={() => setLang("bn")} className={`rounded-lg px-4 py-2 text-sm font-medium ${lang === "bn" ? "bg-navy-800 text-white dark:bg-accent-600" : "border border-navy-200 dark:border-navy-700"}`}>বাংলা ব্যাখ্যা</button>
      </div>

      <article className="mt-4 rounded-2xl border border-navy-100 p-6 dark:border-navy-800">
        <Markdown text={lang === "en" ? ep.content_md : ep.content_md_bn} />
      </article>

      {ep.vocab.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold">📚 Key vocabulary</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {ep.vocab.map((v) => (
              <div key={v.word} className="rounded-xl border border-navy-100 p-4 dark:border-navy-800">
                <p className="font-semibold">{v.word} <span className="text-xs font-normal text-navy-500">({v.pos})</span></p>
                <p className="text-sm">{v.definition}</p>
                <p className="text-sm text-navy-500">{v.bn}</p>
                <p className="mt-1 text-sm italic text-navy-600 dark:text-navy-300">“{v.example}”</p>
                {v.collocations && <p className="mt-1 text-xs text-accent-600">⚡ {v.collocations.join(" · ")}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-2xl bg-navy-900 p-6 text-white dark:bg-navy-800">
        <h2 className="text-xl font-bold">✅ Checkpoint</h2>
        <p className="mt-2 text-sm text-navy-200">
          Score <strong>{ep.pass_threshold}%+</strong> to unlock the next episode. Questions are scored on our server —
          and if you don't pass, your retry uses <strong>different questions</strong> on the same objectives.
        </p>
        {ep.progress.attempts_count > 0 && (
          <p className="mt-2 text-sm text-navy-200">Previous attempts: {ep.progress.attempts_count} · Best: {ep.progress.best_score}%</p>
        )}
        {error && <p role="alert" className="mt-3 rounded-xl bg-red-900/50 p-3 text-sm">{error}</p>}
        <button onClick={startCheckpoint} disabled={starting}
          className="mt-4 rounded-xl bg-accent-500 px-6 py-3 font-semibold text-navy-950 disabled:opacity-50">
          {starting ? "Preparing…" : "Start checkpoint"}
        </button>
      </section>
    </div>
  );
}
