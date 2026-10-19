/**
 * BandQuest IELTS — Database layer (dual-mode, async).
 *
 * LOCAL mode (default): Node's built-in node:sqlite, file at data/bandquest.db.
 *   Zero-config — used for development and tests.
 *
 * REMOTE mode: Turso (libSQL) when TURSO_DATABASE_URL is set (plus
 *   TURSO_AUTH_TOKEN). Used for hosted deploys where the local filesystem is
 *   ephemeral (e.g. Render's free tier wipes local files on every restart —
 *   a local SQLite file would lose all user accounts there).
 *
 * Both modes speak the SQLite dialect, and expose the same async API shaped
 * like node:sqlite: db.prepare(sql).get()/.all()/.run(), db.exec(sql).
 * Every query method returns a Promise — callers always `await` it.
 */
import { DatabaseSync } from "node:sqlite";
import { createClient, type Client } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";

export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

export interface DbStatement {
  get(...params: any[]): Promise<any>;
  all(...params: any[]): Promise<any[]>;
  run(...params: any[]): Promise<RunResult>;
}

export interface BatchItem {
  sql: string;
  args?: any[];
}

export interface Db {
  prepare(sql: string): DbStatement;
  exec(sql: string): Promise<void>;
  /** Run several statements as one unit (single round-trip on remote). */
  batch(items: BatchItem[]): Promise<void>;
}

/** node:sqlite also accepts a single array; libsql wants an array — normalize. */
function normArgs(params: any[]): any[] {
  if (params.length === 1 && Array.isArray(params[0])) return params[0];
  return params;
}

// ---------------------------------------------------------------------------
// Local: node:sqlite file
// ---------------------------------------------------------------------------

class LocalStatement implements DbStatement {
  constructor(
    private db: DatabaseSync,
    private sql: string
  ) {}
  async get(...params: any[]): Promise<any> {
    return this.db.prepare(this.sql).get(...normArgs(params));
  }
  async all(...params: any[]): Promise<any[]> {
    return this.db.prepare(this.sql).all(...normArgs(params)) as any[];
  }
  async run(...params: any[]): Promise<RunResult> {
    const r = this.db.prepare(this.sql).run(...normArgs(params));
    return {
      changes: Number(r.changes),
      lastInsertRowid: r.lastInsertRowid,
    };
  }
}

class LocalDb implements Db {
  private db: DatabaseSync;
  constructor(dbPath: string) {
    this.db = new DatabaseSync(dbPath);
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA foreign_keys = ON;");
  }
  prepare(sql: string): DbStatement {
    return new LocalStatement(this.db, sql);
  }
  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }
  async batch(items: BatchItem[]): Promise<void> {
    // NOTE: no implicit BEGIN/COMMIT here — callers include them in `items`
    // when they need atomicity (keeps remote single-round-trip semantics identical).
    for (const it of items) {
      if (/^\s*(BEGIN|COMMIT|ROLLBACK)\b/i.test(it.sql)) {
        this.db.exec(it.sql);
      } else {
        this.db.prepare(it.sql).run(...normArgs(it.args ?? []));
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Remote: Turso (libSQL over HTTP)
// ---------------------------------------------------------------------------

class RemoteStatement implements DbStatement {
  constructor(
    private client: Client,
    private sql: string
  ) {}
  async get(...params: any[]): Promise<any> {
    const r = await this.client.execute({
      sql: this.sql,
      args: normArgs(params),
    });
    return r.rows[0] as any;
  }
  async all(...params: any[]): Promise<any[]> {
    const r = await this.client.execute({
      sql: this.sql,
      args: normArgs(params),
    });
    return r.rows as any[];
  }
  async run(...params: any[]): Promise<RunResult> {
    const r = await this.client.execute({
      sql: this.sql,
      args: normArgs(params),
    });
    return {
      changes: Number(r.rowsAffected),
      lastInsertRowid: r.lastInsertRowid ?? 0,
    };
  }
}

class RemoteDb implements Db {
  private client: Client;
  constructor(url: string, authToken: string) {
    this.client = createClient({ url, authToken });
  }
  prepare(sql: string): DbStatement {
    return new RemoteStatement(this.client, sql);
  }
  async exec(sql: string): Promise<void> {
    await this.client.executeMultiple(sql);
  }
  async batch(items: BatchItem[]): Promise<void> {
    await this.client.batch(
      items.map((it) => ({ sql: it.sql, args: normArgs(it.args ?? []) }))
    );
  }
}

// ---------------------------------------------------------------------------

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_URL || path.join(DB_DIR, "bandquest.db");

let db: Db | null = null;

export function isRemoteDb(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

/** Synchronous factory — returns the shared wrapper. Query methods are async. */
export function getDb(): Db {
  if (db) return db;
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) {
    const token = process.env.TURSO_AUTH_TOKEN;
    if (!token) throw new Error("TURSO_DATABASE_URL is set but TURSO_AUTH_TOKEN is missing.");
    db = new RemoteDb(tursoUrl, token);
  } else {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    db = new LocalDb(DB_PATH);
  }
  return db;
}

/** Run the full schema. Idempotent — safe to run on every boot. */
export async function migrate(): Promise<void> {
  const d = getDb();
  await d.exec(SCHEMA);
  // --- Column migrations (guarded, idempotent) ---
  // NOTE: SQLite cannot ADD COLUMN with a UNIQUE constraint; add plain TEXT
  // and enforce uniqueness with a separate index (NULLs stay distinct).
  await addColumnIfMissing(d, "users", "google_id", "TEXT");
  await d.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)"
  );
  await addColumnIfMissing(d, "users", "is_guest", "INTEGER NOT NULL DEFAULT 0");
}

/** Add a column only if it does not exist yet (SQLite has no ADD COLUMN IF NOT EXISTS). */
async function addColumnIfMissing(
  d: Db,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  const cols = (await d
    .prepare(`PRAGMA table_info(${table})`)
    .all()) as Array<{ name: string }>;
  if (!cols.some((c) => c.name === column)) {
    await d.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

const SCHEMA = `
-- Users & auth
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner', -- learner | admin
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Profiles & preferences
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  target_band REAL,
  test_type TEXT DEFAULT 'academic', -- academic | general
  exam_date TEXT,
  minutes_per_day INTEGER DEFAULT 30,
  interface_lang TEXT DEFAULT 'en', -- en | bn
  strongest_module TEXT,
  weakest_module TEXT,
  current_level INTEGER DEFAULT 1, -- 1 beginner | 2 intermediate | 3 pro
  diagnostic_done INTEGER DEFAULT 0,
  diagnostic_band REAL,
  study_plan_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Curriculum structure
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_bn TEXT,
  description TEXT,
  level INTEGER NOT NULL, -- 1|2|3
  kind TEXT NOT NULL, -- journey | listening | reading | writing | speaking | grammar | vocabulary
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_bn TEXT,
  sort_order INTEGER DEFAULT 0,
  objectives_json TEXT, -- string[]
  content_md TEXT NOT NULL, -- lesson markdown (EN)
  content_md_bn TEXT, -- lesson markdown (BN explanations)
  vocab_json TEXT, -- [{word,pos,definition,bn,example,collocations}]
  is_checkpoint_required INTEGER DEFAULT 1,
  pass_threshold REAL DEFAULT 70,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'published', -- draft | review | published
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_episodes_course ON episodes(course_id);

-- Questions (objective + open-ended)
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  episode_id TEXT REFERENCES episodes(id) ON DELETE SET NULL,
  module TEXT NOT NULL, -- grammar|vocabulary|listening|reading|writing|speaking|mock
  qtype TEXT NOT NULL, -- mcq | fillblank | truefalse | matching | ordering | shortanswer | essay | speaking | tfng | ynng | summary | diagram
  difficulty INTEGER DEFAULT 1, -- 1..3
  prompt_md TEXT NOT NULL,
  prompt_audio_url TEXT,
  options_json TEXT, -- string[] for mcq/matching
  answer_json TEXT NOT NULL, -- canonical answer (JSON)
  explanation_md TEXT,
  explanation_md_bn TEXT,
  skill_tags_json TEXT, -- string[]
  fingerprint TEXT, -- dedupe hash
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_questions_episode ON questions(episode_id);
CREATE INDEX IF NOT EXISTS idx_questions_module ON questions(module);
CREATE INDEX IF NOT EXISTS idx_questions_fingerprint ON questions(fingerprint);

-- Learner answers & attempts
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id TEXT REFERENCES episodes(id) ON DELETE SET NULL,
  kind TEXT NOT NULL, -- checkpoint | practice | mock | diagnostic
  mock_id TEXT,
  score REAL, -- 0..100
  stars INTEGER, -- 1..5
  passed INTEGER, -- 0|1
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at TEXT,
  duration_secs INTEGER,
  ai_model TEXT,
  rubric_version TEXT
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_episode ON attempts(episode_id);

CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),
  response_json TEXT NOT NULL,
  is_correct INTEGER,
  score REAL,
  feedback_md TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON answers(attempt_id);

-- Question history (anti-repeat)
CREATE TABLE IF NOT EXISTS question_history (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),
  seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  was_correct INTEGER,
  PRIMARY KEY (user_id, question_id)
);

-- Progress & mastery
CREATE TABLE IF NOT EXISTS episode_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id TEXT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked', -- locked | unlocked | in_progress | passed | mastered
  best_score REAL,
  best_stars INTEGER,
  attempts_count INTEGER DEFAULT 0,
  unlocked_at TEXT,
  passed_at TEXT,
  PRIMARY KEY (user_id, episode_id)
);

CREATE TABLE IF NOT EXISTS grammar_mastery (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept TEXT NOT NULL, -- e.g. 'present-perfect'
  mastery REAL DEFAULT 0, -- 0..1 (EMA)
  attempts INTEGER DEFAULT 0,
  last_seen TEXT,
  PRIMARY KEY (user_id, concept)
);

CREATE TABLE IF NOT EXISTS vocabulary_items (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  pos TEXT,
  definition_en TEXT NOT NULL,
  definition_bn TEXT,
  ipa TEXT,
  example_en TEXT,
  collocations_json TEXT,
  word_family_json TEXT,
  synonyms_json TEXT,
  topic TEXT,
  level INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_vocab_topic ON vocabulary_items(topic);
CREATE INDEX IF NOT EXISTS idx_vocab_word ON vocabulary_items(word);

-- Spaced repetition (FSRS-lite / SM-2 style)
CREATE TABLE IF NOT EXISTS vocab_reviews (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocab_id TEXT NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
  ease REAL DEFAULT 2.5,
  interval_days REAL DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review TEXT NOT NULL DEFAULT (datetime('now')),
  last_grade INTEGER,
  recognition REAL DEFAULT 0,
  recall REAL DEFAULT 0,
  contextual REAL DEFAULT 0,
  PRIMARY KEY (user_id, vocab_id)
);
CREATE INDEX IF NOT EXISTS idx_vocab_reviews_due ON vocab_reviews(user_id, next_review);

-- Gamification
CREATE TABLE IF NOT EXISTS xp_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_events(user_id);

CREATE TABLE IF NOT EXISTS streaks (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date TEXT
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, achievement_id)
);

-- Mock tests
CREATE TABLE IF NOT EXISTS mock_tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  test_type TEXT NOT NULL, -- academic | general
  config_json TEXT NOT NULL, -- durations, sections, scoring tables
  status TEXT DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mock_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mock_id TEXT NOT NULL REFERENCES mock_tests(id),
  status TEXT DEFAULT 'in_progress', -- in_progress | submitted | scored
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at TEXT,
  answers_json TEXT,
  scores_json TEXT, -- per-section raw + band estimates
  overall_band REAL,
  report_md TEXT,
  disclaimer_shown INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_mock_sessions_user ON mock_sessions(user_id);

-- Writing & speaking submissions
CREATE TABLE IF NOT EXISTS writing_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  task_type TEXT NOT NULL, -- academic1 | general1 | task2
  text TEXT NOT NULL,
  word_count INTEGER,
  ai_band REAL,
  criteria_json TEXT, -- TA/TR, CC, LR, GRA with feedback
  feedback_md TEXT,
  model TEXT,
  rubric_version TEXT DEFAULT 'ielts-public-v1',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS speaking_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part TEXT NOT NULL, -- part1 | part2 | part3 | full
  audio_path TEXT,
  transcript TEXT,
  ai_band REAL,
  criteria_json TEXT, -- FC, LR, GRA, P
  feedback_md TEXT,
  model TEXT,
  rubric_version TEXT DEFAULT 'ielts-public-v1',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id),
  display_name TEXT NOT NULL,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  criteria_json TEXT,
  verify_code TEXT UNIQUE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_certs_verify ON certificates(verify_code);

-- Mistake notebook
CREATE TABLE IF NOT EXISTS mistakes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id),
  category TEXT NOT NULL, -- grammar:<concept> | vocab:<word> | skill:<module>
  note_md TEXT,
  review_due TEXT,
  resolved INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mistakes_user ON mistakes(user_id);

-- AI usage & config
CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- speaking | writing | assessment | audio
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_day ON ai_usage(user_id, created_at);

CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Content sources
CREATE TABLE IF NOT EXISTS content_sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  skill TEXT,
  last_checked TEXT,
  notes TEXT
);

-- Study plans
CREATE TABLE IF NOT EXISTS study_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_json TEXT NOT NULL,
  weeks INTEGER DEFAULT 8,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
