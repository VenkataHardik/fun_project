import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeDecayedStats, BATH_AMOUNT } from "@/lib/pet";

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
  const { cleanliness } = computeDecayedStats(
    pet.hunger,
    pet.cleanliness,
    pet.lastFedAt,
    pet.lastBathAt,
    now
  );
  const newCleanliness = Math.min(100, cleanliness + BATH_AMOUNT);
  await prisma.pet.update({
    where: { userId: session.userId },
    data: { cleanliness: newCleanliness, lastBathAt: now },
  });
  return NextResponse.json({
    ok: true,
    cleanliness: newCleanliness,
    message: "Splash! I feel so fresh!",
  });
}
