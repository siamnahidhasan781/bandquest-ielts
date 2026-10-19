import { NextRequest } from "next/server";
import { json, handler, currentUser } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const db = getDb();
  const user = await currentUser(req);

  const courses = await db
    .prepare("SELECT * FROM courses WHERE is_active = 1 ORDER BY sort_order ASC")
    .all() as Array<{
    id: string; title: string; title_bn: string; description: string; level: number; kind: string;
  }>;

  const result: Array<Record<string, unknown>> = [];
  for (const c of courses) {
    const episodes = await db
      .prepare(
        "SELECT id, title, title_bn, sort_order FROM episodes WHERE course_id = ? AND status='published' ORDER BY sort_order ASC"
      )
      .all(c.id) as Array<{ id: string; title: string; title_bn: string; sort_order: number }>;

    let progress: Record<string, { status: string; best_score: number | null; best_stars: number | null }> = {};
    if (user) {
      const rows = await db
        .prepare("SELECT episode_id, status, best_score, best_stars FROM episode_progress WHERE user_id = ?")
        .all(user.id) as Array<{ episode_id: string; status: string; best_score: number | null; best_stars: number | null }>;
      for (const r of rows) progress[r.episode_id] = { status: r.status, best_score: r.best_score, best_stars: r.best_stars };
    }
    const passed = episodes.filter((e) => progress[e.id]?.status === "passed" || progress[e.id]?.status === "mastered").length;
    result.push({ ...c, episodes: episodes.map((e) => ({ ...e, progress: progress[e.id] ?? { status: "locked", best_score: null, best_stars: null } })), passedCount: passed, totalCount: episodes.length });
  }

  return json({ courses: result });
});
