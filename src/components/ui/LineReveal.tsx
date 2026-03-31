"use client";

import { motion } from "framer-motion";

interface LineRevealProps {
  className?: string;
  delay?: number;
  direction?: "horizontal" | "vertical";
  light?: boolean;
}

export default function LineReveal({
  className = "",
  delay = 0,
  direction = "horizontal",
  light = false,
}: LineRevealProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <motion.div
      initial={isHorizontal ? { scaleX: 0 } : { scaleY: 0 }}
      whileInView={isHorizontal ? { scaleX: 1 } : { scaleY: 1 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.33, 1, 0.68, 1] }}
      className={`${
        isHorizontal ? "h-px w-full origin-left" : "w-px h-full origin-top"
      } ${light ? "bg-light-text/20" : "bg-dark/10"} ${className}`}
    />
  );
}
