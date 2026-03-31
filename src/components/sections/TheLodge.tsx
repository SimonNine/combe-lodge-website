"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import SectionLabel from "../ui/SectionLabel";
import FadeIn from "../ui/FadeIn";
import LineReveal from "../ui/LineReveal";

const CAROUSEL_IMAGES = [
  { src: "/images/living-room.jpg", alt: "Open-plan living space" },
  { src: "/images/hot-tub.jpg", alt: "Private hot tub on the deck" },
  { src: "/images/master-bedroom.jpg", alt: "Master bedroom" },
  { src: "/images/kitchen.jpg", alt: "Smeg kitchen" },
  { src: "/images/bathroom.jpg", alt: "Freestanding bath" },
  { src: "/images/deck-view.jpg", alt: "Wraparound deck with lake views" },
];

export default function TheLodge() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((i) => (i + 1) % CAROUSEL_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <section
      ref={ref}
      id="lodge"
      className="relative bg-warm-white overflow-hidden py-24 md:py-32"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Carousel */}
          <motion.div
            style={{ y: imgY }}
            className="relative aspect-[4/5] rounded-[10px] overflow-hidden shadow-2xl shadow-dark/10"
            suppressHydrationWarning
          >
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${CAROUSEL_IMAGES[currentIndex].src}')` }}
              />
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {CAROUSEL_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "bg-white w-4" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Text */}
          <div>
            <SectionLabel number="01" label="The Lodge" />

            <FadeIn delay={0.1}>
              <h2 className="font-serif text-4xl md:text-5xl text-dark mt-6 leading-[1.1]">
                Contemporary
                <br />
                comfort
              </h2>
            </FadeIn>

            <FadeIn delay={0.15}>
              <LineReveal className="my-6" delay={0.2} />
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="font-sans font-light text-dark/60 text-base md:text-lg leading-relaxed">
                A beautifully appointed two-bedroom lodge with open-plan living,
                premium Smeg kitchen, and wraparound deck overlooking the lake.
                Bi-fold doors blur the line between inside and out.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-10 space-y-5">
                <Feature title="Two Bedrooms" desc="King & twin, both with ensuite bathrooms" />
                <Feature title="Freestanding Bath" desc="With waterproof TV for pure indulgence" />
                <Feature title="Private Hot Tub" desc="On your wraparound deck, overlooking the lake" />
                <Feature title="Smeg Kitchen" desc="Fully equipped with Lavazza coffee machine" />
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Link
                href="/booking"
                className="group inline-flex items-center gap-2 mt-10 px-7 py-3.5 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300 shadow-lg shadow-moss/20"
              >
                Check Availability
                <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-1.5 h-1.5 rounded-full bg-sage mt-2 flex-shrink-0" />
      <div>
        <div className="font-sans font-medium text-sm text-dark tracking-wide">{title}</div>
        <div className="font-sans font-light text-xs text-dark/45 mt-0.5 tracking-wide">{desc}</div>
      </div>
    </div>
  );
}
