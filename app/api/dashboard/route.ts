import { NextRequest } from "next/server";
import { json, handler, ensureViewer } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";
import { totalXP, starsForScore } from "@/lib/engine";
import { learnedWordCount, getDueCards } from "@/lib/srs";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const db = getDb();

  const xp = await totalXP(user.id);
  const streak = await db.prepare("SELECT current_streak, longest_streak FROM streaks WHERE user_id = ?").get(user.id) as
    | { current_streak: number; longest_streak: number }
    | undefined;

  const passed = (await db.prepare(
    "SELECT COUNT(*) as c FROM episode_progress WHERE user_id = ? AND status IN ('passed','mastered')"
  ).get(user.id) as { c: number }).c;
  const total = (await db.prepare("SELECT COUNT(*) as c FROM episodes WHERE status='published'").get() as { c: number }).c;

  // Continue learning: first unlocked/in_progress episode
  const nextUp = await db.prepare(
    `SELECT e.id, e.title, e.sort_order, c.title as course_title, ep.status
     FROM episode_progress ep
     JOIN episodes e ON e.id = ep.episode_id
     JOIN courses c ON c.id = e.course_id
     WHERE ep.user_id = ? AND ep.status IN ('unlocked','in_progress')
     ORDER BY c.sort_order ASC, e.sort_order ASC LIMIT 3`
  ).all(user.id);

  // Recent attempts
  const recent = await db.prepare(
    `SELECT a.id, a.score, a.stars, a.passed, a.submitted_at, e.title as episode_title
     FROM attempts a LEFT JOIN episodes e ON e.id = a.episode_id
     WHERE a.user_id = ? AND a.submitted_at IS NOT NULL
     ORDER BY a.submitted_at DESC LIMIT 5`
  ).all(user.id);

  // Mock history
  const mocks = await db.prepare(
    `SELECT overall_band, submitted_at FROM mock_sessions
     WHERE user_id = ? AND status = 'scored' ORDER BY submitted_at DESC LIMIT 10`
  ).all(user.id) as { overall_band: number; submitted_at: string }[];

  const vocabDue = (await getDueCards(user.id, 1)).length;
  const vocabLearned = await learnedWordCount(user.id);

  // Weak grammar concepts
  const weak = await db.prepare(
    `SELECT concept, mastery FROM grammar_mastery WHERE user_id = ? AND mastery < 0.6 ORDER BY mastery ASC LIMIT 5`
  ).all(user.id);

  const achievements = await db.prepare(
    `SELECT a.code, a.title, ua.earned_at FROM user_achievements ua
     JOIN achievements a ON a.id = ua.achievement_id
     WHERE ua.user_id = ? ORDER BY ua.earned_at DESC LIMIT 6`
  ).all(user.id);

  // 7-day XP activity
  const activity = await db.prepare(
    `SELECT date(created_at) as d, SUM(amount) as xp FROM xp_events
     WHERE user_id = ? AND date(created_at) >= date('now', '-6 days')
     GROUP BY d ORDER BY d ASC`
  ).all(user.id);

  return json({
    xp,
    streak: streak ?? { current_streak: 0, longest_streak: 0 },
    episodes: { passed, total },
    nextUp,
    recent,
    mockTrend: mocks.reverse(),
    vocab: { due: vocabDue, learned: vocabLearned },
    weakConcepts: weak,
    achievements,
    activity,
  });
});
