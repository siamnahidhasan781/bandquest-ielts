import { NextRequest } from "next/server";
import { z } from "zod";
import { json, err, handler, requireRegistered } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const db = getDb();
  const profile = await db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(user.id);
  return json({ profile });
});

const schema = z.object({
  target_band: z.string().optional(),
  test_type: z.enum(["academic", "general"]).optional(),
  exam_date: z.string().optional(),
  minutes_per_day: z.number().min(5).max(480).optional(),
  interface_lang: z.enum(["en", "bn"]).optional(),
  strongest_module: z.string().optional(),
  weakest_module: z.string().optional(),
});

export const PUT = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Invalid profile data.", 400);
  const db = getDb();
  const p = parsed.data;
  await db.prepare(
    `UPDATE profiles SET
       target_band = COALESCE(?, target_band),
       test_type = COALESCE(?, test_type),
       exam_date = COALESCE(?, exam_date),
       minutes_per_day = COALESCE(?, minutes_per_day),
       interface_lang = COALESCE(?, interface_lang),
       strongest_module = COALESCE(?, strongest_module),
       weakest_module = COALESCE(?, weakest_module),
       updated_at = datetime('now')
     WHERE user_id = ?`
  ).run(
    p.target_band ? parseFloat(p.target_band) : null,
    p.test_type ?? null, p.exam_date || null, p.minutes_per_day ?? null,
    p.interface_lang ?? null, p.strongest_module || null, p.weakest_module || null,
    user.id
  );
  return json({ ok: true });
});

export const DELETE = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const db = getDb();
  await db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  const token = cookies().get(SESSION_COOKIE)?.value;
  await destroySession(token);
  const res = json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
});
