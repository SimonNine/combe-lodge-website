"use client";

import { useState, useEffect, useMemo, Fragment } from "react";

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

type SortKey = "source" | "guest_name" | "check_in" | "check_out" | "nights" | "total_amount" | "status";
type SortDir = "asc" | "desc";

const toLocalNoon = (s: string) => {
  const d = new Date(s);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
};

const toDateInput = (s: string) => {
  const d = toLocalNoon(s);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const toDateValue = (s: string) => toDateInput(s);

const formatDate = (s: string) =>
  toLocalNoon(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingSources, setBookingSources] = useState<string[]>(["Direct", "Kentisbury Grange", "Luxury Coastal"]);

  // Filters
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterSource, setFilterSource] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("check_in");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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

  // Derive available years from all bookings
  const availableYears = useMemo(() => {
    if (!bookings) return [];
    const years = new Set(bookings.map((b) => String(toLocalNoon(b.check_in).getFullYear())));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [bookings]);

  const handleClearFilters = () => {
    setSearch(""); setFilterYear("All"); setFilterFrom(""); setFilterTo("");
    setFilterSource("All"); setFilterStatus("All");
  };

  const hasFilters = search || filterYear !== "All" || filterFrom || filterTo || filterSource !== "All" || filterStatus !== "All";

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking? You can restore it from Trash within 30 days.")) return;
    await fetch(`/api/admin/bookings?id=${id}`, { method: "DELETE" });
    fetchBookings();
  };

  const handleEdit = (b: Booking) => { setEditingBooking(b); setShowModal(true); };
  const handleAdd = () => { setEditingBooking(null); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingBooking(null); };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    if (!bookings) return [];
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      const checkInVal = toDateValue(b.check_in);
      const year = String(toLocalNoon(b.check_in).getFullYear());
      if (filterYear !== "All" && year !== filterYear) return false;
      if (filterFrom && checkInVal < filterFrom) return false;
      if (filterTo && checkInVal > filterTo) return false;
      if (filterSource !== "All" && b.source !== filterSource) return false;
      if (filterStatus !== "All" && b.status !== filterStatus) return false;
      if (q) {
        const amountStr = b.total_amount > 0 ? `£${(b.total_amount / 100).toFixed(0)}` : "";
        return [b.guest_name, b.guest_email, b.guest_phone, b.source, b.check_in, b.check_out, b.status, amountStr]
          .some((v) => (v || "").toLowerCase().includes(q));
      }
      return true;
    });
  }, [bookings, search, filterYear, filterFrom, filterTo, filterSource, filterStatus]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "check_in" || sortKey === "check_out") {
        av = toLocalNoon(a[sortKey]).getTime();
        bv = toLocalNoon(b[sortKey]).getTime();
      } else if (sortKey === "nights" || sortKey === "total_amount") {
        av = a[sortKey]; bv = b[sortKey];
      } else {
        av = (a[sortKey] || "").toLowerCase();
        bv = (b[sortKey] || "").toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: { key: string; label: string; items: Booking[] }[] = [];
    for (const b of sorted) {
      const d = toLocalNoon(b.check_in);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.items.push(b);
      else groups.push({ key, label, items: [b] });
    }
    return groups;
  }, [sorted]);

  const SortIndicator = ({ col }: { col: SortKey }) => (
    <span className="ml-1 opacity-60">{sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
  );

  const thClass = "font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40 px-4 py-3 text-left cursor-pointer select-none whitespace-nowrap";
  const selectClass = "px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors bg-white";

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-2xl text-dark">Bookings</h1>
          <p className="font-sans text-xs text-dark/40 mt-1">All reservations</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg font-sans font-medium text-sm bg-moss text-light-text hover:bg-moss-light transition-all whitespace-nowrap"
        >
          + Add Booking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-dark/5 p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {/* Year */}
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className={selectClass}>
            <option value="All">All years</option>
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {/* From */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">From</span>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className={selectClass} />
          </div>
          {/* To */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">To</span>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className={selectClass} />
          </div>
          {/* Source */}
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className={selectClass}>
            <option value="All">All sources</option>
            {bookingSources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Status */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
            <option value="All">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name, email, source, amount…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${selectClass} flex-1 min-w-0`}
          />
          {hasFilters && (
            <button onClick={handleClearFilters} className="font-sans text-xs text-dark/40 hover:text-dark/70 transition-colors whitespace-nowrap underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (error.includes("database") || error.includes("relation") || error.includes("connection") || error.includes("POSTGRES") || error.includes("missing_connection")) ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="font-sans font-medium text-sm text-amber-800 mb-2">Database not connected</p>
          <p className="font-sans text-xs text-amber-700 mb-4">To store and view bookings, you need to connect a Vercel Postgres database.</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-sans text-sm text-red-700">{error}</p>
        </div>
      ) : bookings === null ? (
        <div className="text-dark/30 font-sans text-sm">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-dark/5 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-stone/40 border-b border-dark/5">
                <th className={thClass} onClick={() => handleSort("source")}>Source<SortIndicator col="source" /></th>
                <th className={thClass} onClick={() => handleSort("guest_name")}>Guest<SortIndicator col="guest_name" /></th>
                <th className={thClass} onClick={() => handleSort("check_in")}>Check-in<SortIndicator col="check_in" /></th>
                <th className={thClass} onClick={() => handleSort("check_out")}>Check-out<SortIndicator col="check_out" /></th>
                <th className={thClass} onClick={() => handleSort("nights")}>Nights<SortIndicator col="nights" /></th>
                <th className={thClass} onClick={() => handleSort("total_amount")}>Amount<SortIndicator col="total_amount" /></th>
                <th className={thClass} onClick={() => handleSort("status")}>Status<SortIndicator col="status" /></th>
                <th className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40 px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {grouped.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center font-sans text-sm text-dark/30">No bookings found</td>
                </tr>
              ) : (
                grouped.map(({ key, label, items }) => (
                  <Fragment key={key}>
                    {/* Month header */}
                    <tr className="bg-stone/60 border-t border-dark/8">
                      <td colSpan={8} className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-dark/60 font-medium">{label}</span>
                          <span className="font-sans text-[11px] text-dark/35">
                            {items.length} booking{items.length !== 1 ? "s" : ""}
                            {items.some((b) => b.total_amount > 0) && (
                              <> · £{(items.filter(b => b.total_amount > 0).reduce((s, b) => s + b.total_amount, 0) / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 })}</>
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Rows */}
                    {items.map((b) => (
                      <tr key={b.id} onClick={() => handleEdit(b)} className="border-b border-dark/5 hover:bg-stone/20 transition-colors cursor-pointer" >
                        <td className="px-4 py-3">
                          <span className={`font-mono text-[9px] tracking-wide px-2 py-0.5 rounded-full ${sourceBadgeClass(b.source)}`}>
                            {b.source || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-sans text-sm text-dark">{b.guest_name || <span className="text-dark/30 italic text-xs">No name</span>}</p>
                          {b.guest_email && <p className="font-sans text-xs text-dark/40 mt-0.5">{b.guest_email}</p>}
                        </td>
                        <td className="font-sans text-sm text-dark px-4 py-3 whitespace-nowrap">{formatDate(b.check_in)}</td>
                        <td className="font-sans text-sm text-dark px-4 py-3 whitespace-nowrap">{formatDate(b.check_out)}</td>
                        <td className="font-sans text-sm text-dark px-4 py-3">{b.nights}</td>
                        <td className="font-sans text-sm text-dark px-4 py-3 whitespace-nowrap">
                          {b.total_amount > 0 ? `£${(b.total_amount / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-[9px] tracking-wide px-2 py-0.5 rounded-full ${statusBadgeClass(b.status)}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleEdit(b)} className="text-dark/30 hover:text-dark/60 transition-colors p-0.5" title="Edit">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M9.5 2.5L11.5 4.5L5 11H3V9L9.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(b.id)} className="text-red-400 hover:text-red-600 transition-colors p-0.5" title="Delete">
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                <path d="M3 3.5h9M6 3.5V2.5h3v1M5.5 6v5M9.5 6v5M4 3.5l.5 9h6l.5-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <BookingModal
          sources={bookingSources}
          booking={editingBooking}
          onClose={handleClose}
          onSaved={() => { handleClose(); fetchBookings(); }}
        />
      )}
    </div>
  );
}

function BookingModal({ sources, booking, onClose, onSaved }: {
  sources: string[];
  booking: Booking | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!booking;

  const [source, setSource] = useState(booking?.source || sources[0] || "Direct");
  const [guestName, setGuestName] = useState(booking?.guest_name || "");
  const [guestEmail, setGuestEmail] = useState(booking?.guest_email || "");
  const [guestPhone, setGuestPhone] = useState(booking?.guest_phone || "");
  const [checkIn, setCheckIn] = useState(booking ? toDateInput(booking.check_in) : "");
  const [checkOut, setCheckOut] = useState(booking ? toDateInput(booking.check_out) : "");
  const [totalAmount, setTotalAmount] = useState(booking?.total_amount ? String(booking.total_amount / 100) : "");
  const [adults, setAdults] = useState(booking?.adults ?? 2);
  const [children, setChildren] = useState(booking?.children ?? 0);
  const [status, setStatus] = useState(booking?.status || "confirmed");
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
      const payload = isEdit ? {
        id: booking!.id, source, checkIn, checkOut, status,
        guestName, guestEmail, guestPhone,
        totalAmount: totalAmount || undefined,
        adults, children,
      } : {
        source, checkIn, checkOut,
        guestName: guestName || undefined,
        guestEmail: guestEmail || undefined,
        guestPhone: guestPhone || undefined,
        totalAmount: totalAmount || undefined,
        adults: adults || undefined,
        children: children || undefined,
      };
      const res = await fetch("/api/admin/bookings", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          <h2 className="font-serif text-xl text-dark">{isEdit ? "Edit Booking" : "Add Manual Booking"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone transition-colors text-dark/40 hover:text-dark/60">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
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
          {isEdit && (
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="confirmed">confirmed</option>
                <option value="pending">pending</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          )}
          {formError && <p className="font-sans text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-sans text-sm text-dark/50 border border-dark/10 hover:bg-stone transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg font-sans font-medium text-sm bg-moss text-light-text hover:bg-moss-light transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
