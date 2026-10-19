import { NextRequest } from "next/server";
import { z } from "zod";
import { json, err, handler, ensureViewer } from "@/lib/api";
import { migrate } from "@/lib/db";
import { gradeAttempt } from "@/lib/engine";

const schema = z.object({
  responses: z.record(z.string(), z.unknown()),
});

export const POST = handler(async (req: NextRequest, { params }: { params: Record<string, string> }) => {
  await migrate();
  const { user } = await ensureViewer(req);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Invalid submission.", 400);

  try {
    const result = await gradeAttempt(user.id, params.id, parsed.data.responses);
    return json(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Could not grade attempt.", 400);
  }
});
