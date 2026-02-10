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

const MODELS = ["gpt-4o-mini", "gpt-3.5-turbo"] as const;

export async function getOpenAIReply(
  question: string,
  context: PenguinContext
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || !question) return null;

  const systemPrompt = buildSystemPrompt(context);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12_000);

  for (const model of MODELS) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
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
        console.error("OpenAI API error:", res.status, raw);
        continue;
      }

      let data: { choices?: Array<{ message?: { content?: string } }> };
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        console.error("OpenAI invalid JSON:", raw.slice(0, 200));
        continue;
      }

      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch (err) {
      console.error("OpenAI request failed:", err);
    }
  }
  clearTimeout(timeoutId);
  return null;
}
