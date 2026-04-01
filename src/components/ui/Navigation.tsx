"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import WeatherWidget from "./WeatherWidget";

export default function Navigation({ light = false }: { light?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // In dark mode, always use the dark nav style
  const isDarkNav = theme === "dark" ? true : !light;

  const navBg = !isDarkNav
    ? "bg-white/90 backdrop-blur-xl border-b border-dark/5 shadow-sm"
    : scrolled
    ? "bg-dark-overlay/80 backdrop-blur-xl border-b border-white/5"
    : "bg-transparent";

  const logoColor = isDarkNav ? "text-light-text" : "text-dark";
  const linkColor = isDarkNav ? "text-light-text/70 hover:text-light-text" : "text-dark/55 hover:text-dark";
  const hamburgerColor = isDarkNav ? "bg-light-text" : "bg-dark";
  const safeAreaBg = isDarkNav ? "rgba(10,26,18,1)" : (theme === "dark" ? "rgba(20,20,19,1)" : "rgba(255,255,255,1)");

  return (
    <>
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
            <div className="hidden md:flex items-center gap-6">
              <WeatherWidget isDark={isDarkNav} />
              <Link href="#experience" className={`text-sm font-sans font-light tracking-wide transition-colors ${linkColor}`}>
                Experience
              </Link>
              <Link href="#setting" className={`text-sm font-sans font-light tracking-wide transition-colors ${linkColor}`}>
                The Setting
              </Link>
              <Link href="/guestbook" className={`text-sm font-sans font-light tracking-wide transition-colors ${linkColor}`}>
                Guestbook
              </Link>

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className={`p-2 rounded-lg transition-colors ${isDarkNav ? "text-light-text/50 hover:text-light-text" : "text-dark/40 hover:text-dark"}`}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === "light" ? (
                    <motion.svg key="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </motion.svg>
                  ) : (
                    <motion.svg key="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </button>

              <Link
                href="/booking"
                className="px-5 py-2 rounded-lg bg-moss/80 hover:bg-moss text-light-text text-sm font-sans transition-colors"
              >
                Book Your Stay
              </Link>
            </div>

            {/* Mobile: weather + theme + hamburger */}
            <div className="md:hidden flex items-center gap-3">
              <WeatherWidget isDark={isDarkNav} compact />
              <button
                onClick={toggle}
                className={`p-1.5 ${isDarkNav ? "text-light-text/50" : "text-dark/40"}`}
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex flex-col gap-1.5 p-2"
                aria-label="Toggle menu"
              >
                <motion.span animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className={`block w-6 h-px ${hamburgerColor}`} />
                <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className={`block w-6 h-px ${hamburgerColor}`} />
                <motion.span animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className={`block w-6 h-px ${hamburgerColor}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
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
            <MobileNavLink href="/guestbook" onClick={() => setMenuOpen(false)}>Guestbook</MobileNavLink>
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
