import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeDecayedStats, FEED_AMOUNT } from "@/lib/pet";

export async function POST() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pet = await prisma.pet.findUnique({
    where: { userId: session.userId },
  });
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }
  const now = new Date();
  const { hunger } = computeDecayedStats(
    pet.hunger,
    pet.cleanliness,
    pet.lastFedAt,
    pet.lastBathAt,
    now
  );
  const newHunger = Math.max(0, hunger - FEED_AMOUNT);
  await prisma.pet.update({
    where: { userId: session.userId },
    data: { hunger: newHunger, lastFedAt: now },
  });
  return NextResponse.json({
    ok: true,
    hunger: newHunger,
    message: "Yum! Thanks for the fish!",
  });
}
