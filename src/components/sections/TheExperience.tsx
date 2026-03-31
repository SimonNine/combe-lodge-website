"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SectionLabel from "../ui/SectionLabel";
import FadeIn from "../ui/FadeIn";

const experiences = [
  {
    title: "Exmoor National Park",
    desc: "Ancient woodland, wild ponies, and dramatic valleys. The park begins at your doorstep.",
  },
  {
    title: "North Devon Coast",
    desc: "Dramatic cliffs, hidden coves, and world-class surfing beaches fifteen minutes away.",
  },
  {
    title: "Heddon Valley",
    desc: "One of England's finest gorge walks, leading from Exmoor moorland down to the sea.",
  },
  {
    title: "On-site Dining",
    desc: "Award-winning restaurant and bar at Kentisbury Grange. Locally sourced, seasonally inspired.",
  },
];

export default function TheExperience() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section
      ref={ref}
      id="experience"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -top-20 -bottom-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/grounds.jpg')` }}
        />
        <div className="absolute inset-0 bg-dark-overlay/65" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 py-24">
        <SectionLabel number="05" label="The Experience" light />

        <FadeIn delay={0.1}>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-light-text mt-6 leading-[1.1]">
            Beyond the lodge
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
            className="h-px w-16 bg-wheat/50 origin-left mt-6 mb-12"
          />
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-px bg-light-text/10 rounded-[10px] overflow-hidden">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{
                duration: 0.7,
                delay: 0.15 + i * 0.08,
                ease: [0.33, 1, 0.68, 1],
              }}
              className="group p-6 md:p-8 bg-dark-overlay/40 backdrop-blur-sm hover:bg-dark-overlay/50 transition-colors duration-500"
            >
              <motion.div
                className="w-5 h-px bg-sage/60 mb-4"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                style={{ originX: 0 }}
              />
              <h3 className="font-serif text-lg text-light-text tracking-wide">
                {exp.title}
              </h3>
              <p className="font-sans font-light text-sm text-light-text/50 mt-2 leading-relaxed">
                {exp.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
