/**
 * Groq API – free tier. Get a key at https://console.groq.com
 */

type PenguinContext = {
  displayName: string;
  birthdayFormatted: string | null;
  isBirthdayToday: boolean;
};

function buildSystemPrompt(ctx: PenguinContext): string {
  const name = ctx.displayName || "friend";
  const birthday = ctx.birthdayFormatted
    ? `Their birthday is ${ctx.birthdayFormatted}.`
    : "";
  const today = ctx.isBirthdayToday ? " Today is their birthday - be extra celebratory!" : "";
  return `You are a cute, friendly penguin digital pet. You are talking to ${name}. ${birthday}${today}
Keep replies short (1-2 sentences). Be warm, use their name sometimes, and stay in character as a penguin. Use simple language. No markdown or lists.`;
}

export async function getGroqReply(
  question: string,
  context: PenguinContext
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || !question) return null;

  const systemPrompt = buildSystemPrompt(context);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    clearTimeout(timeoutId);
    const raw = await res.text();
    if (!res.ok) {
      console.error("Groq API error:", res.status, raw.slice(0, 300));
      return null;
    }

    let data: { choices?: Array<{ message?: { content?: string } }> };
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("Groq API invalid JSON:", raw.slice(0, 200));
      return null;
    }
    const content = data.choices?.[0]?.message?.content;
    const trimmed = typeof content === "string" ? content.trim() : "";
    return trimmed || null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Groq request failed:", err);
    return null;
  }
}
