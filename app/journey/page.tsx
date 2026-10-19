"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Episode {
  id: string;
  title: string;
  title_bn: string;
  sort_order: number;
  progress: { status: string; best_score: number | null; best_stars: number | null };
}
interface Course {
  id: string;
  title: string;
  title_bn: string;
  description: string;
  level: number;
  kind: string;
  episodes: Episode[];
  passedCount: number;
  totalCount: number;
}

const LEVEL_NAMES: Record<number, string> = { 1: "Beginner", 2: "Intermediate", 3: "Pro" };

function Stars({ n }: { n: number | null }) {
  if (!n) return <span className="text-navy-300">☆☆☆☆☆</span>;
  return <span className="text-amber-500" aria-label={`${n} stars`}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export default function Journey() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your journey…</p>;

  const journey = courses.find((c) => c.kind === "journey");

  return (
    <div>
      <h1 className="text-3xl font-bold">My Learning Journey 🗺️</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">
        Master each episode with <strong>70%+</strong> to unlock the next. No skipping — real progress only.
      </p>

      {journey && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{journey.title} <span className="text-sm font-normal text-navy-500">({journey.title_bn})</span></h2>
            <span className="rounded-full bg-navy-100 px-3 py-1 text-sm dark:bg-navy-800">
              {journey.passedCount}/{journey.totalCount} passed
            </span>
          </div>
          <div className="space-y-3">
            {journey.episodes.map((ep, i) => {
              const locked = ep.progress.status === "locked";
              const passed = ep.progress.status === "passed" || ep.progress.status === "mastered";
              return (
                <div
                  key={ep.id}
                  className={`flex items-center gap-4 rounded-2xl border p-4 ${
                    locked ? "border-navy-100 opacity-60 dark:border-navy-800" : "border-navy-200 dark:border-navy-700"
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                    passed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : locked ? "bg-navy-100 text-navy-400 dark:bg-navy-800"
                    : "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300"
                  }`}>
                    {passed ? "✓" : locked ? "🔒" : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">
                      Episode {ep.sort_order}: {ep.title}
                      <span className="ml-2 text-sm font-normal text-navy-500">{ep.title_bn}</span>
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-sm">
                      <Stars n={ep.progress.best_stars} />
                      {ep.progress.best_score !== null && <span>{ep.progress.best_score}%</span>}
                    </div>
                  </div>
                  {locked ? (
                    <span className="text-sm text-navy-400">Pass previous episode</span>
                  ) : (
                    <Link href={`/lesson/${ep.id}`} className="shrink-0 rounded-xl bg-navy-800 px-4 py-2 text-sm font-medium text-white dark:bg-accent-600">
                      {passed ? "Review" : "Start"}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-bold">Skill Academies</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {courses.filter((c) => c.kind !== "journey").map((c) => (
            <div key={c.id} className="rounded-2xl border border-navy-200 p-5 dark:border-navy-700">
              <h3 className="font-semibold">{c.title} <span className="text-sm font-normal text-navy-500">({c.title_bn})</span></h3>
              <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{c.description}</p>
              <p className="mt-2 text-sm text-navy-500">{LEVEL_NAMES[c.level]} · {c.passedCount}/{c.totalCount} episodes</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
