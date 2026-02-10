import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ProfileResponse } from "@/lib/api-types";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const envName = process.env.FRIEND_DISPLAY_NAME?.trim();
  const displayName = profile.displayName ?? (envName || null);

  let birthday: string | null = profile.birthday?.toISOString().slice(0, 10) ?? null;
  if (birthday === null && process.env.FRIEND_BIRTHDAY?.trim()) {
    const envDate = process.env.FRIEND_BIRTHDAY.trim();
    const d = new Date(envDate);
    if (!isNaN(d.getTime())) birthday = d.toISOString().slice(0, 10);
  }

  const response: ProfileResponse = {
    displayName: displayName || null,
    birthday,
  };
  return NextResponse.json(response);
}

export async function PATCH(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reqBody = await request.json().catch(() => ({}));
  const displayName = typeof reqBody.displayName === "string" ? reqBody.displayName.trim() || null : undefined;
  let birthday: Date | null | undefined;
  if (reqBody.birthday === null) {
    birthday = null;
  } else if (typeof reqBody.birthday === "string") {
    const d = new Date(reqBody.birthday);
    if (!isNaN(d.getTime())) birthday = d;
    else birthday = undefined;
  } else {
    birthday = undefined;
  }

  const data: { displayName?: string | null; birthday?: Date | null } = {};
  if (displayName !== undefined) data.displayName = displayName;
  if (birthday !== undefined) data.birthday = birthday;

  const profile = await prisma.profile.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, ...data },
    update: data,
  });
  const body: ProfileResponse = {
    displayName: profile.displayName,
    birthday: profile.birthday?.toISOString().slice(0, 10) ?? null,
  };
  return NextResponse.json(body);
}
