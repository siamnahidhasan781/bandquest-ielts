import { NextRequest } from "next/server";
import { z } from "zod";
import { json, err, handler, ensureViewer } from "@/lib/api";
import { migrate } from "@/lib/db";
import { startAttempt } from "@/lib/engine";

const schema = z.object({
  episodeId: z.string().min(1),
  kind: z.enum(["checkpoint", "practice", "diagnostic"]).default("checkpoint"),
});

export const POST = handler(async (req: NextRequest) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Invalid request.", 400);

  try {
    const result = await startAttempt(user.id, parsed.data.episodeId, parsed.data.kind);
    return json(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Could not start attempt.", 400);
  }
});
