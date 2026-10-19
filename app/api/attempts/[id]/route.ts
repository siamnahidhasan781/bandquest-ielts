import { NextRequest } from "next/server";
import { json, err, handler, ensureViewer } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";
import { publicQuestion } from "@/lib/engine";

export const GET = handler(async (req: NextRequest, { params }: { params: Record<string, string> }) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const db = getDb();

  const attempt = await db
    .prepare("SELECT * FROM attempts WHERE id = ? AND user_id = ?")
    .get(params.id, user.id) as { id: string; submitted_at: string | null } | undefined;
  if (!attempt) return err("Attempt not found.", 404);
  if (attempt.submitted_at) return err("This attempt was already submitted.", 400);

  const questions = await db
    .prepare(
      `SELECT q.* FROM answers a JOIN questions q ON q.id = a.question_id
       WHERE a.attempt_id = ? ORDER BY a.rowid ASC`
    )
    .all(params.id) as unknown as Parameters<typeof publicQuestion>[0][];

  return json({ questions: questions.map(publicQuestion) });
});
