import { NextRequest } from "next/server";
import { z } from "zod";
import {
  loginUser,
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  mergeGuestIntoUser,
  wantsMobileToken,
} from "@/lib/auth";
import { json, err, handler, currentUser } from "@/lib/api";
import { migrate } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Enter a valid email and password.", 400);

  try {
    const user = await loginUser(parsed.data.email, parsed.data.password);
    // If this browser holds a guest trial account, merge its history into
    // the account being signed into, then continue as that account.
    const viewer = await currentUser(req);
    if (viewer?.isGuest) await mergeGuestIntoUser(viewer.id, user.id);
    const token = await createSession(user.id);
    const res = json(wantsMobileToken(req) ? { user, token } : { user });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    return err(e instanceof Error ? e.message : "Sign in failed.", 401);
  }
});
