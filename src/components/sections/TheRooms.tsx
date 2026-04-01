"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const rooms = [
  {
    title: "Master Suite",
    desc: "King-size bed with garden views. Ensuite with walk-in rainfall shower and luxury amenities.",
    image: "/images/master-bedroom.jpg",
  },
  {
    title: "Second Bedroom",
    desc: "Flexible twin or double configuration. Ensuite with freestanding bath and waterproof TV.",
    image: "/images/second-bedroom.jpg",
  },
  {
    title: "Living Space",
    desc: "Open-plan living with bi-fold doors to the wraparound deck. Premium furnishings throughout.",
    image: "/images/living-room.jpg",
  },
  {
    title: "The Deck",
    desc: "Private wraparound deck with hot tub, outdoor dining area, and uninterrupted lake views.",
    image: "/images/hot-tub.jpg",
  },
];

export default function TheRooms() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((c) => (c + dir + rooms.length) % rooms.length);
  };

  return (
    <section className="relative bg-stone overflow-hidden py-24 md:py-36">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-center">
          {/* Left — text + nav */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-dark/30 mb-6">
              The Spaces
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-dark leading-[1.05]">
              Every room,
              <br />
              a retreat
            </h2>
            <p className="font-sans font-light text-dark/45 text-sm mt-6 leading-relaxed max-w-xs">
              Thoughtfully designed spaces where every detail has been considered for your comfort.
            </p>

            {/* Room info */}
            <div className="mt-10 border-t border-dark/10 pt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-serif text-xl text-dark">{rooms[current].title}</h3>
                  <p className="font-sans font-light text-sm text-dark/45 mt-2 leading-relaxed">
                    {rooms[current].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => go(-1)}
                className="w-10 h-10 rounded-full border border-dark/15 flex items-center justify-center text-dark/40 hover:border-dark/30 hover:text-dark transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="font-mono text-[10px] tracking-widest text-dark/30">
                {String(current + 1).padStart(2, "0")} / {String(rooms.length).padStart(2, "0")}
              </span>
              <button
                onClick={() => go(1)}
                className="w-10 h-10 rounded-full border border-dark/15 flex items-center justify-center text-dark/40 hover:border-dark/30 hover:text-dark transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Right — image slider */}
          <div className="md:col-span-8 relative aspect-[4/3] md:aspect-[3/2] rounded-xl overflow-hidden">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={current}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${rooms[current].image}')` }}
              />
            </AnimatePresence>

            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-overlay/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
