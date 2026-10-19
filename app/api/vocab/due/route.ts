import { NextRequest } from "next/server";
import { json, handler, ensureViewer } from "@/lib/api";
import { migrate } from "@/lib/db";
import { getDueCards } from "@/lib/srs";

export const GET = handler(async (req: NextRequest) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const limit = Math.min(50, Math.max(1, parseInt(new URL(req.url).searchParams.get("limit") || "20", 10)));
  const cards = await getDueCards(user.id, limit);
  // Hide definitions until the user flips the card
  const publicCards = cards.map((c) => ({
    vocab_id: c.vocab_id,
    word: c.word,
    pos: c.pos,
    topic: c.topic,
    repetitions: c.repetitions,
  }));
  return json({ cards: publicCards, total: publicCards.length });
});
