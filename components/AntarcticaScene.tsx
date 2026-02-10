"use client";

import { motion, useReducedMotion } from "framer-motion";

const SNOW_COUNT = 12;
const HEART_COUNT = 7;
const HEART_POSITIONS = [18, 28, 42, 55, 68, 78, 88];

export default function AntarcticaScene({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Sky gradient - cold blue to soft lavender at horizon */}
      <div
        className="absolute inset-0 h-[55%]"
        style={{
          background: "linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 40%, #dbeafe 70%, #e9d5ff 100%)",
        }}
      />
      {/* Distant ice hills */}
      <div
        className="absolute bottom-[28%] left-0 right-0 h-[20%]"
        style={{
          background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.8) 100%)",
          clipPath: "ellipse(80% 100% at 50% 100%)",
        }}
      />
      {/* Ice ground where penguin stands */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[35%] rounded-b-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{
          background: "linear-gradient(to top, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)",
        }}
      />
      {/* Subtle snow particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: SNOW_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/70"
            style={{
              left: `${(i * 7 + 5) % 100}%`,
              top: "-5%",
            }}
            animate={{
              y: ["0vh", "110vh"],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
      {/* Floating hearts behind penguin */}
      {!reduceMotion && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {Array.from({ length: HEART_COUNT }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-xl opacity-80 text-pink-400"
              style={{
                left: `${HEART_POSITIONS[i]}%`,
                top: "55%",
              }}
              initial={{ opacity: 0.8, y: 0 }}
              animate={{ opacity: 0, y: -35 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeOut",
              }}
              aria-hidden
            >
              ♥
            </motion.span>
          ))}
        </div>
      )}
      {/* Content (penguin + bubble) */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[320px] md:min-h-[380px] py-6">
        {children}
      </div>
    </motion.div>
  );
}
