import { NextRequest } from "next/server";
import { createGuestUser, createSession } from "@/lib/auth";
import { json, handler } from "@/lib/api";
import { migrate } from "@/lib/db";

/**
 * Mobile guest entry point. The web auto-provisions guests via cookies, but
 * React Native cannot reliably read Set-Cookie, so this endpoint returns the
 * raw session token in JSON for the app to keep in secure storage.
 */
export const POST = handler(async (_req: NextRequest) => {
  await migrate();
  const guest = await createGuestUser();
  const token = await createSession(guest.id);
  return json({ user: guest, token });
});
