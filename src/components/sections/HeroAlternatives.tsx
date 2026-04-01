"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   OPTION A — Carousel with crossfade background
   ───────────────────────────────────────────── */

const carouselImages = [
  "/images/hero-exterior.jpg",
  "/images/deck-view.jpg",
  "/images/landscape.jpg",
  "/images/hot-tub.jpg",
  "/images/grounds.jpg",
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden flex items-center justify-center">
      {/* Crossfade images */}
      {carouselImages.map((src, i) => (
        <motion.div
          key={src}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${src}')` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: i === current ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-overlay/50 via-dark-overlay/30 to-dark-overlay/70" />

      {/* Content — centred */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-wheat/80 mb-4">
            North Devon &middot; Kentisbury Grange
          </p>
          <h1 className="font-serif text-6xl sm:text-8xl md:text-9xl text-light-text leading-[0.95] tracking-tight">
            Combe
            <br />
            <span className="inline-block pb-2">Lodge</span>
          </h1>
          <div className="h-px w-16 bg-wheat/50 mx-auto mt-6 mb-5" />
          <p className="font-sans font-light text-light-text/50 text-sm md:text-base tracking-widest uppercase">
            A shelter in the valley
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex justify-center gap-4"
        >
          <Link
            href="/booking"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-light-text text-dark font-sans font-medium text-sm tracking-wide hover:bg-wheat transition-all duration-300"
          >
            Book Your Stay
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
          <a
            href="#lodge"
            className="inline-flex items-center px-7 py-3.5 rounded-full border border-light-text/30 text-light-text/80 font-sans font-light text-sm tracking-wide hover:bg-light-text/10 transition-all duration-300"
          >
            Explore
          </a>
        </motion.div>

        {/* Slide indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {carouselImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-0.5 rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-wheat" : "w-4 bg-light-text/25"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Badge label */}
      <div className="absolute top-6 left-6 z-10 font-mono text-[9px] tracking-[0.2em] uppercase text-light-text/40 bg-dark-overlay/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
        Option A — Carousel
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   OPTION B — Split screen: text left, image right
   ───────────────────────────────────────────── */

function HeroSplit() {
  return (
    <section className="relative h-screen overflow-hidden flex flex-col md:flex-row">
      {/* Left — text */}
      <div className="relative z-10 flex-1 flex flex-col justify-end md:justify-center bg-dark-overlay px-8 md:px-16 py-16 md:py-0">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-sage mb-6">
            Kentisbury Grange &middot; North Devon
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-light-text leading-[1] tracking-tight">
            Combe
          </h1>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-wheat leading-[1] tracking-tight pb-2">
            Lodge
          </h1>
          <p className="font-sans font-light text-light-text/45 text-base md:text-lg max-w-sm mt-6 leading-relaxed">
            A luxury retreat nestled in the valley, where the landscape becomes your living room.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/booking"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300"
            >
              Book Your Stay
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right — image grid */}
      <div className="flex-1 relative hidden md:grid grid-cols-2 grid-rows-2 gap-1">
        {["/images/hero-exterior.jpg", "/images/living-room.jpg", "/images/hot-tub.jpg", "/images/deck-view.jpg"].map(
          (src, i) => (
            <motion.div
              key={src}
              className="relative overflow-hidden"
              initial={{ opacity: 0, scale: 1.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 + i * 0.15 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center img-zoom"
                style={{ backgroundImage: `url('${src}')` }}
              />
            </motion.div>
          )
        )}
      </div>

      {/* Mobile: single background */}
      <div
        className="absolute inset-0 md:hidden bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/hero-exterior.jpg')" }}
      />

      {/* Badge label */}
      <div className="absolute top-6 left-6 z-10 font-mono text-[9px] tracking-[0.2em] uppercase text-light-text/40 bg-dark-overlay/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
        Option B — Split Screen
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   OPTION C — Cinematic letterbox with Ken Burns
   ───────────────────────────────────────────── */

function HeroCinematic() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-dark flex items-center">
      {/* Letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-[12vh] bg-dark z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-[12vh] bg-dark z-20" />

      {/* Ken Burns background */}
      <motion.div
        className="absolute inset-0"
        style={{ scale: imgScale }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/landscape.jpg')" }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 bg-dark-overlay/40" />
      </motion.div>

      {/* Content */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8"
        >
          <div>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 60 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-px bg-wheat mb-6"
            />
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] text-light-text leading-[0.9] tracking-tighter">
              Combe
            </h1>
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] text-light-text/80 leading-[0.9] tracking-tighter pb-3">
              Lodge
            </h1>
          </div>

          <div className="md:pb-4 max-w-xs">
            <p className="font-sans font-light text-light-text/40 text-sm leading-relaxed mb-6">
              A luxury lodge retreat in the North Devon countryside. Private hot tub. Contemporary interiors. Exmoor on your doorstep.
            </p>
            <Link
              href="/booking"
              className="group inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase text-wheat hover:text-light-text transition-colors"
            >
              <span className="h-px w-8 bg-wheat group-hover:w-12 transition-all" />
              Book your stay
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Badge label */}
      <div className="absolute top-[13vh] left-6 z-30 font-mono text-[9px] tracking-[0.2em] uppercase text-light-text/40 bg-dark-overlay/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
        Option C — Cinematic
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   OPTION D — Editorial / magazine layout
   ───────────────────────────────────────────── */

function HeroEditorial() {
  return (
    <section className="relative h-screen overflow-hidden bg-warm-white flex items-center">
      {/* Large background text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="font-serif text-[20vw] text-dark/[0.03] leading-none tracking-tighter whitespace-nowrap">
          COMBE
        </span>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-6 items-center">
          {/* Text column */}
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-moss mb-4">
              Kentisbury Grange &middot; Exmoor
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-dark leading-[1] tracking-tight">
              Combe
            </h1>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-moss leading-[1] tracking-tight pb-2">
              Lodge
            </h1>
            <div className="h-px w-12 bg-sage mt-5 mb-5" />
            <p className="font-sans font-light text-dark/45 text-base leading-relaxed max-w-sm">
              Where modern luxury meets the wild beauty of the North Devon valley. A retreat designed for stillness.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/booking"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-dark text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss transition-all duration-300"
              >
                Book Your Stay
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
              <a
                href="#lodge"
                className="inline-flex items-center px-7 py-3.5 rounded-[10px] border border-dark/15 text-dark/60 font-sans font-light text-sm tracking-wide hover:border-dark/30 transition-all duration-300"
              >
                Explore
              </a>
            </div>
          </motion.div>

          {/* Image column — staggered pair */}
          <div className="md:col-span-7 relative h-[60vh] md:h-[75vh]">
            <motion.div
              className="absolute top-0 right-0 w-[65%] h-[70%] rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center img-zoom"
                style={{ backgroundImage: "url('/images/hero-exterior.jpg')" }}
              />
            </motion.div>
            <motion.div
              className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-2xl overflow-hidden shadow-2xl border-4 border-warm-white"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center img-zoom"
                style={{ backgroundImage: "url('/images/hot-tub.jpg')" }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Badge label */}
      <div className="absolute top-6 left-6 z-10 font-mono text-[9px] tracking-[0.2em] uppercase text-dark/30 bg-stone px-3 py-1.5 rounded-full">
        Option D — Editorial
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   OPTION E — Minimal with large type + image strip
   ───────────────────────────────────────────── */

const stripImages = [
  "/images/hero-exterior.jpg",
  "/images/living-room.jpg",
  "/images/hot-tub.jpg",
  "/images/master-bedroom.jpg",
  "/images/deck-view.jpg",
  "/images/kitchen.jpg",
];

function HeroMinimal() {
  const stripRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative h-screen overflow-hidden bg-dark-overlay flex flex-col justify-between">
      {/* Top — sparse nav-style info */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-8"
      >
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-light-text/30">
          51.2153° N, 3.8457° W
        </span>
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-light-text/30">
          North Devon, England
        </span>
      </motion.div>

      {/* Centre — massive type */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="font-serif text-[15vw] md:text-[12vw] text-light-text leading-[0.85] tracking-tighter">
            Combe
          </h1>
          <h1 className="font-serif text-[15vw] md:text-[12vw] text-light-text/60 leading-[0.85] tracking-tighter pb-2">
            Lodge
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Link
            href="/booking"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-light-text/20 text-light-text font-sans font-light text-sm tracking-widest uppercase hover:bg-light-text hover:text-dark transition-all duration-500"
          >
            Book Your Stay
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </motion.div>
      </div>

      {/* Bottom — scrolling image strip */}
      <div className="relative z-10 overflow-hidden pb-8">
        <motion.div
          ref={stripRef}
          className="flex gap-3 px-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...stripImages, ...stripImages].map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="flex-shrink-0 w-40 h-24 md:w-56 md:h-32 rounded-lg overflow-hidden"
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${src}')` }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Badge label */}
      <div className="absolute top-6 left-6 z-10 font-mono text-[9px] tracking-[0.2em] uppercase text-light-text/40 bg-dark-overlay/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
        Option E — Minimal + Image Strip
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Export all alternatives as a showcase
   ───────────────────────────────────────────── */

export default function HeroAlternatives() {
  return (
    <>
      <HeroCarousel />
      <HeroSplit />
      <HeroCinematic />
      <HeroEditorial />
      <HeroMinimal />
    </>
  );
}
