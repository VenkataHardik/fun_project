import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || password.length < 6) {
      return NextResponse.json(
        { error: "Invalid email or password (min 6 characters)" },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        passwordHash,
        profile: { create: {} },
        pet: {
          create: {
            hunger: 50,
            cleanliness: 50,
            mood: "happy",
          },
        },
      },
    });
    const token = await createToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
