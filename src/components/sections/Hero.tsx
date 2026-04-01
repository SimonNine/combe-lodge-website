"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

const HERO_IMAGES = [
  "/images/hero-exterior.jpg",
  "/images/deck-view.jpg",
  "/images/landscape.jpg",
  "/images/hot-tub.jpg",
];

export default function Hero() {
  const ref = useRef(null);
  const [tagline, setTagline] = useState("A shelter in the valley");
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.siteSettings?.tagline) setTagline(d.siteSettings.tagline);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((c) => (c + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Crossfading background images with slow zoom */}
      {HERO_IMAGES.map((src, i) => (
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: i === currentImg ? 1 : 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${src}')`, scale }}
            suppressHydrationWarning
          />
        </motion.div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-overlay/90 via-dark-overlay/30 to-dark-overlay/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-overlay/40 to-transparent" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col justify-end"
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          {/* Location bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-light-text/35">
              51.1842° N, 3.8531° W
            </span>
            <span className="h-px flex-1 max-w-12 bg-light-text/15" />
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-light-text/35">
              North Devon, England
            </span>
          </motion.div>

          {/* Title */}
          <div className="grid md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-7">
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
                  className="font-serif text-6xl sm:text-8xl md:text-9xl lg:text-[9.5rem] text-light-text leading-[0.9] tracking-tight"
                >
                  Combe
                </motion.h1>
              </div>
              <div className="overflow-hidden pb-4">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.45, ease: [0.33, 1, 0.68, 1] }}
                  className="font-serif text-6xl sm:text-8xl md:text-9xl lg:text-[9.5rem] text-light-text/70 leading-[0.9] tracking-tight"
                >
                  Lodge
                </motion.h1>
              </div>
            </div>

            {/* Right column — tagline + CTA */}
            <motion.div
              className="md:col-span-5 md:pb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <p className="font-sans font-light text-light-text/50 text-base md:text-lg leading-relaxed max-w-sm">
                {tagline}
              </p>

              <div className="mt-8 flex items-center gap-5">
                <Link
                  href="/booking"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-light-text text-dark font-sans font-medium text-sm tracking-wide hover:bg-wheat transition-all duration-300"
                >
                  Book Your Stay
                  <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </Link>
                <a
                  href="#lodge"
                  className="group inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase text-light-text/50 hover:text-light-text transition-colors duration-300"
                >
                  <span className="h-px w-6 bg-light-text/30 group-hover:w-10 transition-all duration-300" />
                  Explore
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Slide indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
        >
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImg(i)}
              className={`h-0.5 rounded-full transition-all duration-700 ${
                i === currentImg ? "w-8 bg-light-text/60" : "w-3 bg-light-text/20"
              }`}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
