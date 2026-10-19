import { NextRequest } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import {
  googleAuthConfigured,
  upsertGoogleUser,
  convertGuestToRegistered,
  mergeGuestIntoUser,
  createSession,
} from "@/lib/auth";
import { json, err, handler, currentUser } from "@/lib/api";
import { migrate, getDb } from "@/lib/db";

const schema = z.object({
  /** Google ID token obtained by the mobile app (expo-auth-session). */
  idToken: z.string().min(10),
});

/**
 * Mobile Google sign-in. The app performs the OAuth dance itself and sends
 * the ID token; we verify it server-side (never trust the client claim),
 * link or create the account, and return a session token in JSON.
 */
export const POST = handler(async (req: NextRequest) => {
  await migrate();
  if (!googleAuthConfigured()) {
    return err("Google sign-in is not configured on this server.", 503);
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Missing ID token.", 400);

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: parsed.data.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = payload?.email;
    if (!googleId || !email || !payload?.email_verified) {
      return err("Google did not verify this account.", 401);
    }
    const name = payload.name || email.split("@")[0] || "Learner";

    // Convert a mobile guest in place when one is attached to this request.
    const viewer = await currentUser(req);
    let userId: string;
    if (viewer?.isGuest) {
      try {
        userId = (await convertGuestToRegistered(viewer.id, { email, googleId, displayName: name })).id;
      } catch (e) {
        if (e instanceof Error && e.message.includes("already exists")) {
          const { user } = await upsertGoogleUser({ googleId, email, name });
          await mergeGuestIntoUser(viewer.id, user.id);
          userId = user.id;
        } else {
          throw e;
        }
      }
    } else {
      userId = (await upsertGoogleUser({ googleId, email, name })).user.id;
    }

    const token = await createSession(userId);
    const row = await getDb()
      .prepare("SELECT id, email, display_name, role, is_guest FROM users WHERE id = ?")
      .get(userId) as {
      id: string;
      email: string;
      display_name: string;
      role: string;
      is_guest: number;
    };
    return json({
      user: {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        isGuest: row.is_guest === 1,
      },
      token,
    });
  } catch (e) {
    console.error("Mobile Google sign-in failed:", e);
    return err("Google sign-in failed. Please try again.", 401);
  }
});
