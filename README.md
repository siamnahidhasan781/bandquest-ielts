# BandQuest IELTS — From Zero to IELTS-Ready

A complete, free, AI-powered IELTS learning ecosystem. Gamified journey, four-skill academies,
grammar & vocabulary with Bengali explanations, realistic mock tests, AI speaking examiner,
progress analytics, certificates and an admin dashboard — web, PWA and mobile.

## What was built

| Area | Status |
|---|---|
| Web app (Next.js 14, TypeScript, Tailwind, dark mode) | ✅ Built & production-build verified |
| Auth (email, bcrypt, JWT httpOnly sessions) | ✅ Working, tested |
| SQLite database (Node built-in `node:sqlite`, zero native deps) | ✅ Working |
| 10 grammar foundation episodes (EN + বাংলা, 65 questions) | ✅ Real content, seeded |
| Learning engine: 70% mastery rule, server-side scoring, remediation, anti-repeat retries | ✅ Working, 17 automated tests pass |
| Listening Academy (2 lessons, original scripts, TTS audio, T/F/NG) | ✅ Working |
| Reading Academy (2 lessons, original passages) | ✅ Working |
| Writing Academy (2 lessons + AI/rule-based feedback) | ✅ Working |
| Speaking Academy (2 lessons + AI examiner, mic recording) | ✅ Working (needs `GEMINI_API_KEY`) |
| Vocabulary Academy (SM-2 spaced repetition, 18 words, topics) | ✅ Working |
| Grammar Academy (per-concept mastery tracking) | ✅ Working |
| Mock Test Centre (timed, auto-scored L/R, band report) | ✅ Working |
| Gemini AI integration (server-side only, structured JSON, rate limits, quota fallback) | ✅ Code complete; needs API key |
| Dashboard, progress analytics, achievements, mistake notebook | ✅ Working |
| Certificates (issue + public verification) | ✅ Working |
| Admin dashboard (content, questions, config, AI usage) | ✅ Working |
| PWA (manifest, service worker, offline page, icons) | ✅ Built |
| Mobile app (Expo/React Native project, shared API client) | ✅ Source + build docs (no native artifact in this env) |
| Profile, data export, account deletion | ✅ Working |

## Quick start

```bash
cd bandquest-ielts
npm install
cp .env.example .env.local   # then set JWT_SECRET (and GEMINI_API_KEY for AI)
npm run db:seed              # create + populate the database
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

The **first registered user becomes admin** automatically.

## Environment variables

See `.env.example`. Key ones:

| Variable | Required | Purpose |
|---|---|---|
| `JWT_SECRET` | Yes (production) | Session signing. Generate: `openssl rand -base64 32` |
| `GEMINI_API_KEY` | For AI features | Google AI Studio key. Without it, writing falls back to rule-based feedback and speaking returns an honest "not configured" notice |
| `GEMINI_TEXT_MODEL` / `GEMINI_AUDIO_MODEL` | No | Defaults: `gemini-3.8-flash`. Change centrally, no code edits |
| `DATABASE_URL` | No | Defaults to `./data/bandquest.db` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Google sign-in | Google Cloud OAuth client. Without them, the Google button stays hidden and email+password works |
| `PUBLIC_APP_URL` | For Google sign-in | Must match the OAuth redirect URI `<PUBLIC_APP_URL>/api/auth/google/callback` |

## Guest mode & sign-in options

- **Try without signing up:** visitors can read lessons, run checkpoints, and use vocabulary SRS immediately — no account needed. A lightweight guest account is created automatically and **all history (attempts, XP, streaks, achievements) is stored server-side**, same as registered users.
- **Guests can't use:** AI writing feedback, AI speaking examiner, mock tests, certificates, study-plan generator — these show a friendly "create a free account" nudge. (AI costs quota; mocks/certificates are personal credentials.)
- **Signing up keeps everything:** email signup, Google sign-in, or signing into an existing account converts/merges the guest account — no progress is lost. Guest data lives in the browser's session cookie; a different device starts a fresh guest.
- **Google sign-in setup (admin, ~5 min):** create an OAuth client ID at Google Cloud Console → authorized redirect URI `<PUBLIC_APP_URL>/api/auth/google/callback` → set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` → restart. Verified Google emails link to existing accounts with the same email automatically.

## Testing

```bash
npm test          # 25 tests: scoring, auth, guest accounts, Google upsert, 70% progression, anti-repeat, SRS, seed integrity
npm run typecheck # TypeScript
npm run build     # production build
```

Manual flows verified: register → lesson → checkpoint (pass 70% unlocks next; fail gives remediation + varied retry) → vocab SRS → mock test with band report.

## API overview

- `POST /api/auth/register|login|logout`, `GET /api/auth/me`
- `GET /api/courses`, `GET /api/episodes/[id]`
- `POST /api/attempts/start`, `GET /api/attempts/[id]`, `POST /api/attempts/[id]/submit`
- `GET /api/vocab/due`, `POST /api/vocab/review`
- `POST /api/ai/writing`, `POST /api/ai/speaking` (server-side Gemini)
- `GET|POST|PUT /api/mock` (list, start, submit)
- `GET /api/dashboard`, `/api/revision`, `/api/achievements`, `/api/grammar/mastery`
- `GET|POST /api/certificates`, `GET /api/certificates/verify/[code]`
- `GET|POST /api/admin?tab=overview|episodes|questions|config` (admin only)
- `GET|PUT|DELETE /api/profile`, `GET /api/profile/export`

## AI design notes

- All Gemini calls are **server-side**; the key never reaches the browser.
- Structured JSON outputs are **validated server-side**; malformed output → graceful error, never silent success.
- Per-user **daily rate limits**, usage logging, token tracking, model name configurable via env/system config.
- **Quota exhaustion** → honest notice + rule-based fallback; work is never lost.
- Every AI assessment records model name + rubric version (`ielts-public-v1`).
- AI scores are always labelled **educational estimates**, never official scores.

## Deployment

Any Node 22+ host works (Vercel, Railway, Fly.io, VPS). Two database modes:

- **Local SQLite** (default): zero-config, file at `data/bandquest.db`. Fine for
  VPS/Docker with a persistent volume.
- **Turso** (set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`): free hosted SQLite
  (no credit card, turso.tech). **Required on hosts with ephemeral disks**
  (Render/Railway free tiers wipe local files on every restart — a local
  SQLite file would lose all user accounts there). Same SQLite dialect; the app
  picks Turso automatically when the vars are set.

**Free deploy (Render + Turso, no credit card):**
1. Turso: sign up at turso.tech → `turso db create bandquest` →
   `turso db tokens create bandquest`. Note the `libsql://...` URL and token.
2. Render: sign up → New → Web Service → point at this repo (Dockerfile).
   - Environment: `JWT_SECRET` (generate: `openssl rand -base64 32`),
     `GEMINI_API_KEY`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
     `PUBLIC_APP_URL=https://<your-app>.onrender.com`
   - No disk needed (Turso holds the data).
3. Deploy — the container seeds curriculum on first start (idempotent).
   Free services sleep after 15 min idle (~1 min cold start on wake).

**Docker (recommended — Railway / Render / Fly.io / any VPS):**
```bash
docker build -t bandquest-ielts .
docker run -d -p 3000:3000 \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  -e GEMINI_API_KEY="<your key>" \
  -e PUBLIC_APP_URL="https://your-domain.com" \
  -v bandquest-data:/app/data \
  --name bandquest bandquest-ielts
```
The `/app/data` volume keeps the SQLite database (users, progress) across restarts — don't skip it. The container seeds curriculum on start (idempotent). (Or skip the volume and use Turso vars instead.)

**Plain Node:**
1. Set env vars (`JWT_SECRET`, `GEMINI_API_KEY`, `DATABASE_URL`, `PUBLIC_APP_URL`, optionally `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`).
2. `npm install && npm run db:migrate && npm run db:seed && npm run build && npm start`.
3. For persistent data on ephemeral hosts, set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (free Turso database) instead of a local file.

## Mobile

See `mobile/README.md`. Expo project with a shared API client (`mobile/src/api.ts`).
Build with EAS: `eas build -p android --profile preview` (APK) / `-p ios` (needs Apple Developer account).
No native artifact is produced in this environment (no Android SDK/Xcode) — source and exact commands are provided.

## Limitations & honest notes

- **Gemini AI** needs a real API key; without it, writing uses a transparent rule-based check and speaking is unavailable (with a clear message, not a fake score).
- **Listening audio** uses original scripts + browser TTS; studio recordings can be uploaded via admin later.
- **Question bank** (77) is real but small — retries vary via anti-repeat selection, but expanding the bank is the top content priority.
- **Mobile** is source + docs, not a signed build (no native toolchain here).
- Practice materials are **original BandQuest content**, not official IELTS papers. Band estimates are **approximate and educational only**.
