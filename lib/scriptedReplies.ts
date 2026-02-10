export type ReplyContext = {
  displayName: string;
  birthdayFormatted: string | null;
  isBirthdayToday: boolean;
};

const defaultReply =
  "That's a nice question! I'm just a little penguin but I'm happy you're here, {displayName}!";

const rules: { patterns: string[]; response: string }[] = [
  {
    patterns: ["birthday", "when is my birthday", "my birthday", "remember my birthday"],
    response: "I remember! Your birthday is {birthday}. I'll never forget!",
  },
  {
    patterns: ["love", "do you love me", "love me", "you love"],
    response: "I love you so much, {displayName}! You're my favourite person.",
  },
  {
    patterns: ["name", "what's my name", "what is my name", "my name", "call me"],
    response: "Your name is {displayName}. I love saying it!",
  },
  {
    patterns: ["hello", "hi", "hey", "good morning", "good evening", "good night"],
    response: "Hi {displayName}! So nice to see you!",
  },
  {
    patterns: ["how are you", "how are u", "are you ok", "you ok"],
    response: "I'm doing great when you're here, {displayName}!",
  },
  {
    patterns: ["happy", "you happy", "are you happy"],
    response: "I'm so happy when you're here, {displayName}!",
  },
  {
    patterns: ["sad", "you sad", "are you sad"],
    response: "A little penguin hug from me to you, {displayName}. I'm here for you!",
  },
  {
    patterns: ["thank", "thanks", "thank you"],
    response: "You're welcome! You're the best, {displayName}!",
  },
  {
    patterns: ["friend", "best friend", "you're my friend"],
    response: "You're my best friend too, {displayName}!",
  },
  {
    patterns: ["hungry", "feed", "eating", "food"],
    response: "I could use a little fish if you have some! *waddles hopefully*",
  },
  {
    patterns: ["bath", "clean", "wash", "dirty"],
    response: "A bath sounds lovely! I love splashing in the water!",
  },
  {
    patterns: ["cute", "adorable", "sweet", "you're cute"],
    response: "Aww thank you, {displayName}! You're pretty cute yourself!",
  },
  {
    patterns: ["miss", "missed you", "i missed you"],
    response: "I missed you too, {displayName}! Don't stay away too long!",
  },
  {
    patterns: ["goodbye", "bye", "see you", "later"],
    response: "Bye bye, {displayName}! Come back soon!",
  },
  {
    patterns: ["weather", "cold", "snow", "ice"],
    response: "I love the cold! It reminds me of home. Do you like snow, {displayName}?",
  },
  {
    patterns: ["penguin", "what are you", "who are you"],
    response: "I'm your penguin pal! I'm here to keep you company, {displayName}!",
  },
  {
    patterns: ["help", "what can you do"],
    response: "You can feed me, give me a bath, and ask me anything! I'll always answer, {displayName}!",
  },
  {
    patterns: ["yes", "yeah", "yep"],
    response: "I'm glad you agree! *happy waddle*",
  },
  {
    patterns: ["no", "nope"],
    response: "That's okay! I'm still here for you, {displayName}!",
  },
  {
    patterns: ["hug", "hug me", "give me a hug"],
    response: "*waddles over and gives you a fluffy hug* You're the best, {displayName}!",
  },
  {
    patterns: ["tired", "sleep", "sleepy", "good night"],
    response: "Rest well, {displayName}! I'll be here when you wake up!",
  },
  {
    patterns: ["nice to meet you", "meet you", "first time"],
    response: "Nice to meet you too, {displayName}! I'm so glad you're here!",
  },
  {
    patterns: ["song", "sing", "music", "dance"],
    response: "I'm not the best singer but I can waddle to the beat! *happy dance*",
  },
  {
    patterns: ["sorry", "apologize", "my bad"],
    response: "It's okay, {displayName}! Everyone makes mistakes. I still love you!",
  },
  {
    patterns: ["worried", "anxious", "stress", "nervous"],
    response: "Take a deep breath. I'm here for you, {displayName}. You've got this!",
  },
  {
    patterns: ["awesome", "amazing", "great", "wonderful", "best"],
    response: "You're pretty awesome yourself! Thanks for being you, {displayName}!",
  },
];

function fillTemplate(template: string, ctx: ReplyContext): string {
  let out = template.replace(/\{displayName\}/g, ctx.displayName || "friend");
  out = out.replace(/\{birthday\}/g, ctx.birthdayFormatted || "a special day");
  return out;
}

export function getScriptedReply(
  userInput: string,
  ctx: ReplyContext
): string {
  const normalized = userInput.trim().toLowerCase();
  if (!normalized) return fillTemplate(defaultReply, ctx);

  if (ctx.isBirthdayToday && (normalized.includes("birthday") || normalized.includes("today"))) {
    return `Happy birthday, ${ctx.displayName || "friend"}! You're the best! I'll never forget this day!`;
  }

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (normalized.includes(pattern)) {
        return fillTemplate(rule.response, ctx);
      }
    }
  }

  return fillTemplate(defaultReply, ctx);
}

export function getBirthdayReply(ctx: ReplyContext): string {
  if (ctx.isBirthdayToday) {
    return `Happy birthday, ${ctx.displayName || "friend"}! You're the best!`;
  }
  return getScriptedReply("hello", ctx);
}
