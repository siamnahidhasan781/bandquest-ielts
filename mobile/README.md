# BandQuest IELTS — Mobile App

Full Expo (React Native) app sharing the same backend API as the web app. All
learning logic lives server-side; the app is a native client for the `/api/*`
contracts.

## What's implemented

- **Auth**: email sign-in/sign-up, Google sign-in (expo-auth-session → server-verified
  ID token), guest trial mode. Session token in `expo-secure-store`.
- **Home**: dashboard (XP, streak, continue-learning, weak concepts).
- **Learn**: courses → episodes → lesson reader (Markdown) → checkpoint quiz
  (mcq / true-false-not-given / fill-blank) → server-graded results with stars,
  XP, remediation and unlocks.
- **Vocabulary**: SRS flashcards with flip + Again/Hard/Good/Easy grading.
- **Grammar**: per-concept mastery bars + overall mastery.
- **Skills**: Listening/Reading academies (via Learn), **Writing** (prompts +
  AI band feedback), **Speaking** (mic recording via `expo-av` → AI examiner
  feedback, with text fallback).
- **Mock Tests**: list → timed sections → submit → estimated band report.
- **More**: progress analytics, achievements, certificates (view + issue),
  profile & settings (target band, minutes/day, test type), sign out.
- Guest banner + signup nudges: AI/mock/certificate features require a free
  account, same rule as web.

## Prerequisites

- Node 22+
- A running BandQuest backend (URL goes in `expo.extra.apiUrl`)
- For builds: free Expo account (`eas-cli`), no local Android SDK/Xcode needed —
  EAS Build compiles in the cloud.

## Setup

```bash
cd mobile
npm install
```

Edit `package.json` → `expo.extra`:
- `apiUrl`: your deployed backend, e.g. `https://ielts.yourdomain.com`
  (use `http://<your-lan-ip>:3000` for testing on a real phone via Expo Go —
  `localhost` won't resolve from the phone)
- `googleClientId`: your Google **Web** OAuth client ID (same one as the web
  app) to enable the in-app Google button. Leave empty to hide it.

## Run (development)

```bash
npx expo start
# scan the QR with Expo Go (Android/iOS), or press 'a' / 'i' for emulators
```

## Build installable apps (EAS — cloud build)

```bash
npm install -g eas-cli
eas login                       # your Expo account
eas build:configure             # one-time, creates the project link

# Android APK you can install directly:
eas build --platform android --profile preview

# Production Android (APK, see eas.json):
eas build --platform android --profile production

# iOS (needs an Apple Developer account for signing):
eas build --platform ios --profile preview
```

APKs install directly on Android (`preview` profile builds an APK).
For Play Store, switch `eas.json` production `buildType` to `app-bundle`
and run `eas submit -p android`.

### Google sign-in in production builds

`expo-auth-session` uses Expo's proxy in development. For standalone builds,
create **Android** and **iOS** OAuth client IDs in Google Cloud Console and add
them as `androidClientId` / `iosClientId` in the `Google.useAuthRequest` call
(`src/screens/auth.tsx`). The backend verifies the ID token server-side, so
no secret ever ships in the app.

## Project layout

```
App.tsx                 navigation root (auth stack + bottom tabs)
src/api.ts              typed client for every /api/* endpoint
src/auth.tsx            AuthContext (SecureStore token, login/register/guest/google/logout)
src/theme.ts            colors + shared styles
src/screens/auth.tsx    Welcome / Sign in / Sign up (+ Google button)
src/screens/home.tsx    dashboard
src/screens/learn.tsx   courses → episodes → lesson → checkpoint
src/screens/vocab.tsx   SRS flashcards
src/screens/grammar.tsx mastery bars
src/screens/skills.tsx  hub + Writing feedback + Speaking recorder
src/screens/mock.tsx    mock test centre
src/screens/more.tsx    progress, achievements, certificates, profile
assets/                 icon, adaptive icon, splash
eas.json                build profiles
```

## Honest notes

- No APK/IPA is produced in this Linux dev environment (no Android SDK, Java
  toolchains or Xcode here) — run the EAS commands above from any machine with
  Node; the cloud does the native compile.
- The app talks to **your** backend deployment — deploy the web app first and
  point `apiUrl` at it, otherwise sign-in and syncing won't work.
- Push-notification study reminders (`expo-notifications`) are the one planned
  feature not yet wired — the backend has no push endpoint yet.
