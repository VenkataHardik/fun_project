const DAILY_MESSAGES = [
  "You're doing great today!",
  "I'm so glad you're here.",
  "Sending you a little penguin hug!",
  "You make every day brighter.",
  "Hope today is full of good things.",
  "I believe in you!",
  "Take a moment to be proud of yourself.",
  "You're one of a kind!",
  "Thanks for taking care of me.",
  "Have a wonderful day!",
  "You deserve something nice today.",
  "I'm rooting for you!",
  "Little steps still count.",
  "You're enough, just as you are.",
  "Today is a fresh start.",
];

function isSameDayUTC(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export type ProfileWithDaily = {
  id: string;
  userId: string;
  displayName: string | null;
  birthday: Date | null;
  lastDailyMessageAt: Date | null;
  dailyMessage: string | null;
};

export function getMessageToShow(
  profile: ProfileWithDaily,
  now: Date = new Date()
): string | null {
  const lastAt = profile.lastDailyMessageAt;
  if (profile.dailyMessage && lastAt && isSameDayUTC(new Date(lastAt), now)) {
    return profile.dailyMessage;
  }
  return null;
}

export function shouldRefreshDailyMessage(
  profile: ProfileWithDaily,
  now: Date = new Date()
): boolean {
  if (!profile.lastDailyMessageAt) return true;
  return !isSameDayUTC(new Date(profile.lastDailyMessageAt), now);
}

export function pickDailyMessage(): string {
  return pickRandom(DAILY_MESSAGES);
}
