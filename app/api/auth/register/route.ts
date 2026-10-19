import { NextRequest } from "next/server";
import { z } from "zod";
import {
  registerUser,
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  convertGuestToRegistered,
  hashPassword,
  wantsMobileToken,
} from "@/lib/auth";
import { json, err, handler, currentUser } from "@/lib/api";
import { migrate } from "@/lib/db";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  displayName: z.string().min(2, "Enter your name.").max(60),
});

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  try {
    // A guest trial account in this browser is converted in place so all
    // guest progress (attempts, XP, streaks) carries over automatically.
    const viewer = await currentUser(req);
    const user =
      viewer?.isGuest
        ? await convertGuestToRegistered(viewer.id, {
            email: parsed.data.email,
            passwordHash: await hashPassword(parsed.data.password),
            displayName: parsed.data.displayName,
          })
        : await registerUser(
            parsed.data.email,
            parsed.data.password,
            parsed.data.displayName
          );
    const token = await createSession(user.id);
    const res = json(wantsMobileToken(req) ? { user, token } : { user });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    return err(e instanceof Error ? e.message : "Registration failed.", 400);
  }
});
