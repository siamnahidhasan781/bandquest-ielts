import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";
import { json, handler } from "@/lib/api";

export const POST = handler(async (req: NextRequest) => {
  const token =
    req.cookies.get(SESSION_COOKIE)?.value ??
    cookies().get(SESSION_COOKIE)?.value;
  await destroySession(token);
  const res = json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
});
