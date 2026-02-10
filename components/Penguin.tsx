"use client";

import { motion } from "framer-motion";

export type PenguinState = "idle" | "eating" | "bathing" | "happy" | "sad" | "ok";

type Props = {
  state: PenguinState;
  isBirthdayToday?: boolean;
  className?: string;
};

export default function Penguin({ state, isBirthdayToday, className = "" }: Props) {
  const moodFace = state === "sad" ? "sad" : state === "happy" || state === "ok" ? "happy" : "idle";
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

      <motion.svg
        viewBox="0 0 140 150"
        className="w-44 h-auto drop-shadow-xl md:w-56"
        aria-label="Penguin pet"
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
                  : {}
        }
      >
        {/* Body group - idle waddle */}
        <motion.g
          animate={
            isIdle || state === "sad"
              ? {
                  rotate: state === "sad" ? 4 : [0, -1.5, 0, 1.5, 0],
                  y: state === "sad" ? 4 : [0, 2, 0, 2, 0],
                }
              : {}
          }
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "70px 115px" }}
        >
          {/* Back body - rounder */}
          <ellipse cx="70" cy="92" rx="42" ry="48" fill="#1e293b" />
          <ellipse cx="70" cy="88" rx="36" ry="42" fill="#334155" />
          {/* Belly - soft cream */}
          <ellipse cx="70" cy="96" rx="26" ry="32" fill="#fef3c7" />
          {/* Flipper left */}
          <motion.ellipse
            cx="32"
            cy="85"
            rx="14"
            ry="8"
            fill="#334155"
            animate={
              isIdle
                ? { rotate: [0, 12, 0, -8, 0], transformOrigin: "32px 85px" }
                : state === "happy"
                  ? { rotate: -25, transformOrigin: "32px 85px" }
                  : {}
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Flipper right */}
          <motion.ellipse
            cx="108"
            cy="85"
            rx="14"
            ry="8"
            fill="#334155"
            animate={
              isIdle
                ? { rotate: [0, -12, 0, 8, 0], transformOrigin: "108px 85px" }
                : state === "happy"
                  ? { rotate: 25, transformOrigin: "108px 85px" }
                  : {}
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* Head group - same waddle origin */}
        <motion.g
          animate={
            isIdle || state === "sad"
              ? {
                  rotate: state === "sad" ? 4 : [0, -1.5, 0, 1.5, 0],
                  y: state === "sad" ? 4 : [0, 2, 0, 2, 0],
                }
              : {}
          }
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "70px 115px" }}
        >
          {/* Head dark */}
          <circle cx="70" cy="42" r="32" fill="#1e293b" />
          <circle cx="70" cy="40" r="28" fill="#334155" />
          {/* Face */}
          <ellipse cx="70" cy="42" rx="24" ry="26" fill="#fef3c7" />
          {/* Eyes - blink when idle/happy/ok; sad gets droopy eyes below */}
          {moodFace !== "sad" && (
            <motion.g
              animate={
                isIdle || state === "happy"
                  ? { scaleY: [1, 0.08, 1] }
                  : { scaleY: 1 }
              }
              transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3.2 }}
              style={{ transformOrigin: "70px 38px" }}
            >
              <circle cx="60" cy="38" r="6" fill="#1e293b" />
              <circle cx="80" cy="38" r="6" fill="#1e293b" />
              <circle cx="60" cy="37" r="2" fill="white" />
              <circle cx="80" cy="37" r="2" fill="white" />
            </motion.g>
          )}
          {moodFace === "sad" && (
            <g>
              <circle cx="60" cy="40" r="6" fill="#1e293b" />
              <circle cx="80" cy="40" r="6" fill="#1e293b" />
              <circle cx="60" cy="39" r="1.5" fill="white" />
              <circle cx="80" cy="39" r="1.5" fill="white" />
              <circle cx="62" cy="48" r="2" fill="#94a3b8" opacity={0.8} />
              <circle cx="82" cy="48" r="2" fill="#94a3b8" opacity={0.8} />
            </g>
          )}
          {/* Beak */}
          <motion.path
            d="M 58 50 L 70 58 L 82 50 Z"
            fill="#f59e0b"
            animate={moodFace === "sad" ? { y: 2 } : {}}
          />
          {/* Mouth */}
          {moodFace === "happy" && (
            <path
              d="M 52 52 Q 70 62 88 52"
              stroke="#1e293b"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {moodFace === "sad" && (
            <path
              d="M 52 56 Q 70 48 88 56"
              stroke="#1e293b"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </motion.g>

        {/* Feet - squash on idle */}
        <motion.g
          animate={
            isIdle
              ? {
                  scaleY: [1, 1.1, 1],
                  scaleX: [1, 0.95, 1],
                  transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                }
              : {}
          }
          style={{ transformOrigin: "70px 142px" }}
        >
          <ellipse cx="52" cy="142" rx="12" ry="6" fill="#f59e0b" />
          <ellipse cx="88" cy="142" rx="12" ry="6" fill="#f59e0b" />
        </motion.g>

        {/* Eating - fish moving to mouth */}
        {state === "eating" && (
          <motion.g
            initial={{ x: 25, y: -5, opacity: 1 }}
            animate={{
              x: [25, 5, -10],
              y: [-5, 0, 5],
              opacity: [1, 1, 0],
              scale: [1, 0.9, 0.5],
            }}
            transition={{ duration: 0.9, ease: "easeIn" }}
          >
            <ellipse cx="95" cy="48" rx="14" ry="7" fill="#f87171" />
            <circle cx="102" cy="47" r="2.5" fill="white" />
          </motion.g>
        )}
      </motion.svg>
    </div>
  );
}
