"use client";

import { useEffect, useRef, useState } from "react";
import { SkillPage } from "@/components/SkillPage";
import { Markdown } from "@/components/Markdown";
import { SignupNudge } from "@/components/SignupNudge";

const PART1_QS = [
  "Let's talk about your hometown. Where is it?",
  "Do you like reading? Why or why not?",
  "What do you usually do in your free time?",
  "Is there anything you would like to learn in the future?",
];
const PART2_CARD = {
  topic: "Describe a skill you would like to learn.",
  bullets: ["What the skill is", "Why you want to learn it", "How you would learn it", "And explain how it would help you."],
};
const PART3_QS = [
  "What skills do you think are most important for young people today?",
  "Do you think schools should teach practical skills? Why?",
  "How has technology changed the way people learn new skills?",
];

interface Feedback {
  band: number | null;
  criteria: { name: string; band: number; comment: string }[] | null;
  feedback_md: string;
  transcript: string | null;
  ai: boolean;
  disclaimer: string;
}

function SpeakingExaminer() {
  const [stage, setStage] = useState<"idle" | "part1" | "part2prep" | "part2" | "part3" | "done">("idle");
  const [qIndex, setQIndex] = useState(0);
  const [prepLeft, setPrepLeft] = useState(60);
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Feedback | null>(null);
  const [needsSignup, setNeedsSignup] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion =
    stage === "part1" ? PART1_QS[qIndex]
    : stage === "part3" ? PART3_QS[qIndex]
    : stage === "part2" ? "Now speak for 1–2 minutes on the cue card." : "";

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepRef.current) clearInterval(prepRef.current);
    mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setRecordSecs(0);
      timerRef.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
    } catch {
      setError("Microphone access was denied or unavailable. Please allow microphone permission and try again.");
    }
  };

  const stopRecording = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const mr = mediaRef.current;
      if (!mr || mr.state === "inactive") return resolve(null);
      mr.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        mr.stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        resolve(new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" }));
      };
      mr.stop();
    });

  const submitAnswer = async () => {
    const blob = await stopRecording();
    if (!blob || blob.size < 1000) {
      setError("Recording was too short. Please record at least a few seconds.");
      return;
    }
    setLoading(true);
    try {
      const buf = await blob.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf).slice(0, 5_000_000)));
      const res = await fetch("/api/ai/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part: stage === "part2" ? "part2" : stage === "part3" ? "part3" : "part1",
          question: stage === "part2" ? `${PART2_CARD.topic} ${PART2_CARD.bullets.join("; ")}` : currentQuestion,
          audioBase64: b64,
          mimeType: blob.type || "audio/webm",
          durationSecs: recordSecs,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "signup_required") { setNeedsSignup(true); return; }
        throw new Error(data.error || "Assessment failed.");
      }
      setResult(data);
      advance();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assessment failed.");
    } finally {
      setLoading(false);
    }
  };

  const advance = () => {
    if (stage === "part1") {
      if (qIndex + 1 < PART1_QS.length) setQIndex(qIndex + 1);
      else { setStage("part2prep"); setPrepLeft(60); startPrepTimer(); }
    } else if (stage === "part2") {
      setStage("part3"); setQIndex(0);
    } else if (stage === "part3") {
      if (qIndex + 1 < PART3_QS.length) setQIndex(qIndex + 1);
      else setStage("done");
    }
    setResult(null);
  };

  const startPrepTimer = () => {
    if (prepRef.current) clearInterval(prepRef.current);
    prepRef.current = setInterval(() => {
      setPrepLeft((s) => {
        if (s <= 1) {
          if (prepRef.current) clearInterval(prepRef.current);
          setStage("part2");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const skipAnswer = async () => {
    // Text fallback when mic unavailable
    const text = prompt("Type your answer instead (microphone unavailable):");
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part: stage === "part2" ? "part2" : stage === "part3" ? "part3" : "part1",
          question: stage === "part2" ? PART2_CARD.topic : currentQuestion,
          textAnswer: text,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "signup_required") { setNeedsSignup(true); return; }
        throw new Error(data.error || "Assessment failed.");
      }
      setResult(data);
      advance();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assessment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 rounded-3xl border border-navy-200 p-6 dark:border-navy-700">
      <h2 className="text-xl font-bold">🎙️ AI Speaking Examiner</h2>
      <p className="mt-1 text-sm text-navy-500">
        Full Part 1 → Part 2 → Part 3 simulation. AI scores are educational estimates, not official examiner scores.
      </p>

      {stage === "idle" && (
        <button onClick={() => { setStage("part1"); setQIndex(0); }} className="mt-4 rounded-xl bg-navy-800 px-6 py-3 font-semibold text-white dark:bg-accent-600">
          Start speaking test
        </button>
      )}

      {stage === "part2prep" && (
        <div className="mt-4 rounded-2xl bg-navy-50 p-6 dark:bg-navy-800/50">
          <h3 className="font-bold">Part 2 — Cue card (prep: {prepLeft}s)</h3>
          <p className="mt-2 font-medium">{PART2_CARD.topic}</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {PART2_CARD.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
          <p className="mt-3 text-sm text-navy-500">Make notes. Recording starts automatically when prep ends.</p>
        </div>
      )}

      {(stage === "part1" || stage === "part2" || stage === "part3") && (
        <div className="mt-4 rounded-2xl bg-navy-50 p-6 dark:bg-navy-800/50">
          <p className="text-sm font-medium text-navy-500">Examiner · {stage === "part1" ? "Part 1" : stage === "part2" ? "Part 2" : "Part 3"}</p>
          <p className="mt-2 text-lg font-semibold">“{currentQuestion}”</p>
          {stage === "part2" && (
            <div className="mt-3 text-sm">
              <p className="font-medium">{PART2_CARD.topic}</p>
              <ul className="list-disc pl-5">{PART2_CARD.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!recording ? (
              <button onClick={startRecording} className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white">● Record answer</button>
            ) : (
              <>
                <button onClick={submitAnswer} disabled={loading} className="rounded-xl bg-navy-800 px-5 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-accent-600">
                  ⏹ Stop & submit ({recordSecs}s)
                </button>
                <span className="animate-pulse text-red-500">● Recording…</span>
              </>
            )}
            <button onClick={skipAnswer} className="text-sm text-navy-500 underline">Type answer instead</button>
          </div>
          {loading && <p className="mt-3 text-sm">Analysing your answer…</p>}
        </div>
      )}

      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
      {needsSignup && <SignupNudge feature="the AI Speaking Examiner" />}

      {result && (
        <div className="mt-4 rounded-2xl bg-navy-50 p-6 dark:bg-navy-800/50">
          <div className="flex items-center gap-4">
            <p className="text-4xl font-black">{result.band !== null ? result.band.toFixed(1) : "—"}</p>
            <div>
              <p className="font-semibold">Estimated practice band</p>
              <p className="text-xs text-navy-500">{result.disclaimer}</p>
            </div>
          </div>
          {result.transcript && (
            <div className="mt-3 rounded-xl bg-white p-4 text-sm dark:bg-navy-900">
              <p className="font-medium">Transcript:</p>
              <p className="mt-1 italic">“{result.transcript}”</p>
            </div>
          )}
          {result.criteria && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {result.criteria.map((c) => (
                <div key={c.name} className="rounded-xl bg-white p-4 dark:bg-navy-900">
                  <p className="font-semibold">{c.name}: {c.band.toFixed(1)}</p>
                  <p className="mt-1 text-sm">{c.comment}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3"><Markdown text={result.feedback_md} /></div>
        </div>
      )}

      {stage === "done" && (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-6 text-center dark:bg-emerald-900/20">
          <h3 className="text-xl font-bold">🎉 Speaking test complete!</h3>
          <p className="mt-2 text-sm">Review your feedback above. Regular practice is the fastest route to fluency.</p>
          <button onClick={() => { setStage("idle"); setResult(null); }} className="mt-4 rounded-xl bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white dark:bg-accent-600">
            Practice again
          </button>
        </div>
      )}
    </div>
  );
}

export default function Speaking() {
  return (
    <div>
      <SkillPage kind="speaking" title="Speaking Academy" titleBn="স্পিকিং একাডেমি" icon="🎙️" />
      <SpeakingExaminer />
    </div>
  );
}
