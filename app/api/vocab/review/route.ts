import { NextRequest } from "next/server";
import { z } from "zod";
import { json, err, handler, ensureViewer } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";
import { reviewCard, learnedWordCount } from "@/lib/srs";
import { awardAchievement } from "@/lib/engine";

const schema = z.object({
  vocabId: z.string().min(1),
  grade: z.number().min(0).max(5),
  mode: z.enum(["recognition", "recall", "contextual"]).default("recall"),
});

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Invalid review.", 400);

  try {
    const result = await reviewCard(user.id, parsed.data.vocabId, parsed.data.grade, parsed.data.mode);
    // Return the answer side for display after grading
    const db = getDb();
    const card = await db
      .prepare("SELECT definition_en, definition_bn, ipa, example_en FROM vocabulary_items WHERE id = ?")
      .get(parsed.data.vocabId) as { definition_en: string; definition_bn: string | null; ipa: string | null; example_en: string } | undefined;
    if (await learnedWordCount(user.id) >= 100) await awardAchievement(user.id, "vocab-100");
    return json({ ...result, answer: card ?? null });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Review failed.", 400);
  }
});
