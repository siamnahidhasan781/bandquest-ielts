import { NextRequest } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { json, err, handler, requireRegistered } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

const schema = z.object({
  weeks: z.number().min(4).max(16).default(8),
});

/** Generate a personalized week-by-week study plan. Honest: no score guarantees. */
function buildPlan(profile: {
  target_band: number | null; test_type: string; minutes_per_day: number;
  weakest_module: string | null; strongest_module: string | null;
  current_level: number;
}, weeks: number) {
  const mins = profile.minutes_per_day || 30;
  const weak = profile.weakest_module || "writing";
  const days: string[] = [];
  const focusRotation = ["grammar", "vocabulary", weak, "listening", "reading", weak, "writing", "speaking"];

  const plan: { week: number; days: { day: string; minutes: number; tasks: string[] }[] }[] = [];
  for (let w = 1; w <= weeks; w++) {
    const phase = w <= Math.ceil(weeks * 0.4) ? "Foundation" : w <= Math.ceil(weeks * 0.75) ? "Skill building" : "Exam polish";
    const weekDays = [];
    for (let d = 1; d <= 7; d++) {
      const focus = focusRotation[(w + d) % focusRotation.length];
      const tasks: string[] = [];
      if (focus === "grammar") tasks.push("Complete 1 grammar episode + checkpoint (70% to pass)");
      else if (focus === "vocabulary") tasks.push("Review due vocabulary cards (spaced repetition)", "Learn 10 new topic words");
      else if (focus === weak) tasks.push(`Extra ${weak} practice (your focus area)`, "Log mistakes in the notebook");
      else if (focus === "listening") tasks.push("1 listening lesson + practice set");
      else if (focus === "reading") tasks.push("1 reading passage, timed");
      else if (focus === "writing") tasks.push("1 writing task + feedback");
      else tasks.push("1 speaking part with AI examiner");
      if (mins >= 60) tasks.push("15 min revision of mistake notebook");
      if (w === weeks && d === 6) tasks.push("Full mock test (timed)");
      weekDays.push({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d - 1], minutes: mins, tasks });
    }
    plan.push({ week: w, days: weekDays });
    void phase;
  }
  return {
    weeks,
    minutesPerDay: mins,
    targetBand: profile.target_band,
    testType: profile.test_type,
    focusArea: weak,
    plan,
    note: "This plan adapts: if you fall behind, spend extra days on weak areas before advancing. Following a timetable improves skills but never guarantees a specific band — your result depends on practice quality and consistency.",
  };
}

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const db = getDb();
  const existing = await db.prepare("SELECT plan_json, weeks FROM study_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").get(user.id) as
    | { plan_json: string; weeks: number } | undefined;
  return json({ plan: existing ? JSON.parse(existing.plan_json) : null });
});

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Invalid request.", 400);
  const db = getDb();
  const profile = await db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(user.id) as {
    target_band: number | null; test_type: string; minutes_per_day: number;
    weakest_module: string | null; strongest_module: string | null; current_level: number;
  };
  const plan = buildPlan(profile, parsed.data.weeks);
  await db.prepare("INSERT INTO study_plans (id, user_id, plan_json, weeks) VALUES (?, ?, ?, ?)")
    .run(randomUUID(), user.id, JSON.stringify(plan), parsed.data.weeks);
  await db.prepare("UPDATE profiles SET study_plan_json = ? WHERE user_id = ?").run(JSON.stringify(plan), user.id);
  return json({ plan });
});
