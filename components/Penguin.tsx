"use client";

import { motion } from "framer-motion";

export type PenguinState = "idle" | "eating" | "bathing" | "happy" | "sad" | "ok";

type Props = {
  state: PenguinState;
  isBirthdayToday?: boolean;
  className?: string;
};

export default function Penguin({ state, isBirthdayToday, className = "" }: Props) {
  const isIdle = state === "idle" || state === "ok";

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Birthday cake - floating */}
      {isBirthdayToday && (
        <motion.div
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-4xl z-10"
          aria-hidden
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          🎂
        </motion.div>
      )}

      {/* Bath water drops */}
      {state === "bathing" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="absolute text-2xl opacity-70"
              style={{ left: `${40 + i * 12}%`, top: "30%" }}
              initial={{ y: 0, scale: 0, opacity: 0 }}
              animate={{
                y: [0, 30, 60],
                scale: [0, 1, 0.5],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 0.3,
              }}
            >
              💧
            </motion.span>
          ))}
        </div>
      )}

      <motion.img
        src="/penguin.svg"
        alt="Penguin pet"
        className="w-44 h-auto drop-shadow-xl md:w-56 block"
        initial={false}
        animate={
          state === "eating"
            ? { scale: [1, 1.08, 1], transition: { duration: 0.4, repeat: 2 } }
            : state === "bathing"
              ? { rotate: [0, -8, 8, -6, 6, 0], transition: { duration: 0.6 } }
              : state === "happy"
                ? { y: [0, -8, 0], transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }
                : state === "sad"
                  ? { rotate: [0, 4], y: [0, 4], transition: { duration: 0.3 } }
                  : isIdle
                    ? {
                        rotate: [0, -1.5, 0, 1.5, 0],
                        y: [0, 2, 0, 2, 0],
                        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                      }
                    : {}
        }
      />

      {/* Eating - fish moving to mouth */}
      {state === "eating" && (
        <motion.div
          className="absolute text-2xl pointer-events-none"
          style={{ left: "60%", top: "25%" }}
          initial={{ x: 25, y: -5, opacity: 1 }}
          animate={{
            x: [25, 5, -10],
            y: [-5, 0, 5],
            opacity: [1, 1, 0],
            scale: [1, 0.9, 0.5],
          }}
          transition={{ duration: 0.9, ease: "easeIn" }}
        >
          🐟
        </motion.div>
      )}
    </div>
  );
}
