"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Card {
  vocab_id: string;
  word: string;
  pos: string;
  topic: string;
  repetitions: number;
}
interface Answer {
  definition_en: string;
  definition_bn: string | null;
  ipa: string | null;
  example_en: string;
}

const TOPICS = ["all", "education", "technology", "environment", "health", "work"];

export default function Vocabulary() {
  const [cards, setCards] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [done, setDone] = useState(false);
  const [topic, setTopic] = useState("all");
  const [mode, setMode] = useState<"recognition" | "recall" | "contextual">("recall");

  const load = (t = topic) => {
    setIdx(0); setFlipped(false); setAnswer(null); setDone(false);
    fetch(`/api/vocab/due?limit=20`)
      .then((r) => r.json())
      .then((d) => {
        const all: Card[] = d.cards ?? [];
        setCards(t === "all" ? all : all.filter((c) => c.topic === t));
      });
  };

  useEffect(() => { load(); }, []);

  const grade = async (g: number) => {
    const card = cards[idx];
    const res = await fetch("/api/vocab/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocabId: card.vocab_id, grade: g, mode }),
    });
    const data = await res.json();
    setAnswer(data.answer ?? null);
    setFlipped(true);
  };

  const next = () => {
    setFlipped(false);
    setAnswer(null);
    if (idx + 1 >= cards.length) setDone(true);
    else setIdx(idx + 1);
  };

  const card = cards[idx];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">📚 Vocabulary Academy</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">
        Spaced repetition: words return right before you forget them. Flip the card, then grade yourself honestly.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button key={t} onClick={() => { setTopic(t); load(t); }}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${topic === t ? "bg-navy-800 text-white dark:bg-accent-600" : "border border-navy-200 dark:border-navy-700"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2 text-sm">
        {(["recognition", "recall", "contextual"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-1.5 capitalize ${mode === m ? "bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-200" : "text-navy-500"}`}>
            {m}
          </button>
        ))}
      </div>

      {done ? (
        <div className="mt-8 rounded-3xl bg-emerald-50 p-8 text-center dark:bg-emerald-900/20">
          <h2 className="text-2xl font-bold">🎉 Session complete!</h2>
          <p className="mt-2 text-sm">Reviewed {cards.length} words. Come back tomorrow — due words will be waiting.</p>
          <button onClick={() => load()} className="mt-4 rounded-xl bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-600">Review again</button>
        </div>
      ) : !card ? (
        <p className="mt-8">Loading cards… (sign in to track your spaced repetition)</p>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-navy-500">Card {idx + 1} of {cards.length} · {card.topic}</p>
          <div className="mt-2 rounded-3xl border border-navy-200 p-8 text-center dark:border-navy-700">
            <p className="text-4xl font-black">{card.word}</p>
            <p className="mt-1 text-sm text-navy-500">({card.pos})</p>
            {mode === "recognition" && <p className="mt-4 text-sm text-navy-500">Do you recognise this word? Flip to check.</p>}
            {mode === "recall" && <p className="mt-4 text-sm text-navy-500">Can you recall the meaning? Flip to check.</p>}
            {mode === "contextual" && <p className="mt-4 text-sm text-navy-500">Use it in a sentence in your head, then flip.</p>}

            {flipped && answer && (
              <div className="mt-6 rounded-2xl bg-navy-50 p-5 text-left dark:bg-navy-800/50">
                <p className="font-semibold">{answer.definition_en}</p>
                {answer.definition_bn && <p className="text-navy-500">{answer.definition_bn}</p>}
                {answer.ipa && <p className="mt-1 text-sm text-navy-500">{answer.ipa}</p>}
                <p className="mt-2 text-sm italic">“{answer.example_en}”</p>
                <button onClick={next} className="mt-4 w-full rounded-xl bg-navy-800 py-2.5 font-semibold text-white dark:bg-accent-600">
                  Next →
                </button>
              </div>
            )}
          </div>

          {!flipped && (
            <div className="mt-4">
              <button onClick={() => setFlipped(true)} className="w-full rounded-xl border border-navy-200 py-3 font-medium dark:border-navy-700">
                Flip card
              </button>
              <p className="mt-3 text-center text-sm text-navy-500">How well did you know it?</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[
                  [0, "Forgot", "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"],
                  [3, "Hard", "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"],
                  [4, "Good", "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"],
                  [5, "Easy", "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"],
                ].map(([g, label, cls]) => (
                  <button key={label as string} onClick={() => grade(g as number)} className={`rounded-xl px-2 py-3 font-semibold ${cls}`}>
                    {label as string}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-navy-50 p-5 text-sm dark:bg-navy-800/50">
        <p>💡 <strong>Honest grading matters.</strong> Mark "Good" only if you truly knew it — the algorithm schedules reviews based on your grades. Recognition alone doesn't count as mastery.</p>
        <Link href="/revision" className="mt-2 inline-block text-accent-600">Review your mistake notebook →</Link>
      </div>
    </div>
  );
}
