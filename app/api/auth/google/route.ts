import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { googleAuthConfigured, appBaseUrl } from "@/lib/auth";

/**
 * Begin Google sign-in: redirect to Google's consent screen.
 * The verified profile is handled at /api/auth/google/callback.
 */
export async function GET(req: NextRequest) {
  if (!googleAuthConfigured()) {
    return NextResponse.json(
      { error: "Google sign-in is not configured yet. The site admin needs to add Google OAuth credentials." },
      { status: 503 }
    );
  }
  const state = randomUUID();
  const redirectUri = `${appBaseUrl()}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
  res.cookies.set("bq_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });
  // Remember where to send the user after sign-in (default dashboard).
  const next = req.nextUrl.searchParams.get("next");
  if (next && next.startsWith("/")) {
    res.cookies.set("bq_oauth_next", next, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  }
  return res;
}
