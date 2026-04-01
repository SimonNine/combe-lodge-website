"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative bg-dark-overlay text-light-text">
      {/* Top divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="h-px bg-light-text/10" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Large brand name */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="font-serif text-3xl md:text-4xl text-light-text/80">Combe Lodge</h3>
          <p className="font-sans font-light text-sm text-light-text/30 mt-2">
            A luxury lodge retreat at Kentisbury Grange
          </p>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-10">
          {/* Location */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-light-text/30 mb-4">
              Location
            </h4>
            <p className="font-sans font-light text-sm text-light-text/55 leading-relaxed">
              Kentisbury Grange
              <br />
              Kentisbury, Barnstaple
              <br />
              North Devon, EX31 4NL
            </p>
            <p className="font-mono text-[10px] text-light-text/20 mt-3 tracking-wider">
              51.1842° N, 3.8531° W
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-light-text/30 mb-4">
              Contact
            </h4>
            <p className="font-sans font-light text-sm text-light-text/55 leading-relaxed">
              Kentisbury Grange Reception
            </p>
            <a
              href="tel:+441234567890"
              className="font-sans text-sm text-sage hover:text-sage-dark transition-colors mt-1 inline-block"
            >
              01234 567 890
            </a>
          </motion.div>

          {/* Links */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-mono text-[9px] tracking-[0.25em] uppercase text-light-text/30 mb-4">
              Quick Links
            </h4>
            <div className="space-y-2">
              <a href="/booking" className="block font-sans font-light text-sm text-light-text/55 hover:text-light-text transition-colors">
                Book Your Stay
              </a>
              <a href="/admin" className="block font-sans font-light text-sm text-light-text/55 hover:text-light-text transition-colors">
                Owner Login
              </a>
              <a href="/privacy" className="block font-sans font-light text-sm text-light-text/55 hover:text-light-text transition-colors">
                Privacy Policy
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-light-text/8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-light-text/20">
            &copy; {new Date().getFullYear()} Combe Lodge. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="font-mono text-[9px] tracking-[0.15em] uppercase text-light-text/20 hover:text-light-text/50 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="font-mono text-[9px] tracking-[0.15em] uppercase text-light-text/20 hover:text-light-text/50 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
