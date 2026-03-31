"use client";

import { useState, useEffect } from "react";

interface Booking {
  id: string;
  stripe_session_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setBookings(d.bookings || []);
      })
      .catch(() => setError("Failed to load bookings"));
  }, []);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-dark">Bookings</h1>
        <p className="font-sans text-xs text-dark/40 mt-1">All confirmed reservations</p>
      </div>

      {error && (error.includes("database") || error.includes("relation") || error.includes("connection") || error.includes("POSTGRES") || error.includes("missing_connection")) ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="font-sans font-medium text-sm text-amber-800 mb-2">Database not connected</p>
          <p className="font-sans text-xs text-amber-700 mb-4">
            To store and view bookings, you need to connect a Vercel Postgres database:
          </p>
          <ol className="font-sans text-xs text-amber-700 space-y-1 list-decimal list-inside">
            <li>Go to vercel.com → your project → Storage → Create Database → Postgres</li>
            <li>Copy the connection strings into your .env.local file</li>
            <li>Restart the dev server — the bookings table will be created automatically</li>
          </ol>
          <p className="font-sans text-xs text-amber-600 mt-3">
            Until then, Stripe payments will still work — bookings just won&apos;t be stored.
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-sans text-sm text-red-700">{error}</p>
        </div>
      ) : bookings === null ? (
        <div className="text-dark/30 font-sans text-sm">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-dark/5 p-10 text-center">
          <p className="font-serif text-xl text-dark/30 mb-2">No bookings yet</p>
          <p className="font-sans text-xs text-dark/25">Confirmed bookings will appear here once guests complete payment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b }: { booking: Booking }) {
  const checkIn = new Date(b.check_in + "T12:00:00");
  const checkOut = new Date(b.check_out + "T12:00:00");
  const isUpcoming = checkIn >= new Date();

  return (
    <div className={`bg-white rounded-xl border p-5 ${isUpcoming ? "border-sage/40" : "border-dark/5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p className="font-sans font-medium text-sm text-dark">{b.guest_name}</p>
            <span className={`font-mono text-[9px] tracking-wide px-2 py-0.5 rounded-full ${
              isUpcoming ? "bg-sage/20 text-dark/60" : "bg-stone/50 text-dark/30"
            }`}>
              {isUpcoming ? "upcoming" : "past"}
            </span>
          </div>
          <p className="font-sans text-xs text-dark/40">{b.guest_email} · {b.guest_phone}</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-base text-dark">£{(b.total_amount / 100).toFixed(0)}</p>
          <p className="font-mono text-[9px] text-dark/30 mt-0.5">{b.status}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-dark/5 flex items-center gap-6">
        <Stat label="Check-in" value={checkIn.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} />
        <Stat label="Check-out" value={checkOut.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} />
        <Stat label="Nights" value={String(b.nights)} />
        <Stat label="Guests" value={`${b.adults + b.children} (${b.adults}A${b.children > 0 ? ` ${b.children}C` : ""})`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[8px] tracking-[0.15em] uppercase text-dark/25">{label}</p>
      <p className="font-sans text-xs text-dark mt-0.5">{value}</p>
    </div>
  );
}
