"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "glass";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-medium tracking-wide transition-all duration-300 cursor-pointer";

  const variants = {
    primary:
      "bg-moss text-light-text hover:bg-moss-light active:scale-[0.98] shadow-lg shadow-moss/20",
    outline:
      "border border-stone-dark text-dark hover:bg-stone hover:border-stone active:scale-[0.98]",
    glass:
      "glass text-light-text hover:bg-glass-strong active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm rounded-lg",
    md: "px-7 py-3.5 text-base rounded-[10px]",
    lg: "px-9 py-4 text-lg rounded-[10px]",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const MotionComponent = href ? motion.a : motion.button;

  return (
    <MotionComponent
      href={href}
      onClick={onClick}
      className={classes}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </MotionComponent>
  );
}
