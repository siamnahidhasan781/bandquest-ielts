/** Shared helpers for Next.js App Router API routes. */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE, sessionCookieOptions, AuthUser, createGuestUser, createSession } from "@/lib/auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function currentUser(
  req?: NextRequest
): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token =
    req?.cookies.get(SESSION_COOKIE)?.value ??
    cookieStore.get(SESSION_COOKIE)?.value;
  return getSessionUser(token);
}

export async function requireUser(req?: NextRequest): Promise<AuthUser> {
  const user = await currentUser(req);
  if (!user) throw new Response(JSON.stringify({ error: "Sign in required." }), { status: 401 });
  return user;
}

/**
 * Viewer = signed-in user OR guest. Guests are auto-provisioned a lightweight
 * trial account on first use so their learning history is stored server-side.
 * When a guest is created, the session cookie is set on the outgoing response
 * directly (works inside Route Handlers), so callers need no extra plumbing.
 */
export async function ensureViewer(
  req?: NextRequest
): Promise<{ user: AuthUser }> {
  const existing = await currentUser(req);
  if (existing) return { user: existing };
  const guest = await createGuestUser();
  const token = await createSession(guest.id);
  cookies().set(SESSION_COOKIE, token, sessionCookieOptions());
  return { user: guest };
}

/**
 * Registered (non-guest) users only. Guests get a 403 with code
 * "signup_required" so the UI can show a friendly upgrade nudge instead of
 * a dead-end error. Used for AI features, mock tests and certificates.
 */
export async function requireRegistered(req?: NextRequest): Promise<AuthUser> {
  const user = await currentUser(req);
  if (!user) throw new Response(JSON.stringify({ error: "Sign in required." }), { status: 401 });
  if (user.isGuest) {
    throw new Response(
      JSON.stringify({
        error: "Create a free account to use this feature — your guest progress will carry over.",
        code: "signup_required",
      }),
      { status: 403 }
    );
  }
  return user;
}

export async function requireAdmin(req?: NextRequest): Promise<AuthUser> {
  const user = await requireUser(req);
  if (user.role !== "admin")
    throw new Response(JSON.stringify({ error: "Admin only." }), { status: 403 });
  return user;
}

/** Wrap a handler to convert thrown Responses into NextResponses. */
export function handler(
  fn: (req: NextRequest, ctx: { params: Record<string, string> }) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: { params: Record<string, string> }) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof Response) return e as unknown as NextResponse;
      console.error("API error:", e);
      return err("Something went wrong. Please try again.", 500);
    }
  };
}
