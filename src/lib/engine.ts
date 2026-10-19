/**
 * BandQuest IELTS — Learning engine
 * Server-side assessment, 70% progression rule, remediation, XP, streaks.
 */
import { randomUUID } from "node:crypto";
import { getDb } from "./db";

export const PASS_THRESHOLD = 70;

export interface ScoredAnswer {
  questionId: string;
  isCorrect: boolean;
  score: number; // 0..1 per question
  feedback: string;
}

interface QuestionRow {
  id: string;
  episode_id: string;
  module: string;
  qtype: string;
  difficulty: number;
  prompt_md: string;
  options_json: string | null;
  answer_json: string;
  explanation_md: string;
  explanation_md_bn: string | null;
  skill_tags_json: string | null;
}

/** Deterministic server-side scoring for objective question types. */
export function scoreAnswer(
  q: QuestionRow,
  response: unknown
): { isCorrect: boolean; score: number } {
  const answer = JSON.parse(q.answer_json);
  try {
    switch (q.qtype) {
      case "mcq": {
        const idx = typeof response === "number" ? response : parseInt(String(response), 10);
        return { isCorrect: idx === answer, score: idx === answer ? 1 : 0 };
      }
      case "truefalse": {
        const normResp = String(response ?? "").toLowerCase();
        const val =
          normResp === "true" || normResp === "1" ? "true"
          : normResp === "false" || normResp === "0" ? "false"
          : normResp === "notgiven" || normResp === "not_given" || normResp === "ng" ? "notgiven"
          : response === true ? "true"
          : response === false ? "false" : "unknown";
        const normAns = String(answer).toLowerCase().replace(/_/g, "");
        const ok = val === normAns || (normAns === "notgiven" && val === "notgiven");
        return { isCorrect: ok, score: ok ? 1 : 0 };
      }
      case "fillblank": {
        const accepted: string[] = Array.isArray(answer) ? answer : [String(answer)];
        const norm = String(response ?? "").trim().toLowerCase();
        const ok = accepted.some((a) => a.toLowerCase() === norm);
        return { isCorrect: ok, score: ok ? 1 : 0 };
      }
      case "shortanswer": {
        // Keyword-based partial credit: answer_json = {keywords: string[], min?: number}
        const keywords: string[] = answer.keywords ?? [];
        const min: number = answer.min ?? Math.ceil(keywords.length / 2);
        const text = String(response ?? "").toLowerCase();
        const hits = keywords.filter((k) => text.includes(k.toLowerCase())).length;
        const ratio = keywords.length ? hits / keywords.length : 0;
        return { isCorrect: hits >= min, score: Math.round(ratio * 100) / 100 };
      }
      case "ordering": {
        // answer_json = correct order array; response = array
        const resp = Array.isArray(response) ? response : [];
        const ok =
          resp.length === answer.length &&
          resp.every((v, i) => String(v) === String(answer[i]));
        return { isCorrect: ok, score: ok ? 1 : 0 };
      }
      default:
        return { isCorrect: false, score: 0 };
    }
  } catch {
    return { isCorrect: false, score: 0 };
  }
}

export function starsForScore(score: number): number {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 50) return 2;
  return 1;
}

/** Select checkpoint questions: prefer unseen, avoid exact repeats. */
export async function selectCheckpointQuestions(
  userId: string,
  episodeId: string,
  count = 8
): Promise<QuestionRow[]> {
  const db = getDb();
  const seen = new Set(
    (
      await db
        .prepare(
          `SELECT qh.question_id as id FROM question_history qh
           JOIN questions q ON q.id = qh.question_id
           WHERE qh.user_id = ? AND q.episode_id = ?`
        )
        .all(userId, episodeId) as { id: string }[]
    ).map((r) => r.id)
  );
  const all = await db
    .prepare(
      `SELECT * FROM questions WHERE episode_id = ? AND status = 'published' ORDER BY difficulty ASC, id ASC`
    )
    .all(episodeId) as unknown as QuestionRow[];

  const unseen = all.filter((q) => !seen.has(q.id));
  const seenOnly = all.filter((q) => seen.has(q.id));
  // Fetch last-seen timestamps up front (comparators must stay synchronous).
  const seenAt = new Map<string, string>();
  for (const q of seenOnly) {
    const r = (await db
      .prepare("SELECT seen_at FROM question_history WHERE user_id = ? AND question_id = ?")
      .get(userId, q.id)) as { seen_at: string } | undefined;
    seenAt.set(q.id, r?.seen_at ?? "");
  }
  const seenOldest = seenOnly.sort((a, b) =>
    String(seenAt.get(a.id)).localeCompare(String(seenAt.get(b.id)))
  );

  const picked: QuestionRow[] = [];
  // Balance difficulty: take proportionally
  const pool = [...unseen, ...seenOldest];
  // Simple deterministic shuffle by user+episode for variety
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Ensure difficulty mix: sort picked by difficulty after selection
  const target = Math.min(count, pool.length);
  for (let i = 0; i < target; i++) picked.push(pool[i]);
  picked.sort((a, b) => a.difficulty - b.difficulty);
  return picked;
}

/** Strip answers before sending questions to the client. */
export function publicQuestion(q: QuestionRow) {
  return {
    id: q.id,
    module: q.module,
    qtype: q.qtype,
    difficulty: q.difficulty,
    prompt_md: q.prompt_md,
    options_json: q.options_json ? JSON.parse(q.options_json) : null,
    skill_tags: q.skill_tags_json ? JSON.parse(q.skill_tags_json) : [],
  };
}

export interface AttemptResult {
  attemptId: string;
  score: number;
  stars: number;
  passed: boolean;
  results: Array<{
    questionId: string;
    isCorrect: boolean;
    score: number;
    explanation_md: string;
    explanation_md_bn: string | null;
    skill_tags: string[];
  }>;
  remediation: {
    weakTags: string[];
    message: string;
    message_bn: string;
  } | null;
  xpAwarded: number;
  unlockedNext: string | null;
}

/** Grade a submitted attempt. All scoring happens here, server-side. */
export async function gradeAttempt(
  userId: string,
  attemptId: string,
  responses: Record<string, unknown>
): Promise<AttemptResult> {
  const db = getDb();
  const attempt = await db
    .prepare("SELECT * FROM attempts WHERE id = ? AND user_id = ?")
    .get(attemptId, userId) as
    | { id: string; episode_id: string; kind: string; started_at: string }
    | undefined;
  if (!attempt) throw new Error("Attempt not found.");
  if (!attempt.episode_id) throw new Error("Attempt has no episode.");

  const episode = await db
    .prepare("SELECT * FROM episodes WHERE id = ?")
    .get(attempt.episode_id) as
    | { id: string; course_id: string; sort_order: number; pass_threshold: number }
    | undefined;
  if (!episode) throw new Error("Episode not found.");

  // Load the questions that were assigned to this attempt
  const assigned = await db
    .prepare(
      `SELECT q.* FROM answers a JOIN questions q ON q.id = a.question_id
       WHERE a.attempt_id = ?`
    )
    .all(attemptId) as unknown as QuestionRow[];

  if (assigned.length === 0) throw new Error("No questions in this attempt.");

  let totalScore = 0;
  const results: AttemptResult["results"] = [];
  const weakTagCounts: Record<string, number> = {};

  for (const q of assigned) {
    const { isCorrect, score } = scoreAnswer(q, responses[q.id]);
    totalScore += score;
    const tags: string[] = q.skill_tags_json ? JSON.parse(q.skill_tags_json) : [];
    if (!isCorrect) {
      for (const t of tags) weakTagCounts[t] = (weakTagCounts[t] ?? 0) + 1;
    }
    await db.prepare(
      `UPDATE answers SET response_json = ?, is_correct = ?, score = ?, feedback_md = ?
       WHERE attempt_id = ? AND question_id = ?`
    ).run(
      JSON.stringify(responses[q.id] ?? null),
      isCorrect ? 1 : 0,
      score,
      q.explanation_md,
      attemptId,
      q.id
    );
    // Record in question history (anti-repeat)
    await db.prepare(
      `INSERT OR REPLACE INTO question_history (user_id, question_id, seen_at, was_correct)
       VALUES (?, ?, datetime('now'), ?)`
    ).run(userId, q.id, isCorrect ? 1 : 0);
    // Update grammar mastery EMA per skill tag
    for (const t of tags) {
      const cur = await db
        .prepare("SELECT mastery, attempts FROM grammar_mastery WHERE user_id = ? AND concept = ?")
        .get(userId, t) as { mastery: number; attempts: number } | undefined;
      const prev = cur?.mastery ?? 0.5;
      const next = prev * 0.7 + (isCorrect ? 1 : 0) * 0.3;
      await db.prepare(
        `INSERT OR REPLACE INTO grammar_mastery (user_id, concept, mastery, attempts, last_seen)
         VALUES (?, ?, ?, ?, datetime('now'))`
      ).run(userId, t, next, (cur?.attempts ?? 0) + 1);
    }
    results.push({
      questionId: q.id,
      isCorrect,
      score,
      explanation_md: q.explanation_md,
      explanation_md_bn: q.explanation_md_bn,
      skill_tags: tags,
    });
  }

  const pct = Math.round((totalScore / assigned.length) * 100);
  const stars = starsForScore(pct);
  const passed = pct >= (episode.pass_threshold || PASS_THRESHOLD);
  const durationSecs = Math.max(
    0,
    Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000)
  );

  await db.prepare(
    `UPDATE attempts SET score = ?, stars = ?, passed = ?, submitted_at = datetime('now'), duration_secs = ?
     WHERE id = ?`
  ).run(pct, stars, passed ? 1 : 0, durationSecs, attemptId);

  // Update episode progress
  const prog = await db
    .prepare("SELECT * FROM episode_progress WHERE user_id = ? AND episode_id = ?")
    .get(userId, episode.id) as
    | { best_score: number | null; attempts_count: number }
    | undefined;
  const attemptsCount = (prog?.attempts_count ?? 0) + 1;
  const bestScore = Math.max(prog?.best_score ?? 0, pct);
  const bestStars = starsForScore(bestScore);
  await db.prepare(
    `INSERT OR REPLACE INTO episode_progress
     (user_id, episode_id, status, best_score, best_stars, attempts_count, unlocked_at, passed_at)
     VALUES (?, ?, ?, ?, ?, ?,
       COALESCE((SELECT unlocked_at FROM episode_progress WHERE user_id = ? AND episode_id = ?), datetime('now')),
       ?)`
  ).run(
    userId,
    episode.id,
    passed ? "passed" : "in_progress",
    bestScore,
    bestStars,
    attemptsCount,
    userId,
    episode.id,
    passed ? new Date().toISOString() : null
  );

  // Log mistakes for the notebook
  for (const r of results) {
    if (!r.isCorrect) {
      for (const t of r.skill_tags) {
        await db.prepare(
          `INSERT INTO mistakes (id, user_id, question_id, category, review_due)
           VALUES (?, ?, ?, ?, date('now', '+1 day'))`
        ).run(randomUUID(), userId, r.questionId, `grammar:${t}`);
      }
    }
  }

  // Unlock next episode on pass
  let unlockedNext: string | null = null;
  if (passed) {
    const next = await db
      .prepare(
        `SELECT id FROM episodes WHERE course_id = ? AND sort_order > ?
         AND status = 'published' ORDER BY sort_order ASC LIMIT 1`
      )
      .get(episode.course_id, episode.sort_order) as { id: string } | undefined;
    if (next) {
      unlockedNext = next.id;
      await db.prepare(
        `INSERT OR IGNORE INTO episode_progress (user_id, episode_id, status, unlocked_at)
         VALUES (?, ?, 'unlocked', datetime('now'))`
      ).run(userId, next.id);
    }
  }

  // XP + streak
  const xpAwarded = passed ? Math.round(pct * 1.5) + stars * 10 : Math.round(pct * 0.5);
  if (xpAwarded > 0) {
    await db.prepare(
      "INSERT INTO xp_events (id, user_id, amount, reason) VALUES (?, ?, ?, ?)"
    ).run(randomUUID(), userId, xpAwarded, `checkpoint:${episode.id}:${passed ? "pass" : "try"}`);
  }
  await updateStreak(userId);

  // Remediation on fail
  let remediation: AttemptResult["remediation"] = null;
  if (!passed) {
    const weakTags = Object.entries(weakTagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);
    remediation = {
      weakTags,
      message:
        weakTags.length > 0
          ? `Focus your revision on: ${weakTags.join(", ")}. Review the lesson section for each, then retry — your next attempt will use different questions on the same objectives.`
          : "Review the lesson material once more, then retry. Your next attempt will use different questions.",
      message_bn:
        weakTags.length > 0
          ? `এই বিষয়গুলো আবার পড়ো: ${weakTags.join(", ")}। প্রতিটির lesson অংশ দেখো, তারপর আবার চেষ্টা করো — পরের attempt-এ একই objective-এর ভিন্ন প্রশ্ন থাকবে।`
          : "Lesson-টি আরেকবার পড়ো, তারপর আবার চেষ্টা করো।",
    };
  }

  // Achievements
  await checkAchievements(userId, { passed, pct, episodeId: episode.id });

  return { attemptId, score: pct, stars, passed, results, remediation, xpAwarded, unlockedNext };
}

/** Start a checkpoint attempt: creates attempt + assigns questions (answers hidden). */
export async function startAttempt(
  userId: string,
  episodeId: string,
  kind: "checkpoint" | "practice" | "diagnostic" = "checkpoint"
): Promise<{ attemptId: string; questions: ReturnType<typeof publicQuestion>[] }> {
  const db = getDb();
  // Verify episode is unlocked for this user
  const prog = await db
    .prepare("SELECT status FROM episode_progress WHERE user_id = ? AND episode_id = ?")
    .get(userId, episodeId) as { status: string } | undefined;
  const episode = await db
    .prepare("SELECT sort_order, course_id FROM episodes WHERE id = ?")
    .get(episodeId) as { sort_order: number; course_id: string } | undefined;
  if (!episode) throw new Error("Episode not found.");

  const isFirstOfCourse =
    (
      await db
        .prepare(
          "SELECT COUNT(*) as c FROM episodes WHERE course_id = ? AND sort_order < ? AND status='published'"
        )
        .get(episode.course_id, episode.sort_order) as { c: number }
    ).c === 0;

  if (!prog && !isFirstOfCourse) throw new Error("This episode is locked. Pass the previous episode first.");
  if (prog && prog.status === "locked") throw new Error("This episode is locked. Pass the previous episode first.");

  const questions = await selectCheckpointQuestions(userId, episodeId, 6);
  if (questions.length === 0) throw new Error("No questions available for this episode.");

  const attemptId = randomUUID();
  await db.prepare(
    `INSERT INTO attempts (id, user_id, episode_id, kind, started_at)
     VALUES (?, ?, ?, ?, datetime('now'))`
  ).run(attemptId, userId, episodeId, kind);
  for (const q of questions) {
    await db.prepare(
      `INSERT INTO answers (id, attempt_id, question_id, response_json)
       VALUES (?, ?, ?, ?)`
    ).run(randomUUID(), attemptId, q.id, JSON.stringify(null));
  }
  // Mark in progress
  await db.prepare(
    `INSERT OR IGNORE INTO episode_progress (user_id, episode_id, status, unlocked_at)
     VALUES (?, ?, 'in_progress', datetime('now'))`
  ).run(userId, episodeId);

  return { attemptId, questions: questions.map(publicQuestion) };
}

export async function updateStreak(userId: string): Promise<void> {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const row = await db
    .prepare("SELECT * FROM streaks WHERE user_id = ?")
    .get(userId) as
    | { current_streak: number; longest_streak: number; last_active_date: string | null }
    | undefined;
  if (!row) {
    await db.prepare(
      "INSERT INTO streaks (user_id, current_streak, longest_streak, last_active_date) VALUES (?, 1, 1, ?)"
    ).run(userId, today);
    return;
  }
  if (row.last_active_date === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const continued = row.last_active_date === yesterday;
  const current = continued ? row.current_streak + 1 : 1;
  await db.prepare(
    "UPDATE streaks SET current_streak = ?, longest_streak = MAX(longest_streak, ?), last_active_date = ? WHERE user_id = ?"
  ).run(current, current, today, userId);
  if (current === 7) await awardAchievement(userId, "streak-7");
  if (current === 30) await awardAchievement(userId, "streak-30");
}

export async function awardAchievement(userId: string, code: string): Promise<boolean> {
  const db = getDb();
  const ach = await db.prepare("SELECT id, xp_reward FROM achievements WHERE code = ?").get(code) as
    | { id: string; xp_reward: number }
    | undefined;
  if (!ach) return false;
  const existing = await db
    .prepare("SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?")
    .get(userId, ach.id);
  if (existing) return false;
  await db.prepare(
    "INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)"
  ).run(userId, ach.id);
  if (ach.xp_reward > 0) {
    await db.prepare("INSERT INTO xp_events (id, user_id, amount, reason) VALUES (?, ?, ?, ?)").run(
      randomUUID(),
      userId,
      ach.xp_reward,
      `achievement:${code}`
    );
  }
  return true;
}

async function checkAchievements(
  userId: string,
  ctx: { passed: boolean; pct: number; episodeId: string }
): Promise<void> {
  const db = getDb();
  if (ctx.passed) {
    await awardAchievement(userId, "first-steps");
    if (ctx.episodeId === "ep-g01") await awardAchievement(userId, "grammar-starter");
    if (ctx.pct === 100) await awardAchievement(userId, "perfect-score");
    const passedCount = (
      await db
        .prepare(
          "SELECT COUNT(*) as c FROM episode_progress WHERE user_id = ? AND status IN ('passed','mastered')"
        )
        .get(userId) as { c: number }
    ).c;
    if (passedCount >= 5) await awardAchievement(userId, "grammar-half");
    const totalEpisodes = (
      await db.prepare("SELECT COUNT(*) as c FROM episodes WHERE status='published'").get() as { c: number }
    ).c;
    if (passedCount >= totalEpisodes && totalEpisodes > 0) await awardAchievement(userId, "grammar-master");
  }
}

/** User's total XP. */
export async function totalXP(userId: string): Promise<number> {
  const db = getDb();
  const row = await db
    .prepare("SELECT COALESCE(SUM(amount),0) as t FROM xp_events WHERE user_id = ?")
    .get(userId) as { t: number };
  return row.t;
}
