"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
        <div className="absolute inset-0 bg-gradient-to-r from-dark-overlay/85 via-dark-overlay/50 to-dark-overlay/30" />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="grid md:grid-cols-12 gap-8">
          {/* Left — heading */}
          <motion.div
            className="md:col-span-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-sage mb-6">
              The Setting
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-light-text leading-[1.05]">
              Where Exmoor
              <br />
              meets the sea
            </h2>
            <div className="h-px w-12 bg-wheat/40 mt-8" />
          </motion.div>

          {/* Right — description */}
          <motion.div
            className="md:col-span-5 md:col-start-8 md:pt-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-sans font-light text-light-text/65 text-base md:text-lg leading-relaxed">
              Nestled within the grounds of Kentisbury Grange, a Grade II listed
              Victorian estate at the gateway to Exmoor National Park. Minutes
              from the dramatic North Devon coastline, hidden valleys, and ancient
              woodland walks.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-px bg-light-text/10 rounded-xl overflow-hidden mt-16 md:mt-24 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Stat value="2 min" label="to Exmoor" />
          <Stat value="15 min" label="to the coast" />
          <Stat value="On-site" label="restaurant & bar" />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-dark-overlay/40 backdrop-blur-sm p-6 md:p-8 text-center">
      <div className="font-serif text-2xl md:text-3xl text-wheat">{value}</div>
      <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-light-text/40 mt-2">
        {label}
      </div>
    </div>
  );
}
