"use client";

import { useState, useEffect } from "react";

interface TrashedBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  nights: number;
  total_amount: number;
  status: string;
  source: string;
  deleted_at: string;
}

const toLocalNoon = (s: string) => {
  const d = new Date(s);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
};

const formatDate = (s: string) =>
  toLocalNoon(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const formatDateTime = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

function sourceBadgeClass(source: string): string {
  switch (source) {
    case "Direct": return "bg-sage/20 text-dark";
    case "Kentisbury Grange": return "bg-blue-50 text-blue-700";
    case "Luxury Coastal": return "bg-purple-50 text-purple-700";
    default: return "bg-stone text-dark/60";
  }
}

export default function TrashPage() {
  const [bookings, setBookings] = useState<TrashedBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchTrash = () => {
    fetch("/api/admin/trash")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setBookings(d.bookings || []);
      })
      .catch(() => setError("Failed to load trash"));
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await fetch("/api/admin/trash", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchTrash();
    } catch {
      // silently refetch
      fetchTrash();
    } finally {
      setRestoringId(null);
    }
  };

  const thClass = "font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40 px-4 py-3 text-left select-none";

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-dark">Trash</h1>
        <p className="font-sans text-xs text-dark/40 mt-1">Items are permanently deleted after 30 days</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-sans text-sm text-red-700">{error}</p>
        </div>
      ) : bookings === null ? (
        <div className="text-dark/30 font-sans text-sm">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-dark/5 p-10 text-center">
          <p className="font-serif text-xl text-dark/30 mb-1">Trash is empty</p>
          <p className="font-sans text-xs text-dark/25">Deleted bookings will appear here and can be restored within 30 days.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dark/5 overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="bg-stone/40">
                <th className={thClass}>Source</th>
                <th className={thClass}>Guest</th>
                <th className={thClass}>Check-in</th>
                <th className={thClass}>Check-out</th>
                <th className={thClass}>Nights</th>
                <th className={thClass}>Deleted</th>
                <th className={thClass}>Restore</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-dark/5 hover:bg-stone/20 transition-colors">
                  <td className="font-sans text-sm text-dark px-4 py-3">
                    <span className={`font-mono text-[9px] tracking-wide px-2 py-0.5 rounded-full ${sourceBadgeClass(b.source)}`}>
                      {b.source || "—"}
                    </span>
                  </td>
                  <td className="font-sans text-sm text-dark px-4 py-3">
                    <p className="font-sans text-sm text-dark">{b.guest_name || <span className="text-dark/30 italic text-xs">No name</span>}</p>
                    {b.guest_email && <p className="font-sans text-xs text-dark/40 mt-0.5">{b.guest_email}</p>}
                  </td>
                  <td className="font-sans text-sm text-dark px-4 py-3 whitespace-nowrap">{formatDate(b.check_in)}</td>
                  <td className="font-sans text-sm text-dark px-4 py-3 whitespace-nowrap">{formatDate(b.check_out)}</td>
                  <td className="font-sans text-sm text-dark px-4 py-3">{b.nights}</td>
                  <td className="font-sans text-sm text-dark/50 px-4 py-3 whitespace-nowrap text-xs">{formatDateTime(b.deleted_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRestore(b.id)}
                      disabled={restoringId === b.id}
                      className="px-3 py-1.5 rounded-lg font-sans text-xs text-dark bg-sage/20 hover:bg-sage/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {restoringId === b.id ? "Restoring…" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
