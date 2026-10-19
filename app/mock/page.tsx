"use client";

import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/Markdown";
import { SignupNudge } from "@/components/SignupNudge";

interface Q {
  id: string;
  qtype: string;
  prompt_md: string;
  options_json: string[] | null;
}

const SECTION_TIMES: Record<string, number> = { listening: 20, reading: 25, writing: 40 };

export default function Mock() {
  const [mocks, setMocks] = useState<{ id: string; title: string; test_type: string }[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, Q[]>>({});
  const [current, setCurrent] = useState("listening");
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [writing, setWriting] = useState({ task1: "", task2: "" });
  const [timeLeft, setTimeLeft] = useState(0);
  const [report, setReport] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsSignup, setNeedsSignup] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/mock").then((r) => r.json()).then((d) => setMocks(d.mocks ?? []));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const start = async (mockId: string) => {
    const res = await fetch("/api/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mockId, sections: ["listening", "reading", "writing"] }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.code === "signup_required") { setNeedsSignup(true); return; }
      alert(data.error || "Could not start."); return;
    }
    setSessionId(data.sessionId);
    setSections(data.sections);
    setCurrent("listening");
    setTimeLeft(SECTION_TIMES.listening * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Auto-advance or auto-submit
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    window.scrollTo({ top: 0 });
  };

  const switchSection = (s: string) => {
    setCurrent(s);
    setTimeLeft(SECTION_TIMES[s] * 60);
  };

  const submit = async () => {
    if (!sessionId || submitting) return;
    if (!confirm("Submit your mock test? This cannot be undone.")) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const res = await fetch(`/api/mock?sessionId=${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses, writing }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { alert(data.error || "Submit failed."); return; }
    setReport(data.report_md);
    window.scrollTo({ top: 0 });
  };

  if (needsSignup) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Mock tests</h1>
        <SignupNudge feature="Mock tests" />
      </div>
    );
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (report) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Mock test report</h1>
        <div className="mt-4 rounded-2xl border border-navy-200 p-6 dark:border-navy-700">
          <Markdown text={report} />
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div>
        <h1 className="text-3xl font-bold">⏱️ Mock Test Centre</h1>
        <p className="mt-2 text-navy-600 dark:text-navy-300">
          Realistic timed practice. Listening & Reading are auto-scored; Writing gets a heuristic band
          (use the Writing Academy for detailed AI feedback).
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {mocks.map((m) => (
            <div key={m.id} className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
              <h3 className="font-semibold">{m.title}</h3>
              <p className="text-sm capitalize text-navy-500">{m.test_type}</p>
              <p className="mt-2 text-sm text-navy-500">Listening 20 min · Reading 25 min · Writing 40 min</p>
              <button onClick={() => start(m.id)} className="mt-3 rounded-xl bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-600">
                Start mock test
              </button>
            </div>
          ))}
          {mocks.length === 0 && <p>Loading…</p>}
        </div>
        <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm dark:bg-amber-900/20">
          <p>⚠️ This is a <strong>practice</strong> environment with original BandQuest questions — not official IELTS papers. Band estimates are approximate and educational only.</p>
        </div>
      </div>
    );
  }

  const qs = sections[current] ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="sticky top-16 z-30 flex items-center justify-between rounded-2xl bg-navy-900 p-4 text-white dark:bg-navy-800">
        <div className="flex gap-2">
          {["listening", "reading", "writing"].map((s) => (
            <button key={s} onClick={() => switchSection(s)}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize ${current === s ? "bg-accent-500 text-navy-950" : "bg-navy-800"}`}>
              {s}
            </button>
          ))}
        </div>
        <p className={`font-mono text-xl font-bold ${timeLeft < 300 ? "text-red-400" : ""}`}>⏱ {fmt(timeLeft)}</p>
      </div>

      {current !== "writing" ? (
        <div className="mt-6 space-y-5">
          {qs.map((q, i) => (
            <div key={q.id} className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
              <p className="text-sm font-medium text-navy-500">Q{i + 1}</p>
              <div className="mt-1"><Markdown text={q.prompt_md} /></div>
              {q.qtype === "mcq" && q.options_json ? (
                <div className="mt-3 space-y-2">
                  {q.options_json.map((opt, oi) => (
                    <label key={oi} className="flex cursor-pointer items-center gap-3 rounded-xl border border-navy-200 p-3 dark:border-navy-700">
                      <input type="radio" name={q.id} checked={responses[q.id] === oi} onChange={() => setResponses({ ...responses, [q.id]: oi })} />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : q.qtype === "truefalse" ? (
                <div className="mt-3 flex gap-2">
                  {["true", "false", "notgiven"].map((v) => (
                    <label key={v} className="cursor-pointer rounded-xl border border-navy-200 px-4 py-2 text-sm capitalize dark:border-navy-700">
                      <input type="radio" name={q.id} checked={responses[q.id] === v} onChange={() => setResponses({ ...responses, [q.id]: v })} className="sr-only" />
                      {v === "notgiven" ? "Not Given" : v}
                    </label>
                  ))}
                </div>
              ) : (
                <input type="text" value={(responses[q.id] as string) ?? ""} onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                  className="mt-3 w-full rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900" placeholder="Your answer…" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
            <h3 className="font-semibold">Writing Task 1 (150+ words)</h3>
            <p className="mt-1 text-sm text-navy-500">Describe the chart trend from the Writing Academy lesson: urban farming growth over the last decade.</p>
            <textarea value={writing.task1} onChange={(e) => setWriting({ ...writing, task1: e.target.value })} rows={8}
              className="mt-3 w-full rounded-xl border border-navy-200 px-4 py-3 dark:border-navy-700 dark:bg-navy-900" />
            <p className="text-sm text-navy-500">{writing.task1.trim().split(/\s+/).filter(Boolean).length} words</p>
          </div>
          <div className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
            <h3 className="font-semibold">Writing Task 2 (250+ words)</h3>
            <p className="mt-1 text-sm text-navy-500">Some people think governments should invest more in public transport. To what extent do you agree or disagree?</p>
            <textarea value={writing.task2} onChange={(e) => setWriting({ ...writing, task2: e.target.value })} rows={12}
              className="mt-3 w-full rounded-xl border border-navy-200 px-4 py-3 dark:border-navy-700 dark:bg-navy-900" />
            <p className="text-sm text-navy-500">{writing.task2.trim().split(/\s+/).filter(Boolean).length} words</p>
          </div>
        </div>
      )}

      <button onClick={submit} disabled={submitting} className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-50">
        {submitting ? "Scoring…" : "Submit mock test"}
      </button>
    </div>
  );
}
