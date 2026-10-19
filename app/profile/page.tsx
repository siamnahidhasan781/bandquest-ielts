"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BANDS = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    target_band: "", test_type: "academic", exam_date: "", minutes_per_day: 30,
    interface_lang: "en", strongest_module: "", weakest_module: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => {
      if (r.status === 401) { router.push("/signin"); return null; }
      return r.json();
    }).then((d) => d && d.profile && setProfile({ ...profile, ...d.profile }));
  }, []);

  const save = async () => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const input = "w-full rounded-xl border border-navy-200 px-4 py-2.5 dark:border-navy-700 dark:bg-navy-900";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">👤 Profile & Settings</h1>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Target IELTS band</label>
          <select value={profile.target_band} onChange={(e) => setProfile({ ...profile, target_band: e.target.value })} className={input}>
            <option value="">Not set</option>
            {BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Test type</label>
            <select value={profile.test_type} onChange={(e) => setProfile({ ...profile, test_type: e.target.value })} className={input}>
              <option value="academic">Academic</option>
              <option value="general">General Training</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Exam date (optional)</label>
            <input type="date" value={profile.exam_date || ""} onChange={(e) => setProfile({ ...profile, exam_date: e.target.value })} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Minutes per day</label>
            <select value={profile.minutes_per_day} onChange={(e) => setProfile({ ...profile, minutes_per_day: parseInt(e.target.value) })} className={input}>
              {[15, 30, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Interface language</label>
            <select value={profile.interface_lang} onChange={(e) => setProfile({ ...profile, interface_lang: e.target.value })} className={input}>
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Strongest module</label>
            <select value={profile.strongest_module || ""} onChange={(e) => setProfile({ ...profile, strongest_module: e.target.value })} className={input}>
              <option value="">—</option>
              {["listening", "reading", "writing", "speaking"].map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Weakest module</label>
            <select value={profile.weakest_module || ""} onChange={(e) => setProfile({ ...profile, weakest_module: e.target.value })} className={input}>
              <option value="">—</option>
              {["listening", "reading", "writing", "speaking"].map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
          </div>
        </div>
        <button onClick={save} className="rounded-xl bg-navy-800 px-6 py-3 font-semibold text-white dark:bg-accent-600">
          {saved ? "✓ Saved" : "Save settings"}
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-red-200 p-5 dark:border-red-800">
        <h2 className="font-bold text-red-700 dark:text-red-300">Data & privacy</h2>
        <p className="mt-2 text-sm">Your learning data stays in your account. You can export or delete it anytime.</p>
        <div className="mt-3 flex gap-3">
          <button onClick={async () => {
            const r = await fetch("/api/profile/export");
            const blob = await r.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "bandquest-data.json";
            a.click();
          }} className="rounded-lg border border-navy-200 px-4 py-2 text-sm dark:border-navy-700">Export my data</button>
          <button onClick={async () => {
            if (!confirm("Delete your account and ALL learning data? This cannot be undone.")) return;
            const r = await fetch("/api/profile", { method: "DELETE" });
            if (r.ok) window.location.href = "/";
          }} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Delete account</button>
        </div>
      </div>
    </div>
  );
}
