"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative bg-dark-overlay text-light-text py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-serif text-2xl">Combe Lodge</h3>
            <p className="font-sans font-light text-sm text-light-text/50 mt-3 leading-relaxed">
              A luxury lodge retreat at Kentisbury Grange, North Devon.
            </p>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-mono text-xs tracking-[0.2em] uppercase text-light-text/40 mb-4">
              Location
            </h4>
            <p className="font-sans font-light text-sm text-light-text/70 leading-relaxed">
              Kentisbury Grange
              <br />
              Kentisbury, Barnstaple
              <br />
              North Devon, EX31 4NL
            </p>
            <p className="font-mono text-xs text-light-text/30 mt-3 tracking-wider">
              51.1842° N, 3.8531° W
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-mono text-xs tracking-[0.2em] uppercase text-light-text/40 mb-4">
              Contact
            </h4>
            <p className="font-sans font-light text-sm text-light-text/70 leading-relaxed">
              For booking enquiries and changes:
            </p>
            <p className="font-sans text-sm text-light-text/70 mt-2">
              Kentisbury Grange Reception
              <br />
              <a
                href="tel:+441234567890"
                className="text-sage hover:text-sage-dark transition-colors"
              >
                01234 567 890
              </a>
            </p>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-light-text/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-light-text/30">
            &copy; {new Date().getFullYear()} Combe Lodge. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-light-text/30 hover:text-light-text/60 transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-light-text/30 hover:text-light-text/60 transition-colors"
            >
              Terms
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
