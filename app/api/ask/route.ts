import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getScriptedReply } from "@/lib/scriptedReplies";
import { getGroqReply } from "@/lib/groq";
import type { AskResponse, AskErrorResponse } from "@/lib/api-types";

const MAX_QUESTION_LENGTH = 500;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(userId: string): { ok: boolean; retryAfter?: number } {
  const limit = Math.max(0, parseInt(process.env.ASK_RATE_LIMIT_PER_MINUTE ?? "30", 10));
  if (limit === 0) return { ok: true };

  const now = Date.now();
  let entry = rateLimitMap.get(userId);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateLimitMap.set(userId, entry);
  }
  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rate = checkRateLimit(session.userId);
    if (!rate.ok) {
      const errBody: AskErrorResponse = {
        error: "Too many requests. Please slow down.",
        retryAfter: rate.retryAfter,
      };
      return NextResponse.json(
        errBody,
        { status: 429, headers: rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : undefined }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawQuestion = typeof body.question === "string" ? body.question.trim() : "";
    const question = rawQuestion.slice(0, MAX_QUESTION_LENGTH);
    if (rawQuestion.length > MAX_QUESTION_LENGTH) {
      const errBody: AskErrorResponse = {
        error: `Message is too long (max ${MAX_QUESTION_LENGTH} characters).`,
      };
      return NextResponse.json(errBody, { status: 400 });
    }
    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });
    const birthday = profile?.birthday ?? null;
    const today = new Date();
    const isBirthdayToday =
      !!birthday &&
      today.getUTCMonth() === birthday.getUTCMonth() &&
      today.getUTCDate() === birthday.getUTCDate();

    const context = {
      displayName: profile?.displayName ?? "friend",
      birthdayFormatted: birthday ? birthday.toISOString().slice(0, 10) : null,
      isBirthdayToday,
    };

    const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());
    if (hasGroq && question) {
      try {
        const aiReply = await getGroqReply(question, context);
        if (aiReply?.trim()) {
          const response: AskResponse = { reply: aiReply.trim(), source: "openai" };
          return NextResponse.json(response);
        }
      } catch (err) {
        console.error("Ask API Groq error:", err);
      }
    }

    const reply = getScriptedReply(question, context);
    const response: AskResponse = {
      reply: reply || "I'm here! Try asking me something.",
      source: "scripted",
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Ask API error:", err);
    const fallback: AskResponse = {
      reply: "I'm here! Something went wrong on my side. Try again?",
      source: "scripted",
    };
    return NextResponse.json(fallback);
  }
}
