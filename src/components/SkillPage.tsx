"use client";

import { useEffect, useState } from "react";
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
  progress: { status: string; best_score: number | null; best_stars: number | null };
}

export function SkillPage({ kind, title, titleBn, icon, extra }: {
  kind: string; title: string; titleBn: string; icon: string;
  extra?: (ep: Episode, extraData: { passage: string | null; audio_script: string | null }) => React.ReactNode;
}) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [extras, setExtras] = useState<Record<string, { passage: string | null; audio_script: string | null }>>({});
  const [active, setActive] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "bn">("en");

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => {
        const course = (d.courses ?? []).find((c: { kind: string }) => c.kind === kind);
        const eps: Episode[] = [];
        if (course) {
          for (const e of course.episodes) {
            fetch(`/api/episodes/${e.id}`).then((r) => r.json()).then((dd) => {
              if (dd.episode) {
                eps.push(dd.episode);
                setEpisodes([...eps].sort((a, b) => a.sort_order - b.sort_order));
                fetch(`/api/skills/extra?episodeId=${e.id}`).then((r) => r.json()).then((x) => {
                  setExtras((prev) => ({ ...prev, [e.id]: x }));
                }).catch(() => {});
              }
            });
          }
        }
      });
  }, [kind]);

  const current = episodes.find((e) => e.id === active);

  return (
    <div>
      <h1 className="text-3xl font-bold">{icon} {title}</h1>
      <p className="mt-1 text-navy-500">{titleBn}</p>

      {!current ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {episodes.map((ep) => (
            <button key={ep.id} onClick={() => setActive(ep.id)} className="rounded-2xl border border-navy-200 p-5 text-left transition hover:border-accent-400 dark:border-navy-700">
              <h3 className="font-semibold">{ep.title}</h3>
              <p className="text-sm text-navy-500">{ep.title_bn}</p>
              <p className="mt-2 text-sm">
                {ep.progress.best_score !== null ? `Best: ${ep.progress.best_score}% ${"★".repeat(ep.progress.best_stars ?? 0)}` : "Not attempted yet"}
              </p>
            </button>
          ))}
          {episodes.length === 0 && <p>Loading lessons…</p>}
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-3xl">
          <button onClick={() => setActive(null)} className="text-sm text-accent-600">← All {title} lessons</button>
          <h2 className="mt-2 text-2xl font-bold">{current.title}</h2>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setLang("en")} className={`rounded-lg px-4 py-2 text-sm font-medium ${lang === "en" ? "bg-navy-800 text-white dark:bg-accent-600" : "border border-navy-200 dark:border-navy-700"}`}>English</button>
            <button onClick={() => setLang("bn")} className={`rounded-lg px-4 py-2 text-sm font-medium ${lang === "bn" ? "bg-navy-800 text-white dark:bg-accent-600" : "border border-navy-200 dark:border-navy-700"}`}>বাংলা</button>
          </div>
          {extra && extra(current, extras[current.id] ?? { passage: null, audio_script: null })}
          <article className="mt-4 rounded-2xl border border-navy-100 p-6 dark:border-navy-800">
            <Markdown text={lang === "en" ? current.content_md : current.content_md_bn} />
          </article>
          <StartCheckpointButton episodeId={current.id} />
        </div>
      )}
    </div>
  );
}

export function StartCheckpointButton({ episodeId }: { episodeId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, kind: "checkpoint" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start.");
      window.location.href = `/checkpoint/${data.attemptId}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl bg-navy-900 p-6 text-white dark:bg-navy-800">
      <h3 className="font-bold">✅ Practice checkpoint</h3>
      <p className="mt-1 text-sm text-navy-200">Test yourself on this lesson. 70% to pass.</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
      <button onClick={start} disabled={loading} className="mt-3 rounded-xl bg-accent-500 px-6 py-2.5 font-semibold text-navy-950 disabled:opacity-50">
        {loading ? "Preparing…" : "Start practice"}
      </button>
    </div>
  );
}

/** Browser TTS player for listening scripts (fallback when no audio file). */
export function TtsPlayer({ script }: { script: string }) {
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);

  const play = () => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support speech playback.");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(script);
    u.rate = rate;
    u.lang = "en-US";
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return (
    <div className="mt-4 rounded-2xl border border-accent-200 bg-accent-50 p-5 dark:border-accent-800 dark:bg-accent-900/20">
      <h3 className="font-semibold">🔊 Listen to the audio</h3>
      <p className="mt-1 text-xs text-navy-500">Transcript is hidden during practice — it appears after you submit.</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!playing ? (
          <button onClick={play} className="rounded-xl bg-navy-800 px-5 py-2.5 font-medium text-white dark:bg-accent-600">▶ Play</button>
        ) : (
          <button onClick={stop} className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white">⏹ Stop</button>
        )}
        <label className="text-sm">Speed:
          <select value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="ml-2 rounded-lg border border-navy-200 px-2 py-1 dark:border-navy-700 dark:bg-navy-900">
            <option value="0.75">0.75×</option>
            <option value="1">1×</option>
            <option value="1.25">1.25×</option>
          </select>
        </label>
      </div>
    </div>
  );
}
