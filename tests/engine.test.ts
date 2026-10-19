/**
 * BandQuest IELTS — Test suite
 * Run: npm test
 * Uses node:test with an isolated test database.
 */
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";

// Isolate test DB before importing db modules
process.env.DATABASE_URL = "/tmp/bandquest-test.db";

import { getDb, migrate } from "../src/lib/db/index";
import { seed } from "../src/lib/db/seed";
import * as engine from "../src/lib/engine";
import { reviewCard, getDueCards } from "../src/lib/srs";
import { rawToBand } from "../src/lib/scoring";
import { registerUser, loginUser, createSession, getSessionUser, createGuestUser, convertGuestToRegistered, mergeGuestIntoUser, upsertGoogleUser, hashPassword } from "../src/lib/auth";

let testUserId: string;

before(async () => {
  try { fs.unlinkSync("/tmp/bandquest-test.db"); } catch {}
  await migrate();
  await seed();
});

describe("scoring engine", () => {
  test("mcq exact match", () => {
    const q = { qtype: "mcq", answer_json: JSON.stringify(1) };
    assert.equal(engine.scoreAnswer(q as never, 1).isCorrect, true);
    assert.equal(engine.scoreAnswer(q as never, 0).isCorrect, false);
  });

  test("truefalse handles true/false/notgiven", () => {
    const q = { qtype: "truefalse", answer_json: JSON.stringify(true) };
    assert.equal(engine.scoreAnswer(q as never, "true").isCorrect, true);
    assert.equal(engine.scoreAnswer(q as never, "false").isCorrect, false);
    const qng = { qtype: "truefalse", answer_json: JSON.stringify("NOT_GIVEN") };
    assert.equal(engine.scoreAnswer(qng as never, "notgiven").isCorrect, true);
    assert.equal(engine.scoreAnswer(qng as never, "true").isCorrect, false);
  });

  test("fillblank case-insensitive multi-accept", () => {
    const q = { qtype: "fillblank", answer_json: JSON.stringify(["do", "Do"]) };
    assert.equal(engine.scoreAnswer(q as never, "DO").isCorrect, true);
    assert.equal(engine.scoreAnswer(q as never, "does").isCorrect, false);
  });

  test("stars mapping", () => {
    assert.equal(engine.starsForScore(95), 5);
    assert.equal(engine.starsForScore(80), 4);
    assert.equal(engine.starsForScore(65), 3);
    assert.equal(engine.starsForScore(55), 2);
    assert.equal(engine.starsForScore(30), 1);
  });

  test("rawToBand conversion", () => {
    assert.equal(rawToBand(38, 40), 9);
    assert.equal(rawToBand(30, 40), 7.5);
    assert.equal(rawToBand(20, 40), 5.5);
    assert.equal(rawToBand(0, 40), 4);
  });
});

describe("auth", () => {
  test("register + login + session roundtrip", async () => {
    const email = `t-${randomUUID().slice(0, 8)}@test.local`;
    const user = await registerUser(email, "password123", "Tester");
    testUserId = user.id;
    assert.ok(user.id);
    const logged = await loginUser(email, "password123");
    assert.equal(logged.id, user.id);
    const token = await createSession(user.id);
    const back = await getSessionUser(token);
    assert.equal(back?.id, user.id);
  });

  test("duplicate email rejected", async () => {
    const email = `dup-${randomUUID().slice(0, 8)}@test.local`;
    await registerUser(email, "password123", "Dup");
    await assert.rejects(() => registerUser(email, "password123", "Dup2"));
  });

  test("wrong password rejected", async () => {
    const email = `w-${randomUUID().slice(0, 8)}@test.local`;
    await registerUser(email, "password123", "W");
    await assert.rejects(() => loginUser(email, "nope-nope-nope"));
  });
});

describe("progression engine", () => {
  test("locked episode rejects attempt start", async () => {
    const email = `l-${randomUUID().slice(0, 8)}@test.local`;
    const u = await registerUser(email, "password123", "Locked");
    await assert.rejects(engine.startAttempt(u.id, "ep-g05", "checkpoint"), /locked/i);
  });

  test("first episode starts, answers hidden", async () => {
    const email = `f-${randomUUID().slice(0, 8)}@test.local`;
    const u = await registerUser(email, "password123", "First");
    const { attemptId, questions } = await engine.startAttempt(u.id, "ep-g01", "checkpoint");
    assert.ok(attemptId);
    assert.ok(questions.length > 0);
    for (const q of questions) {
      assert.ok(!("answer_json" in q), "answer leaked!");
      assert.ok(!("explanation_md" in q), "explanation leaked!");
    }
  });

  test("70% rule: pass unlocks next, fail gives remediation", async () => {
    const email = `p-${randomUUID().slice(0, 8)}@test.local`;
    const u = await registerUser(email, "password123", "Passer");
    const db = getDb();

    // Pass: answer everything correctly
    const a1 = await engine.startAttempt(u.id, "ep-g01", "checkpoint");
    const answers1: Record<string, unknown> = {};
    for (const q of a1.questions) {
      const row = await db.prepare("SELECT answer_json, qtype FROM questions WHERE id = ?").get(q.id) as { answer_json: string; qtype: string };
      const ans = JSON.parse(row.answer_json);
      answers1[q.id] = row.qtype === "fillblank" ? (Array.isArray(ans) ? ans[0] : ans) : row.qtype === "truefalse" ? String(ans).toLowerCase().replace(/_/g, "") : ans;
    }
    const r1 = await engine.gradeAttempt(u.id, a1.attemptId, answers1);
    assert.equal(r1.passed, true);
    assert.ok(r1.score >= 70);
    assert.ok(r1.unlockedNext, "next episode should unlock");

    // Fail: answer everything wrong
    const a2 = await engine.startAttempt(u.id, "ep-g02", "checkpoint");
    const answers2: Record<string, unknown> = {};
    for (const q of a2.questions) answers2[q.id] = "__wrong__";
    const r2 = await engine.gradeAttempt(u.id, a2.attemptId, answers2);
    assert.equal(r2.passed, false);
    assert.ok(r2.remediation, "remediation required on fail");
    assert.ok(r2.remediation!.weakTags.length >= 0);
  });

  test("retry prefers unseen questions", async () => {
    const email = `r-${randomUUID().slice(0, 8)}@test.local`;
    const u = await registerUser(email, "password123", "Retry");
    const a1 = await engine.startAttempt(u.id, "ep-g01", "checkpoint");
    const ids1 = new Set(a1.questions.map((q) => q.id));
    const resp: Record<string, unknown> = {};
    for (const q of a1.questions) resp[q.id] = "__wrong__";
    await engine.gradeAttempt(u.id, a1.attemptId, resp);
    const a2 = await engine.startAttempt(u.id, "ep-g01", "checkpoint");
    const ids2 = new Set(a2.questions.map((q) => q.id));
    const overlap = [...ids1].filter((x) => ids2.has(x)).length;
    // ep-g01 has 8 questions, 6 picked per attempt → retry must include unseen
    assert.ok(overlap < 6, `retry should vary, overlap was ${overlap}/6`);
  });
});

describe("spaced repetition", () => {
  test("due cards + SM-2 scheduling", async () => {
    const email = `s-${randomUUID().slice(0, 8)}@test.local`;
    const u = await registerUser(email, "password123", "SRS");
    const cards = await getDueCards(u.id, 5);
    assert.ok(cards.length > 0);
    const first = cards[0];
    const r = await reviewCard(u.id, first.vocab_id, 5, "recall");
    assert.ok(r.intervalDays >= 1);
    // Card just reviewed with 5 should not be due immediately
    const due2 = (await getDueCards(u.id, 100)).map((c) => c.vocab_id);
    assert.ok(!due2.includes(first.vocab_id), "reviewed card should not be due");
  });

  test("failed card comes back soon", async () => {
    const email = `s2-${randomUUID().slice(0, 8)}@test.local`;
    const u = await registerUser(email, "password123", "SRS2");
    const cards = await getDueCards(u.id, 5);
    const r = await reviewCard(u.id, cards[0].vocab_id, 0, "recall");
    assert.equal(r.intervalDays, 1);
  });
});

describe("seed integrity", () => {
  test("10 grammar episodes with questions", async () => {
    const db = getDb();
    const eps = await db.prepare("SELECT COUNT(*) as c FROM episodes WHERE course_id = 'course-grammar-foundations'").get() as { c: number };
    assert.equal(eps.c, 10);
    const qs = await db.prepare(
      "SELECT COUNT(*) as c FROM questions q JOIN episodes e ON e.id = q.episode_id WHERE e.course_id = 'course-grammar-foundations'"
    ).get() as { c: number };
    assert.ok(qs.c >= 60, `expected 60+ questions, got ${qs.c}`);
  });

  test("no question missing qtype", async () => {
    const db = getDb();
    const bad = await db.prepare("SELECT COUNT(*) as c FROM questions WHERE qtype IS NULL OR qtype = ''").get() as { c: number };
    assert.equal(bad.c, 0);
  });

  test("vocabulary seeded", async () => {
    const db = getDb();
    const v = await db.prepare("SELECT COUNT(*) as c FROM vocabulary_items").get() as { c: number };
    assert.ok(v.c >= 15);
  });
});

after(() => {
  try { fs.unlinkSync("/tmp/bandquest-test.db"); } catch {}
});

describe("guest trial accounts", () => {
  test("guest creation provisions a lightweight account", async () => {
    const g = await createGuestUser();
    assert.equal(g.isGuest, true);
    assert.equal(g.displayName, "Guest");
    const row = await getDb().prepare("SELECT is_guest, role FROM users WHERE id = ?").get(g.id) as { is_guest: number; role: string };
    assert.equal(row.is_guest, 1);
    assert.equal(row.role, "learner"); // guests never become admin
    const prof = await getDb().prepare("SELECT user_id FROM profiles WHERE user_id = ?").get(g.id);
    assert.ok(prof);
    const streak = await getDb().prepare("SELECT user_id FROM streaks WHERE user_id = ?").get(g.id);
    assert.ok(streak);
    const unlocked = await getDb().prepare("SELECT COUNT(*) as c FROM episode_progress WHERE user_id = ?").get(g.id) as { c: number };
    assert.ok(unlocked.c > 0);
  });

  test("guests do not count toward first-admin", async () => {
    await createGuestUser();
    await createGuestUser();
    const real = await getDb().prepare("SELECT COUNT(*) as c FROM users WHERE is_guest = 0").get() as { c: number };
    assert.ok(real.c > 0); // earlier auth tests registered real users
    const email = `g-${randomUUID().slice(0, 8)}@test.local`;
    const u = await registerUser(email, "password123", "AfterGuest");
    assert.equal(u.role, "learner");
  });

  test("guest conversion preserves history in place", async () => {
    const g = await createGuestUser();
    const db = getDb();
    const aid = randomUUID();
    await db.prepare("INSERT INTO attempts (id, user_id, kind, score, passed) VALUES (?, ?, 'checkpoint', 82, 1)").run(aid, g.id);
    await db.prepare("INSERT INTO xp_events (id, user_id, amount, reason) VALUES (?, ?, 50, 'test')").run(randomUUID(), g.id);

    const email = `c-${randomUUID().slice(0, 8)}@test.local`;
    const converted = await convertGuestToRegistered(g.id, {
      email,
      passwordHash: await hashPassword("password123"),
      displayName: "Converted",
    });
    assert.equal(converted.isGuest, false);
    assert.equal(converted.id, g.id); // same row
    assert.equal(converted.email, email);
    // history still attached to the same id
    const att = await db.prepare("SELECT user_id FROM attempts WHERE id = ?").get(aid) as { user_id: string };
    assert.equal(att.user_id, g.id);
    const xp = await db.prepare("SELECT SUM(amount) as s FROM xp_events WHERE user_id = ?").get(g.id) as { s: number };
    assert.equal(xp.s, 50);
    // can now log in with the email
    const logged = await loginUser(email, "password123");
    assert.equal(logged.id, g.id);
  });

  test("guest conversion rejects an email that is taken", async () => {
    const email = `t2-${randomUUID().slice(0, 8)}@test.local`;
    await registerUser(email, "password123", "Taken");
    const g = await createGuestUser();
    await assert.rejects(
      (async () => await convertGuestToRegistered(g.id, { email, displayName: "X" }))()
    );
  });

  test("merge moves guest history into an existing account", async () => {
    const db = getDb();
    const real = await registerUser(`m-${randomUUID().slice(0, 8)}@test.local`, "password123", "Real");
    const g = await createGuestUser();
    const aid = randomUUID();
    await db.prepare("INSERT INTO attempts (id, user_id, kind, score, passed) VALUES (?, ?, 'checkpoint', 90, 1)").run(aid, g.id);
    await db.prepare("UPDATE streaks SET current_streak = 5, longest_streak = 7 WHERE user_id = ?").run(g.id);
    const token = await createSession(g.id); // guest session stays valid

    await mergeGuestIntoUser(g.id, real.id);

    const att = await db.prepare("SELECT user_id FROM attempts WHERE id = ?").get(aid) as { user_id: string };
    assert.equal(att.user_id, real.id);
    const gone = await db.prepare("SELECT id FROM users WHERE id = ?").get(g.id);
    assert.equal(gone, undefined);
    const streak = await db.prepare("SELECT current_streak, longest_streak FROM streaks WHERE user_id = ?").get(real.id) as { current_streak: number; longest_streak: number };
    assert.equal(streak.current_streak, 5);
    assert.equal(streak.longest_streak, 7);
    // the old guest session now resolves to the real account
    const back = await getSessionUser(token);
    assert.equal(back?.id, real.id);
    assert.equal(back?.isGuest, false);
  });
});

describe("google sign-in", () => {
  test("new google user is created", async () => {
    const email = `gg-${randomUUID().slice(0, 8)}@test.local`;
    const { user, isNew } = await upsertGoogleUser({ googleId: `g-${randomUUID()}`, email, name: "Google User" });
    assert.equal(isNew, true);
    assert.equal(user.isGuest, false);
    assert.equal(user.email, email);
    const row = await getDb().prepare("SELECT google_id FROM users WHERE id = ?").get(user.id) as { google_id: string };
    assert.ok(row.google_id);
  });

  test("same google id signs in again (not new)", async () => {
    const gid = `g-${randomUUID()}`;
    const email = `gg2-${randomUUID().slice(0, 8)}@test.local`;
    const first = await upsertGoogleUser({ googleId: gid, email, name: "G2" });
    const second = await upsertGoogleUser({ googleId: gid, email, name: "G2" });
    assert.equal(first.isNew, true);
    assert.equal(second.isNew, false);
    assert.equal(second.user.id, first.user.id);
  });

  test("google links to an existing email account", async () => {
    const email = `gl-${randomUUID().slice(0, 8)}@test.local`;
    const existing = await registerUser(email, "password123", "EmailFirst");
    const { user, isNew } = await upsertGoogleUser({ googleId: `g-${randomUUID()}`, email, name: "EmailFirst" });
    assert.equal(isNew, false);
    assert.equal(user.id, existing.id);
    const row = await getDb().prepare("SELECT google_id FROM users WHERE id = ?").get(existing.id) as { google_id: string };
    assert.ok(row.google_id);
  });
});
