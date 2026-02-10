"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Penguin, { type PenguinState } from "./Penguin";
import FeedButton from "./FeedButton";
import BathButton from "./BathButton";
import ChatBubble from "./ChatBubble";
import ScriptedQA from "./ScriptedQA";
import AntarcticaScene from "./AntarcticaScene";

type PetState = {
  hunger: number;
  cleanliness: number;
  mood: string;
  lastFedAt: string | null;
  lastBathAt: string | null;
  petName: string | null;
} | null;

type Props = {
  pet: PetState;
  displayName: string;
  isBirthdayToday: boolean;
  birthdayFormatted: string | null;
};

function moodToPenguinState(mood: string): PenguinState {
  if (mood === "sad") return "sad";
  if (mood === "happy") return "happy";
  return "ok";
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function PenguinDashboard({
  pet: initialPet,
  displayName,
  isBirthdayToday,
  birthdayFormatted,
}: Props) {
  const [pet, setPet] = useState(initialPet);
  const [loading, setLoading] = useState(false);
  const [tempState, setTempState] = useState<PenguinState | null>(null);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);
  const [bubbleSource, setBubbleSource] = useState<"openai" | "scripted" | undefined>(undefined);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPet = useCallback(async () => {
    const res = await fetch("/api/pet");
    if (res.ok) {
      const data = (await res.json()) as import("@/lib/api-types").PetResponse;
      setPet({
        hunger: data.hunger,
        cleanliness: data.cleanliness,
        mood: data.mood,
        lastFedAt: data.lastFedAt,
        lastBathAt: data.lastBathAt,
        petName: data.petName ?? null,
      });
    }
  }, []);

  useEffect(() => {
    const POLL_MS = 90_000;
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchPet();
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [fetchPet]);

  useEffect(() => {
    if (!initialPet?.lastFedAt && !initialPet?.lastBathAt) return;
    const lastActivity = [initialPet.lastFedAt, initialPet.lastBathAt]
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime());
    if (lastActivity.length === 0) return;
    const mostRecent = Math.max(...lastActivity);
    const hoursAgo = (Date.now() - mostRecent) / (60 * 60 * 1000);
    if (hoursAgo >= 24) {
      showBubble("I missed you! I was waiting for you.", "scripted", 5000);
    }
  }, []);

  const showBubble = useCallback(
    (msg: string, source?: "openai" | "scripted", duration = 6000) => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      const text = typeof msg === "string" && msg.trim() ? msg.trim() : "I'm here!";
      setBubbleMessage(text);
      setBubbleSource(source);
      bubbleTimerRef.current = setTimeout(() => {
        setBubbleMessage(null);
        setBubbleSource(undefined);
        bubbleTimerRef.current = null;
      }, duration);
    },
    []
  );

  const handleFeed = useCallback(async () => {
    setLoading(true);
    setTempState("eating");
    try {
      const res = await fetch("/api/pet/feed", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      showBubble(data.message ?? "Yum! Thanks for the fish!");
      await fetchPet();
    } finally {
      setTimeout(() => setTempState(null), 1500);
      setLoading(false);
    }
  }, [fetchPet, showBubble]);

  const handleBath = useCallback(async () => {
    setLoading(true);
    setTempState("bathing");
    try {
      const res = await fetch("/api/pet/bath", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      showBubble(data.message ?? "Splash! I feel so fresh!");
      await fetchPet();
    } finally {
      setTimeout(() => setTempState(null), 2000);
      setLoading(false);
    }
  }, [fetchPet, showBubble]);

  const penguinState: PenguinState =
    tempState ?? (pet ? moodToPenguinState(pet.mood) : "idle");
  const disabled = loading;

  return (
    <motion.div
      className="mt-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {isBirthdayToday && (
          <motion.div
            key="birthday"
            className="p-4 rounded-2xl bg-blush-100 border border-blush-200 text-center shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <p className="font-medium text-gray-800">
              Happy birthday{displayName ? `, ${displayName}` : ""}! 🎂
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={item}
        className="rounded-3xl border border-ice-200/50 bg-white/90 p-6 md:p-8 flex flex-col items-center shadow-lg"
      >
        <p className="text-sm text-gray-600 mb-2">
          {pet?.petName ? (
            <>Your penguin, <strong>{pet.petName}</strong></>
          ) : (
            <Link href="/profile" className="text-ice-500 font-medium hover:underline">
              Name your penguin
            </Link>
          )}
        </p>
        <AntarcticaScene className="w-full -mx-2 md:-mx-4">
          {bubbleMessage ? (
            <div className="w-full flex justify-center mb-3">
              <ChatBubble text={bubbleMessage} source={bubbleSource} />
            </div>
          ) : null}
          <Penguin
            state={penguinState}
            isBirthdayToday={isBirthdayToday}
          />
        </AntarcticaScene>

        <motion.div
          className="flex gap-4 mt-6"
          variants={item}
        >
          <FeedButton onFeed={handleFeed} disabled={disabled} />
          <BathButton onBath={handleBath} disabled={disabled} />
        </motion.div>

        {pet && (
          <motion.div
            className="mt-6 w-full max-w-xs flex flex-col gap-3"
            variants={item}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Stats</span>
              <button
                type="button"
                onClick={() => fetchPet()}
                className="text-xs text-ice-500 hover:text-ice-600 font-medium transition min-h-[44px] min-w-[44px] py-2 px-3 inline-flex items-center justify-center"
                aria-label="Refresh pet stats"
              >
                Refresh
              </button>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                <span>Hunger</span>
                <span>{pet.hunger}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-ice-100 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-ice-400"
                  animate={{ width: `${100 - pet.hunger}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                <span>Cleanliness</span>
                <span>{pet.cleanliness}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-ice-100 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-mint-200"
                  animate={{ width: `${pet.cleanliness}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <ScriptedQA displayName={displayName} onReply={showBubble} />
    </motion.div>
  );
}
