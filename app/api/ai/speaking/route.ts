import { NextRequest } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { json, err, handler, requireRegistered } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";
import {
  aiEnabled, callGemini, parseJsonResponse, checkRateLimit, logUsage,
  aiErrorMessage, AI_DISCLAIMER, RUBRIC_VERSION, textModel,
} from "@/lib/ai/gemini";
import { awardAchievement, updateStreak } from "@/lib/engine";

const schema = z.object({
  part: z.enum(["part1", "part2", "part3"]),
  question: z.string().min(3).max(1000),
  audioBase64: z.string().max(8_000_000).optional(),
  mimeType: z.string().max(100).optional(),
  durationSecs: z.number().min(1).max(600).optional(),
  textAnswer: z.string().min(5).max(5000).optional(),
});

interface SpeakingAiResult {
  band: number;
  transcript: string;
  criteria: { name: string; band: number; comment: string }[];
  strengths: string[];
  weaknesses: string[];
  grammar_errors: { original: string; corrected: string }[];
  vocabulary_tips: string[];
  better_example: string;
  pronunciation_notes: string;
}

const SPEAKING_SYSTEM = `You are an IELTS speaking examiner using the public IELTS Speaking Band Descriptors (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation). Assess honestly and educationally — never inflate scores. Judge pronunciation on intelligibility, stress and rhythm, NOT on sounding like a native speaker. If audio is unclear, say so and lower certainty rather than guessing. Output ONLY valid JSON:
{
  "band": <number 0-9, halves allowed>,
  "transcript": "<what the student said, or '' if text input>",
  "criteria": [{"name": "Fluency and Coherence"|"Lexical Resource"|"Grammatical Range and Accuracy"|"Pronunciation", "band": <number>, "comment": "<1-2 sentences>"}],
  "strengths": ["<2-3>"],
  "weaknesses": ["<2-3>"],
  "grammar_errors": [{"original": "<quote>", "corrected": "<fix>"}],
  "vocabulary_tips": ["<2-3>"],
  "better_example": "<a natural 3-5 sentence better answer>",
  "pronunciation_notes": "<observations or 'Audio quality too low to judge reliably'>"
}`;

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const user = await requireRegistered(req);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Invalid request.", 400);

  const { part, question, audioBase64, mimeType, durationSecs, textAnswer } = parsed.data;
  const db = getDb();

  if (!(await aiEnabled())) {
    return err(aiErrorMessage("AI_NOT_CONFIGURED"), 503);
  }
  if (!(await checkRateLimit(user.id, "speaking"))) {
    return err(aiErrorMessage("AI_RATE_LIMIT"), 429);
  }

  try {
    const userPrompt = textAnswer
      ? `Part: ${part}\nExaminer question: ${question}\n\nStudent typed answer (no audio provided):\n${textAnswer}\n\nNote: pronunciation cannot be assessed from text — mark Pronunciation as not assessable and base the band on the other three criteria.`
      : `Part: ${part}\nExaminer question: ${question}\n\nListen to the student's spoken answer${durationSecs ? ` (about ${durationSecs} seconds)` : ""} and assess it.`;

    const res = await callGemini({
      systemPrompt: SPEAKING_SYSTEM,
      userPrompt,
      audioBase64,
      audioMimeType: mimeType,
      jsonMode: true,
      maxTokens: 2500,
    });
    const r = parseJsonResponse<SpeakingAiResult>(res.text, [
      "band", "criteria", "strengths", "weaknesses", "better_example",
    ]);
    await logUsage(user.id, "speaking", res.tokensIn, res.tokensOut);

    const band = Math.max(0, Math.min(9, r.band));
    const id = randomUUID();
    await db.prepare(
      `INSERT INTO speaking_sessions
       (id, user_id, part, transcript, ai_band, criteria_json, feedback_md, model, rubric_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, user.id, part, r.transcript || textAnswer || null, band,
      JSON.stringify(r.criteria),
      `## AI speaking feedback\n\n### Strengths\n${r.strengths.map((s) => `- ${s}`).join("\n")}\n\n### To improve\n${r.weaknesses.map((s) => `- ${s}`).join("\n")}\n\n### Grammar fixes\n${(r.grammar_errors || []).slice(0, 6).map((e) => `- ❌ "${e.original}" → ✅ "${e.corrected}"`).join("\n") || "None noted."}\n\n### Vocabulary tips\n${(r.vocabulary_tips || []).map((s) => `- ${s}`).join("\n")}\n\n### Better example answer\n${r.better_example}\n\n### Pronunciation\n${r.pronunciation_notes || "Not assessed."}`,
      res.model,
      RUBRIC_VERSION
    );

    await updateStreak(user.id);
    await awardAchievement(user.id, "speaker");

    const saved = await db.prepare("SELECT feedback_md FROM speaking_sessions WHERE id = ?").get(id) as { feedback_md: string };
    return json({
      id,
      band,
      criteria: r.criteria,
      feedback_md: saved.feedback_md,
      transcript: r.transcript || textAnswer || null,
      ai: true,
      disclaimer: AI_DISCLAIMER,
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "AI_ERROR";
    return err(aiErrorMessage(code), code === "AI_QUOTA" ? 429 : 503);
  }
});
