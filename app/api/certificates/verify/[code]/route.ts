import { NextRequest } from "next/server";
import { json, err, handler } from "@/lib/api";
import { getDb, migrate } from "@/lib/db";

export const GET = handler(async (req: NextRequest, { params }: { params: Record<string, string> }) => {
  await migrate();
  const db = getDb();
  const cert = await db.prepare(
    `SELECT cert.display_name, cert.issued_at, cert.verify_code, cert.criteria_json, c.title as course_title
     FROM certificates cert JOIN courses c ON c.id = cert.course_id
     WHERE cert.verify_code = ?`
  ).get(params.code) as
    | { display_name: string; issued_at: string; verify_code: string; criteria_json: string; course_title: string }
    | undefined;
  if (!cert) return err("Certificate not found. Check the code and try again.", 404);
  return json({
    valid: true,
    display_name: cert.display_name,
    course_title: cert.course_title,
    issued_at: cert.issued_at,
    verify_code: cert.verify_code,
    criteria: JSON.parse(cert.criteria_json || "{}"),
    note: "This is a BandQuest course-completion certificate, not an official IELTS certificate or Test Report Form.",
  });
});
