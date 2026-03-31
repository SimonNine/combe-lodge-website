"use client";

import { useState, useEffect, useMemo } from "react";

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
  source: string;
  created_at: string;
}

type SortKey = "check_in" | "guest_name" | "source" | "nights" | "check_out" | "total_amount" | "status";
type SortDir = "asc" | "desc";

const toLocalNoon = (s: string) => {
  const d = new Date(s);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
};

const formatDate = (s: string) =>
  toLocalNoon(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const toDateValue = (s: string) => {
  const d = toLocalNoon(s);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function sourceBadgeClass(source: string): string {
  switch (source) {
    case "Direct": return "bg-sage/20 text-dark";
    case "Kentisbury Grange": return "bg-blue-50 text-blue-700";
    case "Luxury Coastal": return "bg-purple-50 text-purple-700";
    default: return "bg-stone text-dark/60";
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "confirmed": return "bg-green-50 text-green-700";
    case "pending": return "bg-amber-50 text-amber-700";
    case "cancelled": return "bg-red-50 text-red-600";
    default: return "bg-stone text-dark/50";
  }
}

export default function FinancePage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingSources, setBookingSources] = useState<string[]>(["Direct", "Kentisbury Grange", "Luxury Coastal"]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("check_in");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterSource, setFilterSource] = useState("All");

  const fetchBookings = () => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setBookings(d.bookings || []);
      })
      .catch(() => setError("Failed to load bookings"));
  };

  useEffect(() => {
    fetchBookings();

    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => { if (d.bookingSources) setBookingSources(d.bookingSources); })
      .catch(() => {});
  }, []);

  const handleClearFilters = () => {
    setSearch("");
    setFilterFrom("");
    setFilterTo("");
    setFilterSource("All");
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Filter: confirmed only for revenue, but show all in table
  const filtered = useMemo(() => {
    if (!bookings) return [];
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      // Date range filter on check_in
      if (filterFrom) {
        const checkInVal = toDateValue(b.check_in);
        if (checkInVal < filterFrom) return false;
      }
      if (filterTo) {
        const checkInVal = toDateValue(b.check_in);
        if (checkInVal > filterTo) return false;
      }
      // Source filter
      if (filterSource !== "All" && b.source !== filterSource) return false;
      // Search
      if (q) {
        const amountStr = b.total_amount > 0 ? `£${(b.total_amount / 100).toFixed(0)}` : "";
        const matches = [
          b.guest_name, b.guest_email,
          b.source, b.check_in, b.check_out,
          b.status, amountStr,
        ].some((v) => (v || "").toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [bookings, search, filterFrom, filterTo, filterSource]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "check_in" || sortKey === "check_out") {
        av = toLocalNoon(a[sortKey]).getTime();
        bv = toLocalNoon(b[sortKey]).getTime();
      } else if (sortKey === "nights" || sortKey === "total_amount") {
        av = a[sortKey];
        bv = b[sortKey];
      } else {
        av = (a[sortKey] || "").toLowerCase();
        bv = (b[sortKey] || "").toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const confirmedFiltered = useMemo(
    () => filtered.filter((b) => b.status === "confirmed"),
    [filtered]
  );
  const confirmedWithAmount = useMemo(
    () => confirmedFiltered.filter((b) => b.total_amount > 0),
    [confirmedFiltered]
  );

  const totalRevenue = useMemo(
    () => confirmedWithAmount.reduce((sum, b) => sum + (b.total_amount || 0), 0) / 100,
    [confirmedWithAmount]
  );
  const totalBookings = confirmedFiltered.length;
  const avgNights = useMemo(() => {
    if (confirmedFiltered.length === 0) return 0;
    return confirmedFiltered.reduce((sum, b) => sum + (b.nights || 0), 0) / confirmedFiltered.length;
  }, [confirmedFiltered]);
  const avgRevenue = confirmedWithAmount.length > 0 ? totalRevenue / confirmedWithAmount.length : 0;

  const formatGBP = (n: number) =>
    `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

  const SortIndicator = ({ col }: { col: SortKey }) => (
    <span className="ml-1 opacity-60">{sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
  );

  const thClass = "font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40 px-4 py-3 text-left cursor-pointer select-none";
  const inputClass = "px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors";

  const summaryCards = [
    { label: "Total Revenue", value: formatGBP(totalRevenue) },
    { label: "Total Bookings", value: String(totalBookings) },
    { label: "Average Stay", value: `${avgNights.toFixed(1)} nights` },
    { label: "Avg Revenue / Booking", value: totalBookings > 0 ? formatGBP(avgRevenue) : "—" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-dark">Finance</h1>
        <p className="font-sans text-xs text-dark/40 mt-1">Revenue and booking summary</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-dark/5 p-5">
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35 mb-1">{card.label}</p>
            <p className="font-serif text-2xl text-dark">{bookings === null ? "…" : card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">From</label>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">To</label>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className={inputClass}
          />
        </div>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className={inputClass}
        >
          <option value="All">All sources</option>
          {bookingSources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} w-56`}
        />
        {(filterFrom || filterTo || filterSource !== "All" || search) && (
          <button
            onClick={handleClearFilters}
            className="font-sans text-xs text-dark/40 hover:text-dark/70 transition-colors underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-sans text-sm text-red-700">{error}</p>
        </div>
      ) : bookings === null ? (
        <div className="text-dark/30 font-sans text-sm">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-dark/5 overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="bg-stone/40">
                <th className={thClass} onClick={() => handleSort("check_in")}>Date<SortIndicator col="check_in" /></th>
                <th className={thClass} onClick={() => handleSort("guest_name")}>Guest<SortIndicator col="guest_name" /></th>
                <th className={thClass} onClick={() => handleSort("source")}>Source<SortIndicator col="source" /></th>
                <th className={thClass} onClick={() => handleSort("nights")}>Nights<SortIndicator col="nights" /></th>
                <th className={thClass} onClick={() => handleSort("check_out")}>Check-out<SortIndicator col="check_out" /></th>
                <th className={thClass} onClick={() => handleSort("total_amount")}>Amount<SortIndicator col="total_amount" /></th>
                <th className={thClass} onClick={() => handleSort("status")}>Status<SortIndicator col="status" /></th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center font-sans text-sm text-dark/30">No bookings found</td>
                </tr>
              ) : (
                sorted.map((b) => (
                  <tr key={b.id} onClick={() => setEditingBooking(b)} className="border-b border-dark/5 hover:bg-stone/20 transition-colors cursor-pointer">
                    <td className="font-sans text-sm text-dark px-4 py-3 whitespace-nowrap">{formatDate(b.check_in)}</td>
                    <td className="font-sans text-sm text-dark px-4 py-3">{b.guest_name || "—"}</td>
                    <td className="font-sans text-sm text-dark px-4 py-3">
                      <span className={`font-mono text-[9px] tracking-wide px-2 py-0.5 rounded-full ${sourceBadgeClass(b.source)}`}>
                        {b.source || "—"}
                      </span>
                    </td>
                    <td className="font-sans text-sm text-dark px-4 py-3">{b.nights}</td>
                    <td className="font-sans text-sm text-dark px-4 py-3 whitespace-nowrap">{formatDate(b.check_out)}</td>
                    <td className="font-sans text-sm text-dark px-4 py-3 whitespace-nowrap">
                      {b.total_amount > 0 ? `£${(b.total_amount / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—"}
                    </td>
                    <td className="font-sans text-sm text-dark px-4 py-3">
                      <span className={`font-mono text-[9px] tracking-wide px-2 py-0.5 rounded-full ${statusBadgeClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingBooking && (
        <BookingModal
          sources={bookingSources}
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaved={() => { setEditingBooking(null); fetchBookings(); }}
        />
      )}
    </div>
  );
}

const toDateInput = (s: string) => {
  const d = toLocalNoon(s);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function BookingModal({ sources, booking, onClose, onSaved }: {
  sources: string[];
  booking: Booking;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [source, setSource] = useState(booking.source);
  const [guestName, setGuestName] = useState(booking.guest_name || "");
  const [guestEmail, setGuestEmail] = useState(booking.guest_email || "");
  const [guestPhone, setGuestPhone] = useState(booking.guest_phone || "");
  const [checkIn, setCheckIn] = useState(toDateInput(booking.check_in));
  const [checkOut, setCheckOut] = useState(toDateInput(booking.check_out));
  const [totalAmount, setTotalAmount] = useState(booking.total_amount ? String(booking.total_amount / 100) : "");
  const [adults, setAdults] = useState(booking.adults ?? 0);
  const [children, setChildren] = useState(booking.children ?? 0);
  const [status, setStatus] = useState(booking.status || "confirmed");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const inputClass = "w-full px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors";
  const labelClass = "block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1.5";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!source || !checkIn || !checkOut) { setFormError("Source, check-in and check-out are required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id, source, checkIn, checkOut, status,
          guestName, guestEmail, guestPhone,
          totalAmount: totalAmount || undefined,
          adults, children,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to save booking"); setSaving(false); return; }
      onSaved();
    } catch {
      setFormError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl border border-dark/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-dark">Edit Booking</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone transition-colors text-dark/40 hover:text-dark/60">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Source <span className="text-dark/25 normal-case tracking-normal font-sans text-[10px]">required</span></label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
              {sources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Check-in <span className="text-dark/25 normal-case tracking-normal font-sans text-[10px]">required</span></label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Check-out <span className="text-dark/25 normal-case tracking-normal font-sans text-[10px]">required</span></label>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Guest Name</label>
            <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full name" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="guest@email.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+44 7123 456 789" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Total (£)</label>
              <input type="number" min="0" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Adults</label>
              <input type="number" min="0" max="4" value={adults} onChange={(e) => setAdults(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Children</label>
              <input type="number" min="0" max="3" value={children} onChange={(e) => setChildren(parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="confirmed">confirmed</option>
              <option value="pending">pending</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          {formError && <p className="font-sans text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-sans text-sm text-dark/50 border border-dark/10 hover:bg-stone transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg font-sans font-medium text-sm bg-moss text-light-text hover:bg-moss-light transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
