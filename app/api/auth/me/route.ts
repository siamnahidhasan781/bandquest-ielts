import { NextRequest } from "next/server";
import { json, handler, currentUser } from "@/lib/api";
import { migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const user = await currentUser(req);
  return json({ user });
});
