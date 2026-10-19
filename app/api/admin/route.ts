import { NextRequest } from "next/server";
import { z } from "zod";
import { json, err, handler, requireAdmin } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  await requireAdmin(req);
  const db = getDb();
  const tab = new URL(req.url).searchParams.get("tab") || "overview";

  if (tab === "overview") {
    const users = (await db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
    const attempts = (await db.prepare("SELECT COUNT(*) as c FROM attempts WHERE submitted_at IS NOT NULL").get() as { c: number }).c;
    const questions = (await db.prepare("SELECT COUNT(*) as c FROM questions").get() as { c: number }).c;
    const episodes = (await db.prepare("SELECT COUNT(*) as c FROM episodes").get() as { c: number }).c;
    const aiToday = (await db.prepare("SELECT feature, COUNT(*) as c, SUM(tokens_in+tokens_out) as t FROM ai_usage WHERE date(created_at)=date('now') GROUP BY feature").all());
    return json({ users, attempts, questions, episodes, aiToday });
  }

  if (tab === "questions") {
    const status = new URL(req.url).searchParams.get("status") || "published";
    const rows = await db.prepare(
      `SELECT q.id, q.module, q.qtype, q.difficulty, q.status, q.prompt_md, e.title as episode_title
       FROM questions q LEFT JOIN episodes e ON e.id = q.episode_id
       WHERE q.status = ? ORDER BY q.created_at DESC LIMIT 200`
    ).all(status);
    return json({ questions: rows });
  }

  if (tab === "config") {
    const rows = await db.prepare("SELECT key, value, updated_at FROM system_config ORDER BY key ASC").all();
    return json({ config: rows });
  }

  if (tab === "episodes") {
    const rows = await db.prepare(
      `SELECT e.id, e.title, e.status, e.sort_order, c.title as course_title
       FROM episodes e JOIN courses c ON c.id = e.course_id ORDER BY c.sort_order, e.sort_order`
    ).all();
    return json({ episodes: rows });
  }

  return err("Unknown tab.", 400);
});

const questionSchema = z.object({
  id: z.string().optional(),
  episode_id: z.string().nullable().optional(),
  module: z.string().min(1),
  qtype: z.string().min(1),
  difficulty: z.number().min(1).max(3).default(2),
  prompt_md: z.string().min(5),
  options_json: z.array(z.string()).nullable().optional(),
  answer_json: z.unknown(),
  explanation_md: z.string().min(1),
  explanation_md_bn: z.string().nullable().optional(),
  skill_tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "review", "published"]).default("draft"),
});

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  await requireAdmin(req);
  const db = getDb();
  const tab = new URL(req.url).searchParams.get("tab");

  if (tab === "question") {
    const body = await req.json().catch(() => null);
    const parsed = questionSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 400);
    const q = parsed.data;
    const id = q.id || ("q-" + Math.random().toString(36).slice(2, 10));
    await db.prepare(
      `INSERT OR REPLACE INTO questions
       (id, episode_id, module, qtype, difficulty, prompt_md, options_json, answer_json, explanation_md, explanation_md_bn, skill_tags_json, fingerprint, version, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, lower(hex(randomblob(8))), 1, ?)`
    ).run(
      id, q.episode_id || null, q.module, q.qtype, q.difficulty, q.prompt_md,
      q.options_json ? JSON.stringify(q.options_json) : null,
      JSON.stringify(q.answer_json), q.explanation_md, q.explanation_md_bn || null,
      JSON.stringify(q.skill_tags), q.status
    );
    return json({ id });
  }

  if (tab === "config") {
    const body = await req.json().catch(() => null);
    const parsed = z.object({ key: z.string().min(1), value: z.string() }).safeParse(body);
    if (!parsed.success) return err("Invalid config.", 400);
    await db.prepare("INSERT OR REPLACE INTO system_config (key, value, updated_at) VALUES (?, ?, datetime('now'))")
      .run(parsed.data.key, parsed.data.value);
    return json({ ok: true });
  }

  if (tab === "episode-status") {
    const body = await req.json().catch(() => null);
    const parsed = z.object({ id: z.string(), status: z.enum(["draft", "review", "published"]) }).safeParse(body);
    if (!parsed.success) return err("Invalid request.", 400);
    await db.prepare("UPDATE episodes SET status = ? WHERE id = ?").run(parsed.data.status, parsed.data.id);
    return json({ ok: true });
  }

  return err("Unknown tab.", 400);
});
