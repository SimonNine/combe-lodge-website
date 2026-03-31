"use client";

import { motion } from "framer-motion";

interface FriendlyMessageProps {
  message: string;
  type?: "info" | "warning";
}

export default function FriendlyMessage({
  message,
  type = "warning",
}: FriendlyMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2.5 px-4 py-3 rounded-[10px] bg-sage/10 border border-sage/15"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="text-moss flex-shrink-0 mt-0.5"
      >
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M8 5.5V8.5M8 10.5V10.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <p className="font-sans text-sm text-dark/80 leading-relaxed">{message}</p>
    </motion.div>
  );
}
