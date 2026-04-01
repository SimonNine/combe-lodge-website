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
        {/* Dates */}
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dark/40">Check-in</span>
          <span className="font-sans text-sm text-dark">{formatDateDisplay(checkIn)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dark/40">Check-out</span>
          <span className="font-sans text-sm text-dark">{formatDateDisplay(checkOut)}</span>
        </div>

        <div className="h-px bg-dark/8 my-1" />

        {/* Accommodation */}
        {allSameRate ? (
          <div className="flex justify-between items-center gap-3">
            <span className="font-sans font-light text-sm text-dark/60">
              {formatPrice(nightlyBreakdown[0].rate)} &times; {nights} night{nights > 1 ? "s" : ""}
            </span>
            <PricePill value={formatPrice(subtotal)} />
          </div>
        ) : (
          <div className="flex justify-between items-center gap-3">
            <span className="font-sans font-light text-sm text-dark/60">
              {nights} night{nights > 1 ? "s" : ""}{" "}
              <span className="text-dark/35 text-xs">(avg {formatPrice(avgNightlyRate)}/night)</span>
            </span>
            <PricePill value={formatPrice(subtotal)} />
          </div>
        )}

        {/* Cleaning fee */}
        <div className="flex justify-between items-center gap-3">
          <span className="font-sans font-light text-sm text-dark/60">Cleaning fee</span>
          <PricePill value={formatPrice(cleaningFee)} />
        </div>

        {/* Discount */}
        {hasDiscount && (
          <div className="flex justify-between items-center gap-3">
            <span className="font-sans font-light text-sm text-sage-dark">
              {discount.name} ({discount.discountPercent}% off)
            </span>
            <PricePill value={`-${formatPrice(undiscountedTotal - total)}`} variant="discount" />
          </div>
        )}

        <div className="h-px bg-dark/8 my-1" />

        {/* Total */}
        <div className="flex justify-between items-center gap-3">
          <span className="font-sans font-medium text-base text-dark">Total</span>
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="font-sans text-xs text-dark/30 line-through">{formatPrice(undiscountedTotal)}</span>
            )}
            <PricePill value={formatPrice(total)} variant="total" />
          </div>
        </div>

        {/* Discount banner */}
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

        {/* Deposit */}
        {deposit < total && (
          <div className="flex justify-between items-center gap-3 pt-1">
            <span className="font-sans font-light text-sm text-dark/60">Due today (deposit)</span>
            <PricePill value={formatPrice(deposit)} variant="deposit" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PricePill({
  value,
  variant = "default",
}: {
  value: string;
  variant?: "default" | "discount" | "total" | "deposit";
}) {
  const styles = {
    default: "bg-white/70 border border-dark/8 text-dark",
    discount: "bg-sage/15 border border-sage/30 text-sage-dark",
    total: "bg-dark text-light-text border border-transparent",
    deposit: "bg-moss/10 border border-moss/20 text-moss",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full font-mono text-xs font-medium whitespace-nowrap flex-shrink-0 ${styles[variant]}`}
    >
      {value}
    </span>
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
