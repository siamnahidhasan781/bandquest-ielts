"use client";

import { useEffect, useState } from "react";

interface Cert {
  id: string;
  display_name: string;
  issued_at: string;
  verify_code: string;
  course_title: string;
}
interface Elig {
  course_id: string;
  title: string;
  eligible: boolean;
  reason: string;
}

export default function Certificates() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [elig, setElig] = useState<Elig[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<string>("");

  const load = () => {
    fetch("/api/certificates").then((r) => {
      if (r.status === 401) { window.location.href = "/signin"; return null; }
      return r.json();
    }).then((d) => d && (setCerts(d.certificates ?? []), setElig(d.eligibility ?? [])));
  };
  useEffect(load, []);

  const issue = async (courseId: string) => {
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "Could not issue.");
    else load();
  };

  const verify = async () => {
    const res = await fetch(`/api/certificates/verify/${encodeURIComponent(verifyCode.trim())}`);
    const data = await res.json();
    setVerifyResult(res.ok
      ? `✅ Valid — ${data.display_name} completed "${data.course_title}" on ${data.issued_at.slice(0, 10)}. ${data.note}`
      : `❌ ${data.error}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">🎓 Certificates</h1>
      <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">
        Issued only after passing every episode of a course (70%+ each). These are BandQuest completion
        certificates — not official IELTS certificates.
      </p>

      <h2 className="mt-8 text-xl font-bold">Your certificates</h2>
      {certs.length === 0 ? (
        <p className="mt-3 text-navy-500">None yet. Complete a course to earn one.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {certs.map((c) => (
            <div key={c.id} className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="font-bold">🎓 {c.course_title}</p>
              <p className="text-sm">{c.display_name} · {c.issued_at.slice(0, 10)}</p>
              <p className="mt-1 font-mono text-sm">Verify code: {c.verify_code}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-xl font-bold">Eligibility</h2>
      <div className="mt-3 space-y-2">
        {elig.map((e) => (
          <div key={e.course_id} className="flex items-center justify-between rounded-xl border border-navy-200 px-4 py-3 text-sm dark:border-navy-700">
            <span>{e.title}</span>
            {e.eligible ? (
              <button onClick={() => issue(e.course_id)} className="rounded-lg bg-navy-800 px-4 py-1.5 font-medium text-white dark:bg-accent-600">Issue certificate</button>
            ) : (
              <span className="text-navy-500">{e.reason}</span>
            )}
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-xl font-bold">Verify a certificate</h2>
      <div className="mt-3 flex gap-2">
        <input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="e.g. BQ-ABC123XYZ"
          className="flex-1 rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900" />
        <button onClick={verify} className="rounded-xl bg-navy-800 px-5 py-2.5 font-medium text-white dark:bg-accent-600">Verify</button>
      </div>
      {verifyResult && <p className="mt-3 rounded-xl bg-navy-50 p-4 text-sm dark:bg-navy-800/50">{verifyResult}</p>}
    </div>
  );
}
