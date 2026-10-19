"use client";

import { useState } from "react";
import { SkillPage } from "@/components/SkillPage";
import { Markdown } from "@/components/Markdown";
import { SignupNudge } from "@/components/SignupNudge";

const PROMPTS = [
  { id: "t2-opinion", task: "task2", label: "Task 2 — Opinion", prompt: "Some people believe that unpaid community service should be a compulsory part of high school programmes (for example working for a charity, improving the neighbourhood or teaching sports to younger children). To what extent do you agree or disagree?" },
  { id: "t2-discussion", task: "task2", label: "Task 2 — Discussion", prompt: "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your own opinion." },
  { id: "ac1-chart", task: "academic1", label: "Task 1 Academic — Chart", prompt: "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. (Describe the general trends: owned accommodation rose from ~23% to ~64%; rented fell correspondingly.)" },
  { id: "gt1-letter", task: "general1", label: "Task 1 General — Letter", prompt: "You recently bought a piece of equipment for your kitchen but it did not work. You phoned the shop but no action was taken. Write a letter to the shop manager. In your letter: describe the problem, explain what happened when you phoned, and say what you would like the manager to do." },
];

interface Feedback {
  band: number | null;
  criteria: { name: string; band: number; comment: string }[] | null;
  feedback_md: string;
  ai: boolean;
  disclaimer: string;
}

function WritingPractice() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Feedback | null>(null);
  const [error, setError] = useState("");
  const [needsSignup, setNeedsSignup] = useState(false);

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const prompt = PROMPTS[promptIdx];

  const submit = async () => {
    setError("");
    if (words < 50) {
      setError("Write at least 50 words before submitting for feedback.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.prompt, taskType: prompt.task, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "signup_required") { setNeedsSignup(true); return; }
        throw new Error(data.error || "Feedback failed.");
      }
      setResult(data);
      window.scrollTo({ top: document.body.scrollHeight });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Feedback failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 rounded-3xl border border-navy-200 p-6 dark:border-navy-700">
      <h2 className="text-xl font-bold">✍️ Writing practice with feedback</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {PROMPTS.map((p, i) => (
          <button key={p.id} onClick={() => { setPromptIdx(i); setResult(null); }}
            className={`rounded-lg px-3 py-1.5 text-sm ${i === promptIdx ? "bg-navy-800 text-white dark:bg-accent-600" : "border border-navy-200 dark:border-navy-700"}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-navy-50 p-4 text-sm dark:bg-navy-800/50">
        <p className="font-medium">Prompt:</p>
        <p className="mt-1">{prompt.prompt}</p>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder="Write your essay/letter here…"
        aria-label="Your writing"
        className="mt-4 w-full rounded-xl border border-navy-200 px-4 py-3 dark:border-navy-700 dark:bg-navy-900"
      />
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className={words < 150 ? "text-amber-600" : "text-emerald-600"}>{words} words {prompt.task === "task2" ? "(aim 250+)" : "(aim 150+)"}</span>
        <button onClick={submit} disabled={loading} className="rounded-xl bg-navy-800 px-6 py-2.5 font-semibold text-white disabled:opacity-50 dark:bg-accent-600">
          {loading ? "Analysing…" : "Get feedback"}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
      {needsSignup && <SignupNudge feature="AI writing feedback" />}

      {result && (
        <div className="mt-6 rounded-2xl bg-navy-50 p-6 dark:bg-navy-800/50">
          <div className="flex items-center gap-4">
            <p className="text-4xl font-black">{result.band !== null ? result.band.toFixed(1) : "—"}</p>
            <div>
              <p className="font-semibold">Estimated practice band</p>
              <p className="text-xs text-navy-500">{result.ai ? "AI assessment" : "Rule-based check"} · {result.disclaimer}</p>
            </div>
          </div>
          {result.criteria && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.criteria.map((c) => (
                <div key={c.name} className="rounded-xl bg-white p-4 dark:bg-navy-900">
                  <p className="font-semibold">{c.name}: {c.band.toFixed(1)}</p>
                  <p className="mt-1 text-sm">{c.comment}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4"><Markdown text={result.feedback_md} /></div>
        </div>
      )}
    </div>
  );
}

export default function Writing() {
  return (
    <div>
      <SkillPage kind="writing" title="Writing Academy" titleBn="রাইটিং একাডেমি" icon="✍️" />
      <WritingPractice />
    </div>
  );
}
