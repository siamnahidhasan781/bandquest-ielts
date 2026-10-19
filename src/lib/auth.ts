/**
 * BandQuest IELTS — Authentication
 * Session tokens via jose (JWT) stored in httpOnly cookies.
 * Passwords hashed with bcryptjs.
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { getDb } from "./db/index";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bandquest-dev-secret-change-in-production"
);
const SESSION_DAYS = 30;

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: "learner" | "admin";
  /** True for trial accounts that have not signed up yet. */
  isGuest: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = randomUUID();
  const db = getDb();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  await db.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(sessionId, userId, expires.toISOString());

  const token = await new SignJWT({ sid: sessionId, sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(JWT_SECRET);
  return token;
}

export async function getSessionUser(
  token: string | undefined
): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const sid = payload.sid as string;
    const db = getDb();
    const row = await db
      .prepare(
        `SELECT s.user_id, s.expires_at, u.email, u.display_name, u.role, u.is_guest
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.id = ?`
      )
      .get(sid) as
      | {
          user_id: string;
          expires_at: string;
          email: string;
          display_name: string;
          role: string;
          is_guest: number;
        }
      | undefined;
    if (!row) return null;
    if (new Date(row.expires_at) < new Date()) {
      await db.prepare("DELETE FROM sessions WHERE id = ?").run(sid);
      return null;
    }
    return {
      id: row.user_id,
      email: row.email,
      displayName: row.display_name,
      role: row.role as "learner" | "admin",
      isGuest: row.is_guest === 1,
    };
  } catch {
    return null;
  }
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const sid = payload.sid as string;
    await getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sid);
  } catch {
    // ignore
  }
}

/** Unlock the first episode of every active level-1 course for a user. */
async function unlockFirstEpisodes(
  db: ReturnType<typeof getDb>,
  userId: string
): Promise<void> {
  const courses = await db
    .prepare("SELECT id FROM courses WHERE level = 1 AND is_active = 1")
    .all() as { id: string }[];
  for (const course of courses) {
    const first = await db
      .prepare(
        "SELECT id FROM episodes WHERE course_id = ? AND status='published' ORDER BY sort_order ASC LIMIT 1"
      )
      .get(course.id) as { id: string } | undefined;
    if (first) {
      await db.prepare(
        `INSERT OR IGNORE INTO episode_progress (user_id, episode_id, status, unlocked_at)
         VALUES (?, ?, 'unlocked', datetime('now'))`
      ).run(userId, first.id);
    }
  }
}

/** Number of real (non-guest) accounts — used for the first-user-becomes-admin rule. */
async function countRealUsers(db: ReturnType<typeof getDb>): Promise<number> {
  return (await db.prepare("SELECT COUNT(*) as c FROM users WHERE is_guest = 0").get() as { c: number }).c;
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<AuthUser> {
  const db = getDb();
  const existing = await db
    .prepare("SELECT id FROM users WHERE email = ? AND is_guest = 0")
    .get(email.toLowerCase());
  if (existing) throw new Error("An account with this email already exists.");

  const id = randomUUID();
  const passwordHash = await hashPassword(password);
  // First real user becomes admin (guests don't count)
  const role = (await countRealUsers(db)) === 0 ? "admin" : "learner";

  await db.prepare(
    "INSERT INTO users (id, email, password_hash, display_name, role, is_guest) VALUES (?, ?, ?, ?, ?, 0)"
  ).run(id, email.toLowerCase(), passwordHash, displayName, role);
  await db.prepare("INSERT INTO profiles (user_id) VALUES (?)").run(id);
  await db.prepare(
    "INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)"
  ).run(id);
  await unlockFirstEpisodes(db, id);

  return { id, email: email.toLowerCase(), displayName, role: role as "learner" | "admin", isGuest: false };
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const db = getDb();
  const row = await db
    .prepare("SELECT * FROM users WHERE email = ? AND is_guest = 0")
    .get(email.toLowerCase()) as
    | {
        id: string;
        email: string;
        password_hash: string;
        display_name: string;
        role: string;
      }
    | undefined;
  if (!row) throw new Error("Invalid email or password.");
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) throw new Error("Invalid email or password.");
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role as "learner" | "admin",
    isGuest: false,
  };
}

// ---------------------------------------------------------------------------
// Guest (trial) accounts
// ---------------------------------------------------------------------------

const GUEST_EMAIL_DOMAIN = "guests.bandquest.local";
const GUEST_MAX_AGE_DAYS = 90;

/**
 * Create a lightweight trial account. Guests can learn (lessons, checkpoints,
 * vocab) and all history is stored — converting to a real account later keeps
 * everything. AI features, mock tests and certificates require signup.
 */
export async function createGuestUser(): Promise<AuthUser> {
  const db = getDb();
  // Opportunistic cleanup of long-abandoned guests (runs rarely, cheap).
  await db.prepare(
    `DELETE FROM users WHERE is_guest = 1 AND created_at < datetime('now', '-' || ? || ' days')`
  ).run(GUEST_MAX_AGE_DAYS);

  const id = randomUUID();
  const email = `guest_${id}@${GUEST_EMAIL_DOMAIN}`;
  await db.prepare(
    "INSERT INTO users (id, email, password_hash, display_name, role, is_guest) VALUES (?, ?, '', 'Guest', 'learner', 1)"
  ).run(id, email);
  await db.prepare("INSERT INTO profiles (user_id) VALUES (?)").run(id);
  await db.prepare(
    "INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)"
  ).run(id);
  await unlockFirstEpisodes(db, id);
  return { id, email, displayName: "Guest", role: "learner", isGuest: true };
}

/**
 * Convert a guest account into a real account in place — all history
 * (attempts, XP, streaks, vocab, achievements) is preserved automatically
 * because it stays on the same user row.
 */
export async function convertGuestToRegistered(
  guestId: string,
  opts: { email: string; passwordHash?: string; googleId?: string; displayName: string }
): Promise<AuthUser> {
  const db = getDb();
  const guest = await db
    .prepare("SELECT id, is_guest FROM users WHERE id = ?")
    .get(guestId) as { id: string; is_guest: number } | undefined;
  if (!guest || guest.is_guest !== 1) throw new Error("Guest account not found.");

  const taken = await db
    .prepare("SELECT id FROM users WHERE email = ? AND id != ? AND is_guest = 0")
    .get(opts.email.toLowerCase(), guestId);
  if (taken) throw new Error("An account with this email already exists.");
  if (opts.googleId) {
    const linked = await db
      .prepare("SELECT id FROM users WHERE google_id = ? AND id != ?")
      .get(opts.googleId, guestId);
    if (linked) throw new Error("This Google account is already linked elsewhere.");
  }

  // First real user becomes admin (guests don't count)
  const role = (await countRealUsers(db)) === 0 ? "admin" : "learner";
  await db.prepare(
    `UPDATE users SET email = ?, password_hash = COALESCE(?, password_hash),
     google_id = COALESCE(?, google_id), display_name = ?, role = ?,
     is_guest = 0, updated_at = datetime('now') WHERE id = ?`
  ).run(
    opts.email.toLowerCase(),
    opts.passwordHash ?? null,
    opts.googleId ?? null,
    opts.displayName,
    role,
    guestId
  );
  return {
    id: guestId,
    email: opts.email.toLowerCase(),
    displayName: opts.displayName,
    role: role as "learner" | "admin",
    isGuest: false,
  };
}

/**
 * Merge a guest's history into an existing real account (used when a guest
 * signs in to an account they already had). All progress moves over;
 * the guest row is removed. The guest's live session keeps working and now
 * resolves to the real account.
 */
export async function mergeGuestIntoUser(guestId: string, userId: string): Promise<void> {
  if (guestId === userId) return;
  const db = getDb();
  const guest = await db
    .prepare("SELECT id FROM users WHERE id = ? AND is_guest = 1")
    .get(guestId) as { id: string } | undefined;
  if (!guest) return; // nothing to merge

  // Tables where (user_id, X) must stay unique: move what fits, drop conflicts.
  const uniquePairTables = [
    "user_achievements",
    "vocab_reviews",
    "grammar_mastery",
    "episode_progress",
    "question_history",
  ];
  // Plain history tables: reassign wholesale.
  const plainTables = [
    "attempts",
    "xp_events",
    "mock_sessions",
    "writing_submissions",
    "speaking_sessions",
    "certificates",
    "mistakes",
    "ai_usage",
    "study_plans",
    "sessions",
  ];

  // streaks: keep the best of both — read first, then write everything atomically.
  const g = await db.prepare("SELECT current_streak, longest_streak FROM streaks WHERE user_id = ?").get(guestId) as
    | { current_streak: number; longest_streak: number } | undefined;
  const u = await db.prepare("SELECT current_streak, longest_streak FROM streaks WHERE user_id = ?").get(userId) as
    | { current_streak: number; longest_streak: number } | undefined;

  // One batch = one round-trip on remote, wrapped in a transaction for atomicity.
  const stmts: { sql: string; args?: any[] }[] = [{ sql: "BEGIN" }];
  // profiles: keep the real user's; drop the guest's.
  stmts.push({ sql: "DELETE FROM profiles WHERE user_id = ?", args: [guestId] });
  if (g && u) {
    stmts.push({
      sql: "UPDATE streaks SET current_streak = MAX(current_streak, ?), longest_streak = MAX(longest_streak, ?) WHERE user_id = ?",
      args: [g.current_streak, g.longest_streak, userId],
    });
    stmts.push({ sql: "DELETE FROM streaks WHERE user_id = ?", args: [guestId] });
  } else if (g && !u) {
    stmts.push({ sql: "UPDATE streaks SET user_id = ? WHERE user_id = ?", args: [userId, guestId] });
  } else {
    stmts.push({ sql: "DELETE FROM streaks WHERE user_id = ?", args: [guestId] });
  }
  for (const t of uniquePairTables) {
    stmts.push({ sql: `UPDATE OR IGNORE ${t} SET user_id = ? WHERE user_id = ?`, args: [userId, guestId] });
    stmts.push({ sql: `DELETE FROM ${t} WHERE user_id = ?`, args: [guestId] });
  }
  for (const t of plainTables) {
    stmts.push({ sql: `UPDATE ${t} SET user_id = ? WHERE user_id = ?`, args: [userId, guestId] });
  }
  stmts.push({ sql: "DELETE FROM users WHERE id = ?", args: [guestId] });
  stmts.push({ sql: "COMMIT" });

  try {
    await db.batch(stmts);
  } catch (e) {
    try {
      await db.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
}

/**
 * Find-or-create for Google sign-in. Links google_id to an existing account
 * when the verified email already has one. Pure DB logic — the OAuth dance
 * lives in the route handlers (testable without network).
 */
export async function upsertGoogleUser(profile: GoogleProfile): Promise<{ user: AuthUser; isNew: boolean }> {
  const db = getDb();
  const email = profile.email.toLowerCase();

  // 1. Already linked → sign in.
  let row = await db.prepare("SELECT * FROM users WHERE google_id = ?").get(profile.googleId) as
    | { id: string; email: string; display_name: string; role: string; is_guest: number }
    | undefined;
  if (row) {
    return {
      user: { id: row.id, email: row.email, displayName: row.display_name, role: row.role as "learner" | "admin", isGuest: row.is_guest === 1 },
      isNew: false,
    };
  }

  // 2. Verified email matches a real account → link it.
  const linked = await db.prepare("SELECT * FROM users WHERE email = ? AND is_guest = 0").get(email) as
    | { id: string; email: string; display_name: string; role: string }
    | undefined;
  if (linked) {
    await db.prepare("UPDATE users SET google_id = ?, updated_at = datetime('now') WHERE id = ?").run(
      profile.googleId,
      linked.id
    );
    return {
      user: { id: linked.id, email: linked.email, displayName: linked.display_name, role: linked.role as "learner" | "admin", isGuest: false },
      isNew: false,
    };
  }

  // 3. Brand new account.
  const id = randomUUID();
  const role = (await countRealUsers(db)) === 0 ? "admin" : "learner";
  await db.prepare(
    "INSERT INTO users (id, email, password_hash, display_name, role, google_id, is_guest) VALUES (?, ?, '', ?, ?, ?, 0)"
  ).run(id, email, profile.name || email.split("@")[0], role, profile.googleId);
  await db.prepare("INSERT INTO profiles (user_id) VALUES (?)").run(id);
  await db.prepare("INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)").run(id);
  await unlockFirstEpisodes(db, id);
  return {
    user: { id, email, displayName: profile.name || email.split("@")[0], role: role as "learner" | "admin", isGuest: false },
    isNew: true,
  };
}

/** True when the admin has configured Google OAuth credentials. */
export function googleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** Absolute URL of this app (used for the OAuth redirect URI). */
export function appBaseUrl(): string {
  const url = process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export const SESSION_COOKIE = "bq_session";

/** Mobile apps (React Native) can't reliably read Set-Cookie, so when the
 *  client sends `x-bq-mobile: 1` we also return the raw session token in JSON
 *  for it to store in secure storage. */
export function wantsMobileToken(req: NextRequest): boolean {
  return req.headers.get("x-bq-mobile") === "1";
}

export function sessionCookieOptions(maxAgeSecs: number = SESSION_DAYS * 86400) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSecs,
  };
}
