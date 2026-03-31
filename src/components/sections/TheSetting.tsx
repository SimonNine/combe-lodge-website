"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SectionLabel from "../ui/SectionLabel";
import GlassCard from "../ui/GlassCard";

export default function TheSetting() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={ref}
      id="setting"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -top-20 -bottom-20" suppressHydrationWarning>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/landscape.jpg')" }}
          suppressHydrationWarning
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-overlay/80 via-dark-overlay/50 to-dark-overlay/20" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="max-w-xl">
          <SectionLabel number="03" label="The Setting" light />

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-light-text mt-6 leading-[1.1]"
          >
            Where Exmoor
            <br />
            meets the sea
          </motion.h2>

          <GlassCard className="mt-8" delay={0.3}>
            <p className="text-light-text/80 font-sans font-light text-base md:text-lg leading-relaxed">
              Nestled within the grounds of Kentisbury Grange, a Grade II listed
              Victorian estate at the gateway to Exmoor National Park. Minutes
              from the dramatic North Devon coastline, hidden valleys, and ancient
              woodland walks.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <Stat value="2 min" label="to Exmoor" />
              <Stat value="15 min" label="to the coast" />
              <Stat value="On-site" label="restaurant & bar" />
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-xl md:text-2xl text-wheat">{value}</div>
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-light-text/50 mt-1">
        {label}
      </div>
    </div>
  );
}
