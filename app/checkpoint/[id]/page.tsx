"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Markdown } from "@/components/Markdown";

interface Question {
  id: string;
  module: string;
  qtype: string;
  difficulty: number;
  prompt_md: string;
  options_json: string[] | null;
  skill_tags: string[];
}

interface Result {
  attemptId: string;
  score: number;
  stars: number;
  passed: boolean;
  results: Array<{
    questionId: string;
    isCorrect: boolean;
    score: number;
    explanation_md: string;
    explanation_md_bn: string | null;
    skill_tags: string[];
  }>;
  remediation: { weakTags: string[]; message: string; message_bn: string } | null;
  xpAwarded: number;
  unlockedNext: string | null;
}

function QuestionInput({ q, value, onChange }: { q: Question; value: unknown; onChange: (v: unknown) => void }) {
  if (q.qtype === "mcq" && q.options_json) {
    return (
      <div className="mt-3 space-y-2" role="radiogroup" aria-label="Answer options">
        {q.options_json.map((opt, i) => (
          <label key={i} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${value === i ? "border-accent-500 bg-accent-50 dark:bg-accent-900/20" : "border-navy-200 dark:border-navy-700"}`}>
            <input type="radio" name={q.id} checked={value === i} onChange={() => onChange(i)} className="mt-1" />
            <span className="text-sm"><Markdown text={opt} /></span>
          </label>
        ))}
      </div>
    );
  }
  if (q.qtype === "truefalse") {
    const opts = [
      { v: "true", label: "True" },
      { v: "false", label: "False" },
      { v: "notgiven", label: "Not Given" },
    ];
    return (
      <div className="mt-3 flex flex-wrap gap-3" role="radiogroup" aria-label="True, false or not given">
        {opts.map((o) => (
          <label key={o.v} className={`cursor-pointer rounded-xl border px-5 py-3 font-medium ${value === o.v ? "border-accent-500 bg-accent-50 dark:bg-accent-900/20" : "border-navy-200 dark:border-navy-700"}`}>
            <input type="radio" name={q.id} checked={value === o.v} onChange={() => onChange(o.v)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    );
  }
  if (q.qtype === "fillblank") {
    return (
      <input
        type="text"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer…"
        aria-label="Your answer"
        className="mt-3 w-full rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900"
      />
    );
  }
  return (
    <textarea
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write your answer…"
      rows={3}
      aria-label="Your answer"
      className="mt-3 w-full rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900"
    />
  );
}

export default function Checkpoint() {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  // Questions were assigned at attempt start; refetch from a lightweight endpoint
  useEffect(() => {
    fetch(`/api/attempts/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setQuestions(d.questions ?? []);
      })
      .catch(() => setError("Could not load questions."));
  }, [params.id]);

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/attempts/${params.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setResult(data);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className={`rounded-3xl p-8 text-center ${result.passed ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
          <p className="text-6xl font-black">{result.score}%</p>
          <p className="mt-2 text-2xl text-amber-500">{"★".repeat(result.stars)}{"☆".repeat(5 - result.stars)}</p>
          <h1 className="mt-3 text-2xl font-bold">{result.passed ? "🎉 Passed! Well done." : "💪 Not yet — keep going."}</h1>
          <p className="mt-2 text-sm">+{result.xpAwarded} XP earned</p>
          {result.passed && result.unlockedNext && (
            <Link href={`/lesson/${result.unlockedNext}`} className="mt-4 inline-block rounded-xl bg-navy-800 px-6 py-3 font-semibold text-white dark:bg-accent-600">
              Continue to next episode →
            </Link>
          )}
          {!result.passed && result.remediation && (
            <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-white p-5 text-left dark:bg-navy-900">
              <h2 className="font-bold">🎯 Your remediation plan</h2>
              <p className="mt-2 text-sm">{result.remediation.message}</p>
              <p className="mt-2 text-sm text-navy-500">{result.remediation.message_bn}</p>
              <button onClick={() => router.push("/journey")} className="mt-4 rounded-xl bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-600">
                Review lesson & retry
              </button>
            </div>
          )}
        </div>

        <h2 className="mt-8 text-xl font-bold">Answer review</h2>
        <div className="mt-4 space-y-4">
          {result.results.map((r, i) => {
            const q = questions?.find((qq) => qq.id === r.questionId);
            return (
              <div key={r.questionId} className={`rounded-2xl border p-5 ${r.isCorrect ? "border-emerald-200 dark:border-emerald-800" : "border-red-200 dark:border-red-800"}`}>
                <p className="font-semibold">Q{i + 1}. {r.isCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
                {q && <div className="mt-2 text-sm"><Markdown text={q.prompt_md} /></div>}
                <div className="mt-3 rounded-xl bg-navy-50 p-4 text-sm dark:bg-navy-800/50">
                  <p className="font-medium">Why:</p>
                  <Markdown text={r.explanation_md} />
                  {r.explanation_md_bn && <p className="mt-2 text-navy-500">{r.explanation_md_bn}</p>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <Link href="/journey" className="rounded-xl border border-navy-200 px-5 py-2.5 text-sm dark:border-navy-700">Back to journey</Link>
          {result.passed && result.unlockedNext && (
            <Link href={`/lesson/${result.unlockedNext}`} className="rounded-xl bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-600">Next episode →</Link>
          )}
        </div>
      </div>
    );
  }

  if (!questions) return <p>{error || "Loading checkpoint…"}</p>;

  const answered = Object.keys(responses).filter((k) => responses[k] !== undefined && responses[k] !== "").length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Checkpoint</h1>
      <p className="mt-1 text-sm text-navy-500">{answered}/{questions.length} answered · 70% to pass</p>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
      <div className="mt-6 space-y-6">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
            <p className="text-sm font-medium text-navy-500">Question {i + 1} of {questions.length}</p>
            <div className="mt-1"><Markdown text={q.prompt_md} /></div>
            <QuestionInput q={q} value={responses[q.id]} onChange={(v) => setResponses({ ...responses, [q.id]: v })} />
          </div>
        ))}
      </div>
      <button onClick={submit} disabled={submitting}
        className="mt-6 w-full rounded-xl bg-navy-800 py-3 font-semibold text-white disabled:opacity-50 dark:bg-accent-600">
        {submitting ? "Grading…" : "Submit checkpoint"}
      </button>
    </div>
  );
}
