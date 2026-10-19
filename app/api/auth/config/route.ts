import { NextResponse } from "next/server";
import { googleAuthConfigured } from "@/lib/auth";

/** Tells the frontend whether the Google sign-in button should be shown. */
export async function GET() {
  return NextResponse.json({ googleEnabled: googleAuthConfigured() });
}
