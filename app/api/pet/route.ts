import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeDecayedStats } from "@/lib/pet";
import type { PetResponse } from "@/lib/api-types";

export async function GET() {
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
  const { hunger, cleanliness, mood } = computeDecayedStats(
    pet.hunger,
    pet.cleanliness,
    pet.lastFedAt,
    pet.lastBathAt,
    now
  );
  const response: PetResponse = {
    hunger,
    cleanliness,
    mood,
    lastFedAt: pet.lastFedAt?.toISOString() ?? null,
    lastBathAt: pet.lastBathAt?.toISOString() ?? null,
    petName: pet.petName,
  };
  return NextResponse.json(response);
}

export async function PATCH(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reqBody = await request.json().catch(() => ({}));
  const petName =
    reqBody.petName === null || reqBody.petName === ""
      ? null
      : typeof reqBody.petName === "string"
        ? reqBody.petName.trim().slice(0, 50) || null
        : undefined;

  if (petName === undefined) {
    return NextResponse.json({ error: "petName must be a string or null" }, { status: 400 });
  }

  const pet = await prisma.pet.findUnique({
    where: { userId: session.userId },
  });
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const updated = await prisma.pet.update({
    where: { userId: session.userId },
    data: { petName },
  });

  const now = new Date();
  const { hunger, cleanliness, mood } = computeDecayedStats(
    updated.hunger,
    updated.cleanliness,
    updated.lastFedAt,
    updated.lastBathAt,
    now
  );

  const response: PetResponse = {
    hunger,
    cleanliness,
    mood,
    lastFedAt: updated.lastFedAt?.toISOString() ?? null,
    lastBathAt: updated.lastBathAt?.toISOString() ?? null,
    petName: updated.petName,
  };
  return NextResponse.json(response);
}
