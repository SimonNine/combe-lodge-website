import { stripe } from "@/lib/stripe";
import Link from "next/link";
import Navigation from "@/components/ui/Navigation";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ConfirmPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return <ErrorState message="No booking reference found." />;
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    return <ErrorState message="We couldn't find your booking. Please contact us." />;
  }

  if (session.payment_status !== "paid") {
    return <ErrorState message="Payment was not completed. Please try again." />;
  }

  const meta = session.metadata;
  if (!meta) return <ErrorState message="Booking details unavailable." />;

  const checkIn = new Date(meta.checkIn + "T12:00:00");
  const checkOut = new Date(meta.checkOut + "T12:00:00");
  const totalPounds = parseInt(meta.totalAmount, 10) / 100;
  const adults = parseInt(meta.adults, 10);
  const children = parseInt(meta.children, 10);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const nights = parseInt(meta.nights, 10);

  return (
    <main className="grain min-h-screen bg-warm-white">
      <Navigation light />

      <div className="pt-24 md:pt-32 pb-24 px-6 md:px-10">
        <div className="max-w-xl mx-auto">

          {/* Success icon */}
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-full bg-sage/15 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-moss">
                <path d="M5 12L10 17L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl md:text-4xl text-dark mb-3">You&apos;re booked in.</h1>
            <p className="font-sans font-light text-dark/45 text-base">
              A confirmation has been sent to <span className="text-dark/70">{meta.guestEmail}</span>
            </p>
          </div>

          {/* Booking summary card */}
          <div className="bg-white rounded-[14px] border border-dark/5 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-dark/5">
              <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/30 mb-1">Booking reference</p>
              <p className="font-mono text-xs text-dark/50">{session_id.slice(-12).toUpperCase()}</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <Row label="Check-in" value={formatDate(checkIn)} />
              <Row label="Check-out" value={formatDate(checkOut)} />
              <Row label="Duration" value={`${nights} night${nights > 1 ? "s" : ""}`} />
              <Row
                label="Guests"
                value={`${adults} adult${adults > 1 ? "s" : ""}${children > 0 ? `, ${children} child${children > 1 ? "ren" : ""}` : ""}`}
              />
              <Row label="Guest name" value={meta.guestName} />
            </div>

            <div className="px-6 py-4 bg-stone/40 border-t border-dark/5 flex items-center justify-between">
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35">Total paid</span>
              <span className="font-serif text-lg text-dark">
                £{totalPounds.toLocaleString("en-GB")}
              </span>
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-8 space-y-4">
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/30">What happens next</p>
            <div className="space-y-3">
              <NextStep
                number="1"
                text="Check your email for full check-in details, directions and the lodge access code."
              />
              <NextStep
                number="2"
                text={`Check-in is from 4pm on ${checkIn.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}. Check-out by 10am.`}
              />
              <NextStep
                number="3"
                text="The Kentisbury Grange restaurant is on-site and available for dinner reservations — we recommend booking ahead."
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] border border-dark/10 font-sans text-sm text-dark/50 hover:bg-stone transition-colors"
            >
              Back to Combe Lodge
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/30 pt-0.5 flex-shrink-0">{label}</span>
      <span className="font-sans text-sm text-dark text-right">{value}</span>
    </div>
  );
}

function NextStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-5 h-5 rounded-full bg-sage/15 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="font-mono text-[9px] text-moss">{number}</span>
      </div>
      <p className="font-sans font-light text-sm text-dark/55 leading-relaxed">{text}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="grain min-h-screen bg-warm-white">
      <Navigation light />
      <div className="pt-32 pb-24 px-6 text-center">
        <p className="font-serif text-2xl text-dark mb-4">Something went wrong</p>
        <p className="font-sans font-light text-dark/45 mb-8">{message}</p>
        <Link href="/booking" className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-moss text-light-text font-sans text-sm hover:bg-moss-light transition-colors">
          Try again
        </Link>
      </div>
    </main>
  );
}
