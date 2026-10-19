/**
 * BandQuest IELTS — Spaced repetition (SM-2)
 * Tracks recognition, recall and contextual usage separately.
 */
import { getDb } from "./db";

export interface ReviewCard {
  vocab_id: string;
  word: string;
  pos: string;
  definition_en: string;
  definition_bn: string | null;
  ipa: string | null;
  example_en: string;
  topic: string;
  repetitions: number;
  next_review: string;
}

/** Get due cards for a user (new + overdue reviews). */
export async function getDueCards(userId: string, limit = 20): Promise<ReviewCard[]> {
  const db = getDb();
  // Ensure every vocab item has a review row for this user
  const items = await db.prepare("SELECT id FROM vocabulary_items").all() as { id: string }[];
  for (const item of items) {
    await db.prepare(
      `INSERT OR IGNORE INTO vocab_reviews (user_id, vocab_id, next_review)
       VALUES (?, ?, datetime('now'))`
    ).run(userId, item.id);
  }
  const rows = await db
    .prepare(
      `SELECT v.id as vocab_id, v.word, v.pos, v.definition_en, v.definition_bn, v.ipa,
              v.example_en, v.topic, r.repetitions, r.next_review
       FROM vocab_reviews r
       JOIN vocabulary_items v ON v.id = r.vocab_id
       WHERE r.user_id = ? AND datetime(r.next_review) <= datetime('now')
       ORDER BY r.next_review ASC
       LIMIT ?`
    )
    .all(userId, limit) as unknown as ReviewCard[];
  return rows;
}

/**
 * SM-2 review.
 * grade: 0=forgot, 3=hard, 4=good, 5=easy
 * mode: 'recognition' | 'recall' | 'contextual'
 */
export async function reviewCard(
  userId: string,
  vocabId: string,
  grade: number,
  mode: "recognition" | "recall" | "contextual" = "recall"
): Promise<{ nextReview: string; intervalDays: number }> {
  const db = getDb();
  const row = await db
    .prepare("SELECT * FROM vocab_reviews WHERE user_id = ? AND vocab_id = ?")
    .get(userId, vocabId) as
    | {
        ease: number; interval_days: number; repetitions: number;
        recognition: number; recall: number; contextual: number;
      }
    | undefined;
  if (!row) throw new Error("Card not found.");

  let { ease, interval_days, repetitions } = row;
  const g = Math.max(0, Math.min(5, grade));

  if (g >= 3) {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * ease);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval_days = 1;
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02)));

  // Per-mode mastery EMA (recognition < recall < contextual difficulty)
  const modeCol = mode === "recognition" ? "recognition" : mode === "recall" ? "recall" : "contextual";
  const prev = (row as Record<string, number>)[modeCol] ?? 0;
  const next = prev * 0.6 + (g >= 3 ? 1 : 0) * 0.4;

  const nextReview = new Date(Date.now() + interval_days * 86400000).toISOString();
  await db.prepare(
    `UPDATE vocab_reviews
     SET ease = ?, interval_days = ?, repetitions = ?, next_review = ?,
         last_grade = ?, ${modeCol} = ?
     WHERE user_id = ? AND vocab_id = ?`
  ).run(ease, interval_days, repetitions, nextReview, g, next, userId, vocabId);

  return { nextReview, intervalDays: interval_days };
}

/** Count words the user has meaningfully learned (recall mastery >= 0.7). */
export async function learnedWordCount(userId: string): Promise<number> {
  const db = getDb();
  const row = await db
    .prepare("SELECT COUNT(*) as c FROM vocab_reviews WHERE user_id = ? AND recall >= 0.7")
    .get(userId) as { c: number };
  return row.c;
}
