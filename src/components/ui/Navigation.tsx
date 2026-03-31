"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// light=true → dark text (for light-background pages like /booking)
// light=false (default) → light text (for dark-background pages like homepage hero)
export default function Navigation({ light = false }: { light?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navBg = light
    ? "bg-white/90 backdrop-blur-xl border-b border-dark/5 shadow-sm"
    : scrolled
    ? "bg-dark-overlay/80 backdrop-blur-xl border-b border-white/5"
    : "bg-transparent";

  const logoColor = light ? "text-dark" : "text-light-text";
  const linkColor = light ? "text-dark/55 hover:text-dark" : "text-light-text/70 hover:text-light-text";
  const hamburgerColor = light ? "bg-dark" : "bg-light-text";

  // Opaque colour that always blocks content showing through the iOS status bar area
  const safeAreaBg = light ? "rgba(255,255,255,1)" : "rgba(10,26,18,1)";

  return (
    <>
      {/* Permanently opaque safe-area fill — prevents page content bleeding into the status bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: "env(safe-area-inset-top, 0px)", background: safeAreaBg }}
      />

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <span className={`font-serif text-xl md:text-2xl ${logoColor}`}>
                Combe Lodge
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#experience" className={`text-sm font-sans font-light tracking-wide transition-colors ${linkColor}`}>
                Experience
              </Link>
              <Link href="#setting" className={`text-sm font-sans font-light tracking-wide transition-colors ${linkColor}`}>
                The Setting
              </Link>
              <Link
                href="/booking"
                className="px-5 py-2 rounded-lg bg-moss/80 hover:bg-moss text-light-text text-sm font-sans transition-colors"
              >
                Book Your Stay
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className={`block w-6 h-px ${hamburgerColor}`}
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                className={`block w-6 h-px ${hamburgerColor}`}
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className={`block w-6 h-px ${hamburgerColor}`}
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-dark-overlay/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            <MobileNavLink href="#experience" onClick={() => setMenuOpen(false)}>Experience</MobileNavLink>
            <MobileNavLink href="#setting" onClick={() => setMenuOpen(false)}>The Setting</MobileNavLink>
            <MobileNavLink href="/booking" onClick={() => setMenuOpen(false)}>Book Your Stay</MobileNavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Link href={href} onClick={onClick} className="text-light-text text-3xl font-serif">{children}</Link>
    </motion.div>
  );
}
