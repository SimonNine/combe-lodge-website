"use client";

import { motion } from "framer-motion";
import { formatPrice, type DiscountPeriod } from "@/lib/booking-rules";

interface PriceSummaryProps {
  nights: number;
  nightlyBreakdown: { date: string; rate: number }[];
  subtotal: number;
  cleaningFee: number;
  total: number;
  deposit: number;
  checkIn: Date;
  checkOut: Date;
  discount?: DiscountPeriod | null;
  undiscountedTotal?: number;
}

export default function PriceSummary({
  nights,
  nightlyBreakdown,
  subtotal,
  cleaningFee,
  total,
  deposit,
  checkIn,
  checkOut,
  discount,
  undiscountedTotal,
}: PriceSummaryProps) {
  const avgNightlyRate = Math.round(subtotal / nights);
  const allSameRate = nightlyBreakdown.every(
    (n) => n.rate === nightlyBreakdown[0].rate
  );
  const hasDiscount = discount && undiscountedTotal && undiscountedTotal > total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      className="bg-stone rounded-[10px] p-6"
    >
      <h3 className="font-serif text-lg text-dark">Your Stay</h3>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dark/40">
            Check-in
          </span>
          <span className="font-sans text-sm text-dark">
            {formatDateDisplay(checkIn)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dark/40">
            Check-out
          </span>
          <span className="font-sans text-sm text-dark">
            {formatDateDisplay(checkOut)}
          </span>
        </div>

        <div className="h-px bg-dark/8 my-2" />

        {allSameRate ? (
          <div className="flex justify-between items-center">
            <span className="font-sans font-light text-sm text-dark/60">
              {formatPrice(nightlyBreakdown[0].rate)} x {nights} night
              {nights > 1 ? "s" : ""}
            </span>
            <span className="font-sans text-sm text-dark">
              {formatPrice(subtotal)}
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="font-sans font-light text-sm text-dark/60">
              {nights} night{nights > 1 ? "s" : ""} (avg{" "}
              {formatPrice(avgNightlyRate)}/night)
            </span>
            <span className="font-sans text-sm text-dark">
              {formatPrice(subtotal)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-sans font-light text-sm text-dark/60">
            Cleaning fee
          </span>
          <span className="font-sans text-sm text-dark">
            {formatPrice(cleaningFee)}
          </span>
        </div>

        {hasDiscount && (
          <div className="flex justify-between items-center text-sage-dark">
            <span className="font-sans font-light text-sm">
              {discount.name} ({discount.discountPercent}% off)
            </span>
            <span className="font-sans text-sm">
              -{formatPrice(undiscountedTotal - total)}
            </span>
          </div>
        )}

        <div className="h-px bg-dark/8 my-2" />

        <div className="flex justify-between items-center">
          <span className="font-sans font-medium text-base text-dark">Total</span>
          <div className="text-right">
            {hasDiscount && (
              <span className="font-sans text-sm text-dark/30 line-through block">
                {formatPrice(undiscountedTotal)}
              </span>
            )}
            <span className="font-serif text-xl text-dark">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {hasDiscount && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-lg bg-sage/15 border border-sage/30 px-3 py-2.5 flex items-start gap-2"
          >
            <span className="text-sage-dark text-sm mt-px">✦</span>
            <p className="font-sans text-xs text-dark/70 leading-relaxed">
              <span className="font-medium text-dark">{discount.name}</span> — a {discount.discountPercent}% discount has been applied to your stay.
            </p>
          </motion.div>
        )}

        {deposit < total && (
          <div className="flex justify-between items-center text-sage-dark">
            <span className="font-sans font-light text-sm">Due today (deposit)</span>
            <span className="font-sans font-medium text-sm">
              {formatPrice(deposit)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
