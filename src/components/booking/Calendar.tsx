"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, getRateForDate, formatPrice, DEFAULT_PRICING, type PricingConfig } from "@/lib/booking-rules";

interface CalendarProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onSelectDate: (date: Date) => void;
  bookedDates?: string[];
  blockedDates?: string[];
  pricing?: PricingConfig;
}

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Calendar({
  checkIn,
  checkOut,
  onSelectDate,
  bookedDates = [],
  blockedDates = [],
  pricing = DEFAULT_PRICING,
}: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [direction, setDirection] = useState(0);

  // Start from next month if all dates this month are past
  useMemo(() => {
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    if (today.getDate() === lastDayOfMonth.getDate()) {
      setCurrentMonth((today.getMonth() + 1) % 12);
      if (today.getMonth() === 11) setCurrentYear(today.getFullYear() + 1);
    }
  }, []);

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(currentYear, currentMonth, d));
    }
    return days;
  }, [currentMonth, currentYear]);

  const goToPrevMonth = () => {
    setDirection(-1);
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const goToNextMonth = () => {
    setDirection(1);
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const isDateInPast = (date: Date) => date < today;
  const isDateBooked = (date: Date) => bookedDates.includes(formatDate(date));
  const isDateBlocked = (date: Date) => blockedDates.includes(formatDate(date));
  const isDateUnavailable = (date: Date) =>
    isDateInPast(date) || isDateBooked(date) || isDateBlocked(date);

  const isCheckIn = (date: Date) =>
    checkIn && formatDate(date) === formatDate(checkIn);
  const isCheckOut = (date: Date) =>
    checkOut && formatDate(date) === formatDate(checkOut);
  const isInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  };

  const canGoPrev =
    currentYear > today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth > today.getMonth());

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <AnimatePresence mode="wait">
          <motion.span
            key={`${currentMonth}-${currentYear}`}
            initial={{ opacity: 0, x: direction * 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -15 }}
            transition={{ duration: 0.15 }}
            className="font-serif text-base text-dark"
          >
            {MONTHS[currentMonth]} {currentYear}
          </motion.span>
        </AnimatePresence>

        <button
          onClick={goToNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((day) => (
          <div key={day} className="text-center font-mono text-[9px] tracking-[0.15em] uppercase text-dark/25 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentMonth}-${currentYear}`}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="grid grid-cols-7 gap-0.5"
        >
          {daysInMonth.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="h-12" />;

            const unavailable = isDateUnavailable(date);
            const booked = isDateBooked(date);
            const selected = isCheckIn(date) || isCheckOut(date);
            const inRange = isInRange(date);
            const nightlyRate = !unavailable ? getRateForDate(date, pricing) : 0;

            return (
              <motion.button
                key={formatDate(date)}
                onClick={() => !unavailable && onSelectDate(date)}
                disabled={unavailable}
                whileHover={!unavailable ? { scale: 1.05 } : undefined}
                whileTap={!unavailable ? { scale: 0.95 } : undefined}
                className={`
                  h-12 relative flex flex-col items-center justify-center rounded-lg text-xs font-sans transition-all duration-150
                  ${unavailable ? "text-dark/12 cursor-not-allowed" : "text-dark cursor-pointer hover:bg-sage/10"}
                  ${selected ? "bg-moss text-light-text hover:bg-moss-light" : ""}
                  ${inRange ? "bg-sage/8" : ""}
                  ${booked ? "line-through" : ""}
                `}
              >
                <span className="font-medium">{date.getDate()}</span>
                {!unavailable && !selected && (
                  <span className="text-[8px] font-bold leading-none mt-0.5 px-1 py-px rounded-sm bg-moss text-light-text/90">
                    {formatPrice(nightlyRate).replace("£", "£")}
                  </span>
                )}
                {selected && isCheckIn(date) && (
                  <span className="text-[7px] leading-none text-light-text/70 mt-0.5 uppercase tracking-wider">in</span>
                )}
                {selected && isCheckOut(date) && (
                  <span className="text-[7px] leading-none text-light-text/70 mt-0.5 uppercase tracking-wider">out</span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
