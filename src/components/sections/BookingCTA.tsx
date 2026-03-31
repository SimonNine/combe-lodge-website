"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionLabel from "../ui/SectionLabel";
import FadeIn from "../ui/FadeIn";
import LineReveal from "../ui/LineReveal";

export default function BookingCTA() {
  return (
    <section className="relative bg-warm-white overflow-hidden py-24 md:py-32">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left side — messaging */}
          <div>
            <SectionLabel number="04" label="Book Your Stay" />

            <FadeIn delay={0.1}>
              <h2 className="font-serif text-4xl md:text-5xl text-dark mt-6 leading-[1.1]">
                Your valley
                <br />
                awaits
              </h2>
            </FadeIn>

            <FadeIn delay={0.15}>
              <LineReveal className="my-6" delay={0.2} />
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="font-sans font-light text-dark/55 text-base md:text-lg leading-relaxed">
                Book directly with us for the best rate — no middlemen, no
                inflated prices. Just you, the lodge, and the North Devon
                countryside.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-8 space-y-0">
                <Detail label="Check-in" value="From 4:00 PM" />
                <Detail label="Check-out" value="By 10:00 AM" />
                <Detail label="Minimum stay" value="2 nights" />
                <Detail label="Sleeps" value="Up to 4 guests" />
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Link
                href="/booking"
                className="group inline-flex items-center gap-2 mt-10 px-9 py-4 rounded-[10px] bg-moss text-light-text font-sans font-medium text-base tracking-wide hover:bg-moss-light transition-all duration-300 shadow-lg shadow-moss/20"
              >
                Check Availability & Book
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  &rarr;
                </span>
              </Link>
            </FadeIn>
          </div>

          {/* Right side — image collage */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
              className="aspect-[3/4] rounded-[10px] overflow-hidden col-span-2 shadow-xl shadow-dark/5"
            >
              <div
                className="w-full h-full bg-cover bg-center img-zoom"
                style={{ backgroundImage: `url('/images/deck-view.jpg')` }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
              className="aspect-square rounded-[10px] overflow-hidden shadow-xl shadow-dark/5"
            >
              <div
                className="w-full h-full bg-cover bg-center img-zoom"
                style={{ backgroundImage: `url('/images/bathroom.jpg')` }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="aspect-square rounded-[10px] overflow-hidden shadow-xl shadow-dark/5"
            >
              <div
                className="w-full h-full bg-cover bg-center img-zoom"
                style={{ backgroundImage: `url('/images/kitchen.jpg')` }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between border-b border-dark/8 py-3.5"
    >
      <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-dark/40">
        {label}
      </span>
      <span className="font-sans font-light text-sm text-dark/70">{value}</span>
    </motion.div>
  );
}
