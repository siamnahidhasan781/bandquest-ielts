import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import {
  googleAuthConfigured,
  appBaseUrl,
  upsertGoogleUser,
  convertGuestToRegistered,
  mergeGuestIntoUser,
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { currentUser } from "@/lib/api";
import { migrate, getDb } from "@/lib/db";

/**
 * Google OAuth callback: verify state, exchange the code, verify the ID token,
 * then sign the user in (linking to an existing account when the verified
 * email already has one). A guest trial account in the same browser is
 * converted in place so all guest progress is kept.
 */
export async function GET(req: NextRequest) {
  await migrate();
  const fail = (message: string) =>
    NextResponse.redirect(
      `${appBaseUrl()}/signin?error=${encodeURIComponent(message)}`
    );

  if (!googleAuthConfigured()) return fail("Google sign-in is not configured.");

  const params = req.nextUrl.searchParams;
  if (params.get("error")) return fail("Google sign-in was cancelled.");
  const code = params.get("code");
  const state = params.get("state");
  const stateCookie = req.cookies.get("bq_oauth_state")?.value;
  if (!code || !state || !stateCookie || state !== stateCookie) {
    return fail("Sign-in verification failed. Please try again.");
  }

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appBaseUrl()}/api/auth/google/callback`
    );
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) return fail("Google did not return an identity token.");
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = payload?.email;
    if (!googleId || !email || !payload?.email_verified) {
      return fail("Google did not verify your email address.");
    }
    const name =
      payload.name || email.split("@")[0] || "Learner";

    // Guest in this browser? Convert in place — history is preserved.
    const viewer = await currentUser(req);
    let userId: string;
    if (viewer?.isGuest) {
      try {
        const converted = await convertGuestToRegistered(viewer.id, {
          email,
          googleId,
          displayName: name,
        });
        userId = converted.id;
      } catch (e) {
        if (e instanceof Error && e.message.includes("already exists")) {
          // That email already has a real account: merge guest history into
          // it, then link the Google identity.
          const { user } = await upsertGoogleUser({ googleId, email, name });
          await mergeGuestIntoUser(viewer.id, user.id);
          userId = user.id;
        } else {
          throw e;
        }
      }
    } else {
      const { user } = await upsertGoogleUser({ googleId, email, name });
      userId = user.id;
    }
    // Safety: never leave a guest row behind for this Google identity.
    const db = getDb();
    await db.prepare("DELETE FROM users WHERE google_id = ? AND is_guest = 1 AND id != ?").run(
      googleId,
      userId
    );

    const token = await createSession(userId);
    const next = req.cookies.get("bq_oauth_next")?.value;
    const res = NextResponse.redirect(
      `${appBaseUrl()}${next && next.startsWith("/") ? next : "/dashboard"}`
    );
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    res.cookies.delete("bq_oauth_state");
    res.cookies.delete("bq_oauth_next");
    return res;
  } catch (e) {
    console.error("Google OAuth callback failed:", e);
    return fail("Google sign-in failed. Please try again.");
  }
}
