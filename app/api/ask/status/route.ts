import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const openaiConfigured = Boolean(process.env.GROQ_API_KEY?.trim());
  return NextResponse.json({ openaiConfigured });
}
