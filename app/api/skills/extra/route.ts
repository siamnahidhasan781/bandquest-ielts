import { NextRequest } from "next/server";
import { json, handler } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const episodeId = new URL(req.url).searchParams.get("episodeId");
  if (!episodeId) return json({ passage: null, audio_script: null });
  const db = getDb();
  const row = await db
    .prepare("SELECT value FROM system_config WHERE key = ?")
    .get(`skill_extra:${episodeId}`) as { value: string } | undefined;
  if (!row) return json({ passage: null, audio_script: null });
  return json(JSON.parse(row.value));
});
