import { NextRequest } from "next/server";
import { json, handler, ensureViewer } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const db = getDb();
  const concepts = await db
    .prepare("SELECT concept, mastery, attempts FROM grammar_mastery WHERE user_id = ? ORDER BY mastery ASC")
    .all(user.id);
  return json({ concepts });
});
