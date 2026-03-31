"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/ui/Navigation";
import Calendar from "@/components/booking/Calendar";
import PriceSummary from "@/components/booking/PriceSummary";
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

type BookingStep = "dates" | "details" | "confirm";

function BookingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [step, setStep] = useState<BookingStep>("dates");
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Guest config
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Guest details form
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Admin config — loaded on mount so pricing/rules stay in sync with admin settings
  const [adminPricing, setAdminPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [adminRules, setAdminRules] = useState<BookingRules>(DEFAULT_RULES);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

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

  // Pre-populate from URL params (e.g. from floating book button)
  useEffect(() => {
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");
    const adultsParam = searchParams.get("adults");
    const childrenParam = searchParams.get("children");

    if (checkInParam) {
      const d = new Date(checkInParam + "T12:00:00");
      if (!isNaN(d.getTime())) setCheckIn(d);
    }
    if (checkOutParam) {
      const d = new Date(checkOutParam + "T12:00:00");
      if (!isNaN(d.getTime())) setCheckOut(d);
    }
    if (adultsParam) {
      const n = parseInt(adultsParam, 10);
      if (!isNaN(n) && n >= 1 && n <= 4) setAdults(n);
    }
    if (childrenParam) {
      const n = parseInt(childrenParam, 10);
      if (!isNaN(n) && n >= 0 && n <= 3) setChildren(n);
    }
  }, [searchParams]);

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
        const validation = validateBooking(checkIn, date, adminRules, adminPricing, bookedDates);
        if (!validation.valid) {
          setError(validation.error || "Invalid dates");
        } else {
          setCheckOut(date);
        }
      }
    }
  };

  const pricing = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return calculatePrice(checkIn, checkOut, adminPricing);
  }, [checkIn, checkOut, adminPricing]);

  const canProceedToDates = checkIn && checkOut && pricing;
  const canProceedToDetails = guestName.trim() && guestEmail.trim() && guestPhone.trim();

  const handleCheckout = async () => {
    if (!checkIn || !checkOut || !pricing) return;
    setIsRedirecting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: checkIn.toISOString().split("T")[0],
          checkOut: checkOut.toISOString().split("T")[0],
          adults,
          children,
          guestName,
          guestEmail,
          guestPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to start checkout");
      }
      router.push(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="pt-24 md:pt-28 pb-16 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase text-dark/40 hover:text-dark/60 transition-colors mb-6"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to lodge
            </Link>

            <h1 className="font-serif text-3xl md:text-4xl text-dark">
              Book Your Stay
            </h1>
          </motion.div>

          {/* Guest configuration bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-6 flex flex-wrap items-center gap-4 p-4 bg-white rounded-[10px] shadow-sm border border-dark/5"
          >
            <div className="flex items-center gap-3">
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35">Adults</label>
              <div className="flex items-center gap-1">
                <CounterButton onClick={() => setAdults(Math.max(1, adults - 1))} label="-" />
                <span className="w-8 text-center font-sans text-sm text-dark">{adults}</span>
                <CounterButton onClick={() => setAdults(Math.min(4, adults + 1))} label="+" disabled={totalGuests >= 4} />
              </div>
            </div>

            <div className="w-px h-6 bg-dark/8" />

            <div className="flex items-center gap-3">
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35">Children <span className="normal-case">(5+)</span></label>
              <div className="flex items-center gap-1">
                <CounterButton onClick={() => setChildren(Math.max(0, children - 1))} label="-" />
                <span className="w-8 text-center font-sans text-sm text-dark">{children}</span>
                <CounterButton onClick={() => setChildren(Math.min(3, children + 1))} label="+" disabled={totalGuests >= 4} />
              </div>
            </div>

            <div className="w-px h-6 bg-dark/8" />

            <div className="font-sans font-light text-xs text-dark/40">
              {totalGuests} guest{totalGuests > 1 ? "s" : ""} &middot; Max 4
            </div>

            {checkIn && (
              <>
                <div className="w-px h-6 bg-dark/8" />
                <button
                  onClick={() => setStep("dates")}
                  className="group flex items-center gap-1.5 font-sans text-xs text-dark/60 hover:text-moss transition-colors cursor-pointer"
                  title="Click to change dates"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-dark/25 group-hover:text-moss transition-colors">
                    <rect x="1.5" y="2.5" width="9" height="7.5" rx="1" stroke="currentColor" strokeWidth="1" />
                    <path d="M4 1.5V3.5M8 1.5V3.5M1.5 5H10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  {checkIn.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  {checkOut && (
                    <>
                      {" "}&rarr;{" "}
                      {checkOut.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </>
                  )}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-dark/20 group-hover:text-moss/60 transition-colors">
                    <path d="M7.5 4L5 6.5L2.5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            {pricing && (
              <>
                <div className="w-px h-6 bg-dark/8" />
                <div className="font-serif text-sm text-dark">
                  {formatPrice(pricing.total)}
                </div>
              </>
            )}
          </motion.div>

          {/* Steps indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex gap-6 mt-6 mb-8"
          >
            <StepIndicator number="1" label="Dates" active={step === "dates"} completed={step !== "dates"} />
            <StepIndicator number="2" label="Details" active={step === "details"} completed={step === "confirm"} />
            <StepIndicator number="3" label="Payment" active={step === "confirm"} completed={false} />
          </motion.div>

          <div className="grid md:grid-cols-[1fr,340px] gap-8 md:gap-10">
            {/* Left column */}
            <div>
              <AnimatePresence mode="wait">
                {step === "dates" && (
                  <motion.div key="dates" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}>
                    <div className="bg-white rounded-[10px] p-5 md:p-6 shadow-sm border border-dark/5">
                      <Calendar
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onSelectDate={handleSelectDate}
                        bookedDates={bookedDates}
                        pricing={adminPricing}
                      />
                    </div>

                    <AnimatePresence>
                      {error && (
                        <div className="mt-3">
                          <FriendlyMessage message={error} />
                        </div>
                      )}
                    </AnimatePresence>

                    <p className="font-sans font-light text-dark/35 text-xs mt-3">
                      {!checkIn ? "Select your check-in date" : !checkOut ? "Now select your check-out date" : "Dates selected — review pricing and continue"}
                    </p>

                    {canProceedToDates && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setStep("details")}
                        className="mt-5 inline-flex items-center gap-2 px-7 py-3 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300 shadow-lg shadow-moss/20"
                      >
                        Continue &rarr;
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {step === "details" && (
                  <motion.div key="details" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}>
                    <div className="bg-white rounded-[10px] p-5 md:p-6 shadow-sm border border-dark/5 space-y-4">
                      <h3 className="font-serif text-lg text-dark">Guest Details</h3>
                      <FormField label="Full name" value={guestName} onChange={setGuestName} placeholder="Your full name" />
                      <FormField label="Email" type="email" value={guestEmail} onChange={setGuestEmail} placeholder="your@email.com" />
                      <FormField label="Phone" type="tel" value={guestPhone} onChange={setGuestPhone} placeholder="+44 7123 456 789" />
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setStep("dates")} className="px-5 py-3 rounded-[10px] border border-dark/10 font-sans text-sm text-dark/50 hover:bg-stone transition-colors">
                        &larr; Back
                      </button>
                      <button
                        onClick={() => canProceedToDetails && setStep("confirm")}
                        disabled={!canProceedToDetails}
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300 shadow-lg shadow-moss/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Continue &rarr;
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "confirm" && (
                  <motion.div key="confirm" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}>
                    <div className="bg-white rounded-[10px] p-5 md:p-6 shadow-sm border border-dark/5">
                      <h3 className="font-serif text-lg text-dark mb-4">Confirm & Pay</h3>
                      <div className="space-y-2.5">
                        <ConfirmRow label="Guest" value={guestName} />
                        <ConfirmRow label="Email" value={guestEmail} />
                        <ConfirmRow label="Phone" value={guestPhone} />
                        <ConfirmRow label="Guests" value={`${adults} adult${adults > 1 ? "s" : ""}${children > 0 ? `, ${children} child${children > 1 ? "ren" : ""}` : ""}`} />
                      </div>
                      <div className="h-px bg-dark/6 my-4" />
                      <p className="font-sans font-light text-dark/45 text-sm leading-relaxed">
                        You&apos;ll be redirected to our secure payment page. After payment, you&apos;ll receive a confirmation email with check-in instructions and a calendar download.
                      </p>
                    </div>
                    {error && (
                      <div className="mt-4">
                        <FriendlyMessage message={error} />
                      </div>
                    )}
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setStep("details")} disabled={isRedirecting} className="px-5 py-3 rounded-[10px] border border-dark/10 font-sans text-sm text-dark/50 hover:bg-stone transition-colors disabled:opacity-40">
                        &larr; Back
                      </button>
                      <button
                        onClick={handleCheckout}
                        disabled={isRedirecting}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300 shadow-lg shadow-moss/20 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isRedirecting ? (
                          <>
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 8" />
                            </svg>
                            Redirecting to payment&hellip;
                          </>
                        ) : (
                          <>
                            Pay {pricing && formatPrice(pricing.deposit)}
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right column — sticky price summary */}
            <div className="md:sticky md:top-24 md:self-start space-y-5">
              {pricing ? (
                <PriceSummary
                  nights={pricing.nights}
                  nightlyBreakdown={pricing.nightlyBreakdown}
                  subtotal={pricing.subtotal}
                  cleaningFee={pricing.cleaningFee}
                  total={pricing.total}
                  deposit={pricing.deposit}
                  checkIn={checkIn!}
                  checkOut={checkOut!}
                  discount={pricing.discount}
                  undiscountedTotal={pricing.undiscountedTotal}
                />
              ) : (
                <div className="bg-stone/50 rounded-[10px] p-5 text-center border border-dark/5">
                  <p className="font-serif text-base text-dark/25">Select dates to see pricing</p>
                </div>
              )}

              <div className="space-y-2.5">
                <TrustItem text="Secure payment via Stripe" />
                <TrustItem text="Free cancellation up to 7 days before" />
                <TrustItem text="Instant confirmation with calendar download" />
                <TrustItem text="Best rate guaranteed — book direct" />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function BookingPage() {
  return (
    <main className="grain min-h-screen bg-warm-white">
      <Navigation light />
      <Suspense>
        <BookingPageInner />
      </Suspense>
    </main>
  );
}

function CounterButton({ onClick, label, disabled = false }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded-md border border-dark/10 text-dark/40 hover:border-dark/20 hover:text-dark/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-sm font-sans"
    >
      {label}
    </button>
  );
}

function StepIndicator({ number, label, active, completed }: { number: string; label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-sans transition-colors ${active ? "bg-moss text-light-text" : completed ? "bg-sage/25 text-dark/50" : "bg-dark/5 text-dark/20"}`}>
        {completed ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> : number}
      </div>
      <span className={`font-mono text-[9px] tracking-[0.15em] uppercase ${active ? "text-dark" : "text-dark/25"}`}>{label}</span>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35 block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full p-2.5 rounded-lg border border-dark/8 font-sans text-sm text-dark placeholder:text-dark/20 bg-transparent focus:outline-none focus:border-sage transition-colors" />
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35">{label}</span>
      <span className="font-sans text-sm text-dark">{value}</span>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-sage flex-shrink-0"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span className="font-sans font-light text-[11px] text-dark/35">{text}</span>
    </div>
  );
}
