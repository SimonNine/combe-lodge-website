"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function BookingCTA() {
  return (
    <section className="relative bg-warm-white overflow-hidden py-24 md:py-36">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-10 md:gap-6 items-center">
          {/* Left — image collage */}
          <div className="md:col-span-6 relative">
            <motion.div
              className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-dark/8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div
                className="w-full h-full bg-cover bg-center img-zoom"
                style={{ backgroundImage: "url('/images/deck-view.jpg')" }}
              />
            </motion.div>
            <motion.div
              className="absolute -bottom-6 -right-4 md:right-auto md:-left-6 w-[45%] aspect-square rounded-xl overflow-hidden shadow-2xl shadow-dark/10 border-4 border-warm-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div
                className="w-full h-full bg-cover bg-center img-zoom"
                style={{ backgroundImage: "url('/images/hot-tub.jpg')" }}
              />
            </motion.div>
          </div>

          {/* Right — text + details */}
          <motion.div
            className="md:col-span-5 md:col-start-8 pt-8 md:pt-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-dark/30 mb-6">
              Book Your Stay
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-5xl text-dark leading-[1.05]">
              Your valley
              <br />
              awaits
            </h2>
            <p className="font-sans font-light text-dark/50 text-base leading-relaxed mt-6 max-w-sm">
              Book directly with us for the best rate — no middlemen, no
              inflated prices. Just you, the lodge, and the North Devon countryside.
            </p>

            {/* Details table */}
            <div className="mt-8 space-y-0">
              <Detail label="Check-in" value="From 4:00 PM" />
              <Detail label="Check-out" value="By 10:00 AM" />
              <Detail label="Minimum stay" value="2 nights" />
              <Detail label="Sleeps" value="Up to 4 guests" />
            </div>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                href="/booking"
                className="group inline-flex items-center gap-2 px-9 py-4 rounded-[10px] bg-dark text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss transition-all duration-300"
              >
                Check Availability & Book
                <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
              </Link>
              <Link
                href="/postcard"
                className="group inline-flex items-center gap-2 px-6 py-4 rounded-[10px] border border-dark/12 text-dark/55 font-sans font-light text-sm tracking-wide hover:border-dark/25 hover:text-dark transition-all duration-300"
              >
                <span className="text-base">✉</span>
                Send a Postcard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dark/8 py-3.5">
      <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dark/35">{label}</span>
      <span className="font-sans font-light text-sm text-dark/65">{value}</span>
    </div>
  );
}
