import { NextRequest } from "next/server";
import { json, handler } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const db = getDb();
  const sources = await db.prepare("SELECT title, url, category, skill FROM content_sources ORDER BY category, title").all();
  return json({ sources });
});
