"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Calendar from "@/components/booking/Calendar";
import FriendlyMessage from "@/components/ui/FriendlyMessage";
import {
  validateBooking,
  calculatePrice,
  formatPrice,
  DEFAULT_RULES,
  DEFAULT_PRICING,
  BookingRules,
  PricingConfig,
} from "@/lib/booking-rules";

export default function FloatingBookButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [adminPricing, setAdminPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [adminRules, setAdminRules] = useState<BookingRules>(DEFAULT_RULES);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [heroVisible, setHeroVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Watch the hero section — on mobile, hide button while hero is still in view
  useEffect(() => {
    const hero = document.querySelector("section");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.pricing) setAdminPricing(d.pricing);
        if (d.rules) setAdminRules(d.rules);
      })
      .catch(() => {});
    fetch("/api/availability")
      .then((r) => r.json())
      .then((d) => {
        if (d.bookedDates) setBookedDates(d.bookedDates);
      })
      .catch(() => {});
  }, []);

  // All hooks must run before any early return
  const pricing = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return calculatePrice(checkIn, checkOut, adminPricing);
  }, [checkIn, checkOut, adminPricing]);

  // Don't show on the booking page itself
  if (pathname === "/booking") return null;

  const totalGuests = adults + children;

  const handleSelectDate = (date: Date) => {
    setError(null);
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
    } else {
      if (date <= checkIn) {
        setCheckIn(date);
        setCheckOut(null);
      } else {
        const validation = validateBooking(
          checkIn, date, adminRules, adminPricing, bookedDates
        );
        if (!validation.valid) {
          setError(validation.error || "Invalid dates");
        } else {
          setCheckOut(date);
        }
      }
    }
  };

  const toLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleBook = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", toLocalDateString(checkIn));
    if (checkOut) params.set("checkOut", toLocalDateString(checkOut));
    params.set("adults", adults.toString());
    params.set("children", children.toString());
    router.push(`/booking?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile: full-width bottom bar — hidden until hero scrolls out of view */}
      <AnimatePresence>
        {!isOpen && !heroVisible && (
          <motion.button
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            onClick={() => setIsOpen(true)}
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 py-4 px-6 bg-moss text-light-text font-sans font-medium text-sm tracking-wide shadow-2xl shadow-moss/30 cursor-pointer"
            style={{ borderRadius: "10px 10px 0 0" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 2V4.5M11 2V4.5M2 7H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Book Your Stay
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop: floating pill — always visible when not on booking page */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            onClick={() => setIsOpen(true)}
            className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-5 py-3 rounded-full bg-moss text-light-text font-sans font-medium text-sm tracking-wide shadow-xl shadow-moss/30 hover:bg-moss-light hover:shadow-2xl hover:shadow-moss/40 transition-all duration-300 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 2V4.5M11 2V4.5M2 7H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Book Your Stay
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-dark-overlay/30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mini booking modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-50 md:w-[360px] md:max-h-[calc(100vh-48px)] overflow-y-auto bg-white md:rounded-[14px] shadow-2xl border border-dark/5"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark/5">
              <h3 className="font-serif text-base text-dark">Book Your Stay</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center rounded-lg hover:bg-stone transition-colors text-dark/40 hover:text-dark/60"
              >
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Guest selectors */}
            <div className="px-4 py-3 border-b border-dark/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-dark/30">Adults</span>
                    <CounterBtn onClick={() => setAdults(Math.max(1, adults - 1))} label="-" />
                    <span className="w-5 text-center font-sans text-xs text-dark">{adults}</span>
                    <CounterBtn onClick={() => setAdults(Math.min(4, adults + 1))} label="+" disabled={totalGuests >= 4} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-dark/30">Children</span>
                    <CounterBtn onClick={() => setChildren(Math.max(0, children - 1))} label="-" />
                    <span className="w-5 text-center font-sans text-xs text-dark">{children}</span>
                    <CounterBtn onClick={() => setChildren(Math.min(3, children + 1))} label="+" disabled={totalGuests >= 4} />
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="p-4">
              <Calendar
                checkIn={checkIn}
                checkOut={checkOut}
                onSelectDate={handleSelectDate}
                bookedDates={bookedDates}
                pricing={adminPricing}
              />

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <div className="mt-2">
                    <FriendlyMessage message={error} />
                  </div>
                )}
              </AnimatePresence>

              {/* Helper text */}
              <p className="font-sans font-light text-dark/30 text-[11px] mt-2">
                {!checkIn
                  ? "Select check-in date"
                  : !checkOut
                  ? "Select check-out date"
                  : `${pricing?.nights} night${pricing && pricing.nights > 1 ? "s" : ""} selected`}
              </p>
            </div>

            {/* Price + Book button */}
            <div className="px-4 pb-4">
              {pricing && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-stone/50"
                >
                  <div>
                    <span className="font-sans font-light text-xs text-dark/50">
                      {pricing.nights} night{pricing.nights > 1 ? "s" : ""} + cleaning
                    </span>
                    {pricing.discount && (
                      <span className="ml-1.5 font-mono text-[9px] px-1.5 py-0.5 rounded bg-moss/15 text-moss font-bold">
                        {pricing.discount.discountPercent}% off
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pricing.discount && pricing.undiscountedTotal > pricing.total && (
                      <span className="font-sans text-xs text-dark/30 line-through">
                        {formatPrice(pricing.undiscountedTotal)}
                      </span>
                    )}
                    <span className="font-serif text-base text-dark">
                      {formatPrice(pricing.total)}
                    </span>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleBook}
                disabled={!checkIn || !checkOut}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300 shadow-lg shadow-moss/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {checkIn && checkOut ? (
                  <>
                    Book Now
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                ) : checkIn ? "Now select check-out date" : "Select your dates above"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CounterBtn({
  onClick,
  label,
  disabled = false,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-5 h-5 flex items-center justify-center rounded border border-dark/10 text-dark/35 hover:border-dark/20 hover:text-dark/55 transition-colors disabled:opacity-15 disabled:cursor-not-allowed text-xs font-sans"
    >
      {label}
    </button>
  );
}
