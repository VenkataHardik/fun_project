/**
 * Shared types for API request/response payloads.
 * Use in route handlers and frontend fetch/parsing to keep contracts in sync.
 */

export type PetResponse = {
  hunger: number;
  cleanliness: number;
  mood: string;
  lastFedAt: string | null;
  lastBathAt: string | null;
  petName: string | null;
};

export type AskResponse = {
  reply: string;
  source: "openai" | "scripted";
};

export type AskErrorResponse = {
  error: string;
  retryAfter?: number;
};

export type ProfileResponse = {
  displayName: string | null;
  birthday: string | null;
};
