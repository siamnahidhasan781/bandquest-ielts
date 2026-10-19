import { NextRequest } from "next/server";
import { json, err, handler, currentUser } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest, { params }: { params: Record<string, string> }) => {
  await migrate();
  const db = getDb();
  const user = await currentUser(req);
  const ep = await db.prepare("SELECT * FROM episodes WHERE id = ? AND status='published'").get(params.id) as
    | {
        id: string; course_id: string; title: string; title_bn: string; sort_order: number;
        objectives_json: string; content_md: string; content_md_bn: string; vocab_json: string;
        pass_threshold: number;
      }
    | undefined;
  if (!ep) return err("Episode not found.", 404);

  let progress = null;
  if (user) {
    progress = await db
      .prepare("SELECT status, best_score, best_stars, attempts_count FROM episode_progress WHERE user_id = ? AND episode_id = ?")
      .get(user.id, ep.id) as { status: string; best_score: number | null; best_stars: number | null; attempts_count: number } | undefined;
  }

  return json({
    episode: {
      id: ep.id,
      course_id: ep.course_id,
      title: ep.title,
      title_bn: ep.title_bn,
      sort_order: ep.sort_order,
      objectives: JSON.parse(ep.objectives_json || "[]"),
      content_md: ep.content_md,
      content_md_bn: ep.content_md_bn,
      vocab: JSON.parse(ep.vocab_json || "[]"),
      pass_threshold: ep.pass_threshold,
      progress: progress ?? { status: "locked", best_score: null, best_stars: null, attempts_count: 0 },
    },
  });
});
