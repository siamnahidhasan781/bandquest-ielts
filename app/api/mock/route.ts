import { NextRequest } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { json, err, handler, requireRegistered } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";
import { scoreAnswer, publicQuestion } from "@/lib/engine";
import { rawToBand } from "@/lib/scoring";
import { AI_DISCLAIMER } from "@/lib/ai/gemini";
import { awardAchievement } from "@/lib/engine";

const startSchema = z.object({
  mockId: z.string().min(1),
  sections: z.array(z.enum(["listening", "reading", "writing"])).default(["listening", "reading", "writing"]),
});

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const db = getDb();
  const mocks = await db.prepare("SELECT id, title, test_type, config_json FROM mock_tests WHERE status='published'").all();
  return json({ mocks });
});

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const body = await req.json().catch(() => null);
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) return err("Invalid request.", 400);

  const db = getDb();
  const mock = await db.prepare("SELECT * FROM mock_tests WHERE id = ?").get(parsed.data.mockId) as
    | { id: string; config_json: string }
    | undefined;
  if (!mock) return err("Mock test not found.", 404);

  // Build the question set: listening + reading from the bank (unseen preferred)
  const sections: Record<string, ReturnType<typeof publicQuestion>[]> = {};
  for (const section of parsed.data.sections) {
    if (section === "writing") continue;
    const seenIds = new Set(
      (await db.prepare("SELECT question_id as id FROM question_history WHERE user_id = ?").all(user.id) as { id: string }[]).map((r) => r.id)
    );
    const pool = await db.prepare(
      "SELECT * FROM questions WHERE module = ? AND status='published' ORDER BY RANDOM() LIMIT 40"
    ).all(section) as unknown as Parameters<typeof publicQuestion>[0][];
    const sorted = [...pool].sort((a, b) => (seenIds.has(a.id) ? 1 : 0) - (seenIds.has(b.id) ? 1 : 0));
    const picked = sorted.slice(0, 10);
    sections[section] = picked.map(publicQuestion);
    // Store full question ids for scoring
    (sections as Record<string, unknown>)[section + "_ids"] = picked.map((q) => q.id);
  }

  const id = randomUUID();
  await db.prepare(
    `INSERT INTO mock_sessions (id, user_id, mock_id, status, answers_json)
     VALUES (?, ?, ?, 'in_progress', ?)`
  ).run(id, user.id, mock.id, JSON.stringify({ sections, questionIds: (sections as Record<string, unknown>) }));

  return json({ sessionId: id, sections });
});

const submitSchema = z.object({
  responses: z.record(z.string(), z.unknown()),
  writing: z.object({
    task1: z.string().max(10000).default(""),
    task2: z.string().max(10000).default(""),
  }).default({ task1: "", task2: "" }),
});

export const PUT = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) return err("Missing sessionId.", 400);
  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return err("Invalid submission.", 400);

  const db = getDb();
  const session = await db.prepare("SELECT * FROM mock_sessions WHERE id = ? AND user_id = ?").get(sessionId, user.id) as
    | { id: string; status: string; answers_json: string; mock_id: string }
    | undefined;
  if (!session) return err("Session not found.", 404);
  if (session.status !== "in_progress") return err("Session already submitted.", 400);

  const stored = JSON.parse(session.answers_json);
  const scores: Record<string, { raw: number; total: number; band: number }> = {};
  let bandSum = 0;
  let bandCount = 0;

  for (const section of ["listening", "reading"]) {
    const ids: string[] = stored.questionIds?.[section + "_ids"] ?? [];
    let raw = 0;
    for (const qid of ids) {
      const q = await db.prepare("SELECT * FROM questions WHERE id = ?").get(qid) as unknown as Parameters<typeof scoreAnswer>[0];
      if (!q) continue;
      const { score } = scoreAnswer(q, parsed.data.responses[qid]);
      raw += score;
      await db.prepare(
        `INSERT OR REPLACE INTO question_history (user_id, question_id, seen_at, was_correct)
         VALUES (?, ?, datetime('now'), ?)`
      ).run(user.id, qid, score >= 1 ? 1 : 0);
    }
    const band = rawToBand(raw, ids.length);
    scores[section] = { raw: Math.round(raw * 10) / 10, total: ids.length, band };
    bandSum += band;
    bandCount++;
  }

  // Writing: word-count + structure heuristic (AI detailed feedback available separately)
  const w1 = parsed.data.writing.task1.trim().split(/\s+/).filter(Boolean).length;
  const w2 = parsed.data.writing.task2.trim().split(/\s+/).filter(Boolean).length;
  let writingBand: number | null = null;
  if (w1 > 20 || w2 > 20) {
    writingBand = 5.5;
    if (w2 >= 250) writingBand += 0.5;
    if (w1 >= 150) writingBand += 0.25;
    writingBand = Math.min(7.5, Math.round(writingBand * 2) / 2);
    scores["writing"] = { raw: w1 + w2, total: 400, band: writingBand };
    bandSum += writingBand;
    bandCount++;
  }

  const overall = bandCount ? Math.round((bandSum / bandCount) * 2) / 2 : 0;

  const report = `## Mock test report

**Overall estimated band: ${overall.toFixed(1)}**

| Section | Score | Est. band |
|---|---|---|
${Object.entries(scores).map(([s, v]) => `| ${s[0].toUpperCase() + s.slice(1)} | ${v.raw}/${v.total} | ${v.band.toFixed(1)} |`).join("\n")}

*${AI_DISCLAIMER}*
*Band conversion is approximate and for practice only.*`;

  await db.prepare(
    `UPDATE mock_sessions
     SET status = 'scored', submitted_at = datetime('now'),
         answers_json = ?, scores_json = ?, overall_band = ?, report_md = ?, disclaimer_shown = 1
     WHERE id = ?`
  ).run(
    JSON.stringify({ responses: parsed.data.responses, writing: parsed.data.writing }),
    JSON.stringify(scores),
    overall,
    report,
    sessionId
  );

  await awardAchievement(user.id, "mock-finisher");

  return json({ scores, overallBand: overall, report_md: report, disclaimer: AI_DISCLAIMER });
});
