"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  onBath: () => Promise<void>;
  disabled?: boolean;
};

export default function BathButton({ onBath, disabled }: Props) {
  const [clicked, setClicked] = useState(false);
  const handleClick = async () => {
    if (disabled) return;
    setClicked(true);
    await onBath();
    setTimeout(() => setClicked(false), 400);
  };
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] px-6 py-3 rounded-2xl bg-ice-100 border border-ice-200 text-ice-700 font-medium disabled:opacity-50 shadow-md"
      aria-label="Give penguin a bath"
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.span
        className="text-2xl block"
        animate={clicked ? { scale: [1, 1.2, 1], y: [0, -2, 0] } : {}}
        transition={{ duration: 0.35 }}
      >
        🛁
      </motion.span>
      <span>Bath</span>
    </motion.button>
  );
}
