import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeDecayedStats } from "@/lib/pet";
import {
  getMessageToShow,
  shouldRefreshDailyMessage,
  pickDailyMessage,
} from "@/lib/dailyMessage";
import Link from "next/link";
import PenguinDashboard from "@/components/PenguinDashboard";

export default async function DashboardPage() {
  const session = await getSessionFromCookie();
  if (!session) return null;
  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });
  const pet = await prisma.pet.findUnique({
    where: { userId: session.userId },
  });

  const envName = process.env.FRIEND_DISPLAY_NAME?.trim();
  const displayName = profile?.displayName ?? (envName || null);

  let birthday: Date | null = profile?.birthday ?? null;
  if (birthday === null && process.env.FRIEND_BIRTHDAY?.trim()) {
    const d = new Date(process.env.FRIEND_BIRTHDAY.trim());
    if (!isNaN(d.getTime())) birthday = d;
  }

  const now = new Date();
  const isBirthdayToday = birthday
    ? (() => {
        return (
          now.getUTCMonth() === birthday!.getUTCMonth() &&
          now.getUTCDate() === birthday!.getUTCDate()
        );
      })()
    : false;

  let daysUntilBirthday: number | null = null;
  if (birthday && !isBirthdayToday) {
    const next = new Date(now.getFullYear(), birthday.getUTCMonth(), birthday.getUTCDate());
    if (next.getTime() <= now.getTime())
      next.setFullYear(next.getFullYear() + 1);
    daysUntilBirthday = Math.ceil((next.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  }

  const hour = now.getHours();
  const timeGreeting =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 17
        ? "Good afternoon"
        : hour >= 17 && hour < 21
          ? "Good evening"
          : "Good night";

  const initialPet = pet
    ? (() => {
        const { hunger, cleanliness, mood } = computeDecayedStats(
          pet.hunger,
          pet.cleanliness,
          pet.lastFedAt,
          pet.lastBathAt,
          now
        );
        return {
          hunger,
          cleanliness,
          mood,
          lastFedAt: pet.lastFedAt?.toISOString() ?? null,
          lastBathAt: pet.lastBathAt?.toISOString() ?? null,
          petName: pet.petName ?? null,
        };
      })()
    : null;

  let dailyMessageToShow: string | null = null;
  if (profile) {
    if (shouldRefreshDailyMessage(profile, now)) {
      const newMsg = pickDailyMessage();
      await prisma.profile.update({
        where: { userId: session.userId },
        data: { lastDailyMessageAt: now, dailyMessage: newMsg },
      });
      dailyMessageToShow = newMsg;
    } else {
      dailyMessageToShow = getMessageToShow(profile, now);
    }
  }

  return (
    <div>
      {displayName ? (
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {timeGreeting}, {displayName}!
        </h1>
      ) : (
        <p className="text-gray-600 mb-2">
          <Link href="/profile" className="text-ice-500 font-medium hover:underline">
            Set your name
          </Link>{" "}
          so your penguin can call you by name.
        </p>
      )}
      {process.env.DEDICATION_MESSAGE?.trim() && (
        <p className="text-sm text-gray-500 mb-2 italic">
          {process.env.DEDICATION_MESSAGE.trim()}
        </p>
      )}
      {daysUntilBirthday !== null && daysUntilBirthday >= 1 && daysUntilBirthday <= 30 && (
        <p className="text-sm text-ice-600 mb-2 font-medium">
          {daysUntilBirthday === 1
            ? "Tomorrow is your birthday!"
            : `${daysUntilBirthday} days until your birthday!`}
        </p>
      )}
      {dailyMessageToShow && (
        <div className="mb-4 p-3 rounded-xl bg-ice-50 border border-ice-200">
          <p className="text-xs font-medium text-ice-600 mb-0.5">Message from your penguin</p>
          <p className="text-sm text-gray-700">&ldquo;{dailyMessageToShow}&rdquo;</p>
        </div>
      )}
      <PenguinDashboard
        pet={initialPet}
        displayName={displayName ?? ""}
        isBirthdayToday={isBirthdayToday}
        birthdayFormatted={birthday ? birthday.toISOString().slice(0, 10) : null}
      />
    </div>
  );
}
