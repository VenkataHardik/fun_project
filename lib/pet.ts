const HOUR_MS = 60 * 60 * 1000;
const HUNGER_DECAY_PER_HOUR = 2;
const CLEANLINESS_DECAY_PER_HOUR = 1.5;
const MAX_STAT = 100;
const MIN_STAT = 0;

export function computeDecayedStats(
  hunger: number,
  cleanliness: number,
  lastFedAt: Date | null,
  lastBathAt: Date | null,
  now: Date = new Date()
): { hunger: number; cleanliness: number; mood: string } {
  let h = hunger;
  let c = cleanliness;
  if (lastFedAt) {
    const hoursSinceFed = (now.getTime() - lastFedAt.getTime()) / HOUR_MS;
    h = Math.min(MAX_STAT, hunger + hoursSinceFed * HUNGER_DECAY_PER_HOUR);
  }
  if (lastBathAt) {
    const hoursSinceBath = (now.getTime() - lastBathAt.getTime()) / HOUR_MS;
    c = Math.max(MIN_STAT, cleanliness - hoursSinceBath * CLEANLINESS_DECAY_PER_HOUR);
  }
  h = Math.max(MIN_STAT, Math.min(MAX_STAT, h));
  c = Math.max(MIN_STAT, Math.min(MAX_STAT, c));
  const mood = h > 70 || c < 30 ? "sad" : h > 50 || c < 50 ? "ok" : "happy";
  return { hunger: Math.round(h), cleanliness: Math.round(c), mood };
}

export const FEED_AMOUNT = 25;
export const BATH_AMOUNT = 30;
