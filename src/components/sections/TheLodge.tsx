"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  { title: "Two Bedrooms", desc: "King & twin, both with ensuite bathrooms" },
  { title: "Freestanding Bath", desc: "With waterproof TV for pure indulgence" },
  { title: "Private Hot Tub", desc: "On your wraparound deck, overlooking the lake" },
  { title: "Smeg Kitchen", desc: "Fully equipped with Lavazza coffee machine" },
];

export default function TheLodge() {
  return (
    <section id="lodge" className="relative bg-warm-white overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-36">
        {/* Editorial intro — asymmetric grid */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-6">
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-dark/30 mb-6">
              The Lodge
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-dark leading-[1.05]">
              Contemporary
              <br />
              comfort
            </h2>
            <div className="h-px w-12 bg-sage/50 mt-8" />
          </motion.div>

          <motion.div
            className="md:col-span-5 md:col-start-8 md:pt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="font-sans font-light text-dark/55 text-base md:text-lg leading-relaxed">
              A two-bedroom lodge with open-plan living, premium Smeg kitchen,
              and wraparound deck overlooking the lake. Bi-fold doors blur the
              line between inside and out — where modern luxury meets the wild
              beauty of North Devon.
            </p>
          </motion.div>
        </div>

        {/* Asymmetric image grid */}
        <div className="grid md:grid-cols-12 gap-4 mt-16 md:mt-20">
          <motion.div
            className="md:col-span-7 aspect-[4/3] rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="w-full h-full bg-cover bg-center img-zoom"
              style={{ backgroundImage: "url('/images/living-room.jpg')" }}
            />
          </motion.div>

          <div className="md:col-span-5 grid gap-4">
            <motion.div
              className="aspect-[3/2] rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <div
                className="w-full h-full bg-cover bg-center img-zoom"
                style={{ backgroundImage: "url('/images/kitchen.jpg')" }}
              />
            </motion.div>
            <motion.div
              className="aspect-[3/2] rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.25 }}
            >
              <div
                className="w-full h-full bg-cover bg-center img-zoom"
                style={{ backgroundImage: "url('/images/bathroom.jpg')" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-dark/8 rounded-xl overflow-hidden mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {features.map((f) => (
            <div key={f.title} className="bg-warm-white p-6 md:p-8">
              <h4 className="font-sans font-medium text-sm text-dark tracking-wide">{f.title}</h4>
              <p className="font-sans font-light text-xs text-dark/40 mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/booking"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300 shadow-lg shadow-moss/20"
          >
            Check Availability
            <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
