"use client";

import { motion } from "framer-motion";
import SectionLabel from "../ui/SectionLabel";
import FadeIn from "../ui/FadeIn";
import LineReveal from "../ui/LineReveal";

const rooms = [
  {
    title: "Master Suite",
    desc: "King-size bed with garden views. Ensuite with walk-in rainfall shower.",
    image: "/images/master-bedroom.jpg",
  },
  {
    title: "Second Bedroom",
    desc: "Flexible twin or double. Ensuite with freestanding bath and waterproof TV.",
    image: "/images/second-bedroom.jpg",
  },
  {
    title: "The Deck",
    desc: "Private wraparound deck with hot tub, outdoor dining, and lake views.",
    image: "/images/hot-tub.jpg",
  },
];

export default function TheRooms() {
  return (
    <section className="relative bg-stone overflow-hidden py-24 md:py-32">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between gap-8 mb-12">
          <div>
            <SectionLabel number="02" label="The Spaces" />
            <FadeIn delay={0.1}>
              <h2 className="font-serif text-4xl md:text-5xl text-dark mt-6 leading-[1.1]">
                Every room,
                <br />
                a retreat
              </h2>
            </FadeIn>
          </div>
          <FadeIn delay={0.2} className="hidden md:block">
            <p className="font-sans font-light text-dark/50 text-sm max-w-xs text-right leading-relaxed">
              Thoughtfully designed spaces where every detail has been considered
            </p>
          </FadeIn>
        </div>

        <LineReveal delay={0.2} className="mb-12" />

        <div className="grid md:grid-cols-3 gap-5">
          {rooms.map((room, i) => (
            <motion.div
              key={room.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.12,
                ease: [0.33, 1, 0.68, 1],
              }}
              className="group cursor-default"
            >
              <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[4s] ease-out group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url('${room.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-overlay/70 via-dark-overlay/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Content at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <motion.div
                    className="w-6 h-px bg-wheat/60 mb-3"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                    style={{ originX: 0 }}
                  />
                  <h3 className="font-serif text-xl text-light-text tracking-wide">
                    {room.title}
                  </h3>
                  <p className="font-sans font-light text-sm text-light-text/60 mt-2 leading-relaxed">
                    {room.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
