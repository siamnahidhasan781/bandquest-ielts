import { NextRequest } from "next/server";
import { z } from "zod";
import { json, err, handler, ensureViewer } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const db = getDb();
  const show = new URL(req.url).searchParams.get("show") || "open";
  const mistakes = await db.prepare(
    `SELECT m.id, m.category, m.note_md, m.review_due, m.created_at, q.prompt_md, q.explanation_md
     FROM mistakes m LEFT JOIN questions q ON q.id = m.question_id
     WHERE m.user_id = ? ${show === "open" ? "AND m.resolved = 0" : ""}
     ORDER BY m.created_at DESC LIMIT 100`
  ).all(user.id);
  const weakConcepts = await db.prepare(
    `SELECT concept, mastery, attempts FROM grammar_mastery WHERE user_id = ? AND mastery < 0.7 ORDER BY mastery ASC LIMIT 20`
  ).all(user.id);
  return json({ mistakes, weakConcepts });
});

const resolveSchema = z.object({ id: z.string().min(1), resolved: z.boolean() });

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const body = await req.json().catch(() => null);
  const parsed = resolveSchema.safeParse(body);
  if (!parsed.success) return err("Invalid request.", 400);
  const db = getDb();
  await db.prepare("UPDATE mistakes SET resolved = ? WHERE id = ? AND user_id = ?").run(
    parsed.data.resolved ? 1 : 0, parsed.data.id, user.id
  );
  return json({ ok: true });
});
