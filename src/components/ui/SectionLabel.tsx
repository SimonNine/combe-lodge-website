"use client";

import { motion } from "framer-motion";

interface SectionLabelProps {
  number: string;
  label: string;
  light?: boolean;
}

export default function SectionLabel({
  number,
  label,
  light = false,
}: SectionLabelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6 }}
      className={`flex items-center gap-3 font-mono text-xs tracking-[0.2em] uppercase ${
        light ? "text-light-text/60" : "text-dark/50"
      }`}
    >
      <span>{number}</span>
      <span className={`w-8 h-px ${light ? "bg-light-text/30" : "bg-dark/20"}`} />
      <span>{label}</span>
    </motion.div>
  );
}
