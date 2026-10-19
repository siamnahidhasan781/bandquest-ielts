import { NextRequest } from "next/server";
import { json, handler, requireRegistered } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const db = getDb();
  const tables = [
    "profiles", "attempts", "answers", "episode_progress", "grammar_mastery",
    "vocab_reviews", "xp_events", "streaks", "user_achievements",
    "mock_sessions", "writing_submissions", "speaking_sessions",
    "certificates", "mistakes", "study_plans",
  ];
  const data: Record<string, unknown> = { user: { id: user.id, email: user.email, displayName: user.displayName } };
  for (const t of tables) {
    try {
      const col = t === "profiles" || t === "streaks" ? "user_id" : "user_id";
      data[t] = await db.prepare(`SELECT * FROM ${t} WHERE ${col} = ?`).all(user.id);
    } catch {
      data[t] = [];
    }
  }
  return json(data, 200);
});
