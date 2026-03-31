"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export default function Hero() {
  const ref = useRef(null);
  const [tagline, setTagline] = useState("A shelter in the valley");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => { if (d.siteSettings?.tagline) setTagline(d.siteSettings.tagline); })
      .catch(() => {});
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden flex items-end">
      {/* Background image with parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0" suppressHydrationWarning>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-exterior.jpg')" }}
          suppressHydrationWarning
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-overlay/80 via-dark-overlay/20 to-dark-overlay/40" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pb-16 md:pb-24"
      >
        {/* Staggered title reveal */}
        <div className="overflow-hidden pb-1">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
            className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-light-text leading-[1.05] tracking-tight"
          >
            Combe
          </motion.h1>
        </div>
        <div className="overflow-hidden pb-1">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.33, 1, 0.68, 1] }}
            className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-light-text leading-[1.05] tracking-tight"
          >
            Lodge
          </motion.h1>
        </div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="h-px w-24 bg-wheat/60 origin-left mt-6 md:mt-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="font-sans font-light text-light-text/60 text-base md:text-lg max-w-md mt-4 tracking-wide"
        >
          {tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-8 flex gap-4"
        >
          <Link
            href="/booking"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300 shadow-lg shadow-moss/20"
          >
            Book Your Stay
            <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
          </Link>
          <a
            href="#lodge"
            className="inline-flex items-center px-7 py-3.5 rounded-[10px] glass text-light-text font-sans font-light text-sm tracking-wide hover:bg-glass-strong transition-all duration-300"
          >
            Explore
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-light-text/20 flex items-start justify-center p-1.5"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-0.5 h-1.5 rounded-full bg-light-text/50"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
