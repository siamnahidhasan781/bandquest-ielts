import { NextRequest } from "next/server";
import { json, handler, ensureViewer } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const db = getDb();
  const all = await db.prepare("SELECT code, title, description, xp_reward FROM achievements ORDER BY xp_reward ASC").all() as
    { code: string; title: string; description: string; xp_reward: number }[];
  const earned = new Map(
    (await db.prepare(
      `SELECT a.code, ua.earned_at FROM user_achievements ua JOIN achievements a ON a.id = ua.achievement_id WHERE ua.user_id = ?`
    ).all(user.id) as { code: string; earned_at: string }[]).map((e) => [e.code, e.earned_at])
  );
  return json({
    achievements: all.map((a) => ({ ...a, earned: earned.has(a.code), earned_at: earned.get(a.code) ?? null })),
  });
});
