import { NextRequest } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { json, err, handler, requireRegistered } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

function verifyCode(): string {
  return "BQ-" + randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}

/** Check if user meets certificate criteria for a course. */
async function checkEligibility(db: ReturnType<typeof getDb>, userId: string, courseId: string) {
  const episodes = await db.prepare(
    "SELECT id FROM episodes WHERE course_id = ? AND status='published'"
  ).all(courseId) as { id: string }[];
  if (episodes.length === 0) return { eligible: false, reason: "No published episodes in this course." };
  const passed = await db.prepare(
    `SELECT COUNT(*) as c FROM episode_progress
     WHERE user_id = ? AND status IN ('passed','mastered')
     AND episode_id IN (${episodes.map(() => "?").join(",")})`
  ).get(userId, ...episodes.map((e) => e.id)) as { c: number };
  if (passed.c < episodes.length) {
    return { eligible: false, reason: `Pass all ${episodes.length} episodes first (${passed.c}/${episodes.length} done).` };
  }
  return { eligible: true, reason: "" };
}

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const db = getDb();
  const certs = await db.prepare(
    `SELECT cert.id, cert.display_name, cert.issued_at, cert.verify_code, c.title as course_title
     FROM certificates cert JOIN courses c ON c.id = cert.course_id
     WHERE cert.user_id = ? ORDER BY cert.issued_at DESC`
  ).all(user.id);
  // Eligibility per course
  const courses = await db.prepare("SELECT id, title FROM courses WHERE is_active=1").all() as { id: string; title: string }[];
  const eligibility = await Promise.all(courses.map(async (c) => ({ course_id: c.id, title: c.title, ...(await checkEligibility(db, user.id, c.id)) })));
  return json({ certificates: certs, eligibility });
});

const issueSchema = z.object({ courseId: z.string().min(1) });

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const body = await req.json().catch(() => null);
  const parsed = issueSchema.safeParse(body);
  if (!parsed.success) return err("Invalid request.", 400);
  const db = getDb();

  const existing = await db.prepare(
    "SELECT id FROM certificates WHERE user_id = ? AND course_id = ?"
  ).get(user.id, parsed.data.courseId);
  if (existing) return err("Certificate already issued for this course.", 400);

  const { eligible, reason } = await checkEligibility(db, user.id, parsed.data.courseId);
  if (!eligible) return err(reason, 403);

  const course = await db.prepare("SELECT title FROM courses WHERE id = ?").get(parsed.data.courseId) as { title: string };
  const code = verifyCode();
  const id = randomUUID();
  await db.prepare(
    `INSERT INTO certificates (id, user_id, course_id, display_name, verify_code, criteria_json)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, user.id, parsed.data.courseId, user.displayName, code,
    JSON.stringify({ requirement: "Passed all episodes with 70%+", course: course.title }));

  return json({ id, verify_code: code });
});
