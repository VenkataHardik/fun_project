"use client";

import { motion } from "framer-motion";

export default function AppHeader({ children }: { children: React.ReactNode }) {
  return (
    <motion.header
      className="border-b border-ice-200/50 bg-white/70 backdrop-blur sticky top-0 z-10 shadow-cute"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {children}
    </motion.header>
  );
}
