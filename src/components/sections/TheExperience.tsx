"use client";

import { motion } from "framer-motion";

const experiences = [
  {
    title: "Exmoor National Park",
    desc: "Ancient woodland, wild ponies, and dramatic valleys. The park begins at your doorstep.",
    image: "/images/grounds.jpg",
  },
  {
    title: "North Devon Coast",
    desc: "Dramatic cliffs, hidden coves, and world-class surfing beaches fifteen minutes away.",
    image: "/images/landscape.jpg",
  },
  {
    title: "On-site Dining",
    desc: "Award-winning restaurant and bar at Kentisbury Grange. Locally sourced, seasonally inspired.",
    image: "/images/restaurant.jpg",
  },
];

export default function TheExperience() {
  return (
    <section id="experience" className="relative bg-dark-overlay overflow-hidden py-24 md:py-36">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <motion.div
            className="md:col-span-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-sage/70 mb-6">
              The Experience
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-light-text leading-[1.05]">
              Beyond
              <br />
              the lodge
            </h2>
          </motion.div>
          <motion.div
            className="md:col-span-4 md:col-start-9 md:pt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="font-sans font-light text-light-text/40 text-sm leading-relaxed">
              From wild moorland walks to award-winning dining, the landscape
              around Combe Lodge is as rich as the retreat itself.
            </p>
          </motion.div>
        </div>

        {/* Image cards — editorial grid like Lucomoria services */}
        <div className="grid md:grid-cols-3 gap-4">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.title}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-default"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.12 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[5s] ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('${exp.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-overlay/80 via-dark-overlay/20 to-transparent" />

              {/* Content pinned bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
                <div className="h-px w-8 bg-wheat/40 mb-4" />
                <h3 className="font-serif text-xl text-light-text">{exp.title}</h3>
                <p className="font-sans font-light text-sm text-light-text/50 mt-2 leading-relaxed">
                  {exp.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
