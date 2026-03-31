"use client";

import { useState, useEffect } from "react";
import type { BookingRules } from "@/lib/booking-rules";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function RulesPage() {
  const [rules, setRules] = useState<BookingRules | null>(null);
  const [blackoutDates, setBlackoutDates] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [newBlackout, setNewBlackout] = useState({ start: "", end: "" });
  const { setDirty } = useUnsavedChanges();

  const updateRules = (updated: BookingRules) => { setRules(updated); setDirty(true); };
  const updateBlackouts = (updated: string[]) => { setBlackoutDates(updated); setDirty(true); };

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => {
        setRules(d.rules);
        setBlackoutDates(d.blackoutDates || []);
      });
  }, []);

  const save = async (updatedRules: BookingRules, updatedBlackouts: string[]) => {
    setSaveState("saving");
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: updatedRules, blackoutDates: updatedBlackouts }),
    });
    if (res.ok) setDirty(false);
    setSaveState(res.ok ? "saved" : "error");
    setTimeout(() => setSaveState("idle"), 2500);
  };

  const addBlackoutRange = () => {
    if (!newBlackout.start || !newBlackout.end || !rules) return;
    const start = new Date(newBlackout.start);
    const end = new Date(newBlackout.end);
    const dates: string[] = [];
    const d = new Date(start);
    while (d <= end) {
      dates.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    const merged = Array.from(new Set([...blackoutDates, ...dates])).sort();
    setBlackoutDates(merged);
    setNewBlackout({ start: "", end: "" });
    save(rules, merged);
  };

  const removeBlackout = (date: string) => {
    if (!rules) return;
    const updated = blackoutDates.filter((d) => d !== date);
    setBlackoutDates(updated);
    save(rules, updated);
  };

  const clearAllBlackouts = () => {
    if (!rules) return;
    setBlackoutDates([]);
    save(rules, []);
  };

  // Group consecutive dates into ranges for display
  const blackoutRanges: { start: string; end: string; dates: string[] }[] = [];
  if (blackoutDates.length > 0) {
    let rangeStart = blackoutDates[0];
    let rangeEnd = blackoutDates[0];
    let rangeDates = [blackoutDates[0]];

    for (let i = 1; i < blackoutDates.length; i++) {
      const prev = new Date(blackoutDates[i - 1]);
      const curr = new Date(blackoutDates[i]);
      prev.setDate(prev.getDate() + 1);
      if (prev.toISOString().split("T")[0] === blackoutDates[i]) {
        rangeEnd = blackoutDates[i];
        rangeDates.push(blackoutDates[i]);
      } else {
        blackoutRanges.push({ start: rangeStart, end: rangeEnd, dates: rangeDates });
        rangeStart = blackoutDates[i];
        rangeEnd = blackoutDates[i];
        rangeDates = [blackoutDates[i]];
      }
    }
    blackoutRanges.push({ start: rangeStart, end: rangeEnd, dates: rangeDates });
  }

  if (!rules) {
    return <div className="p-10 text-dark/30 font-sans text-sm">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-dark">Booking Rules</h1>
          <p className="font-sans text-xs text-dark/40 mt-1">Control how guests can book — minimum stays, weekend rules, blocked dates</p>
        </div>
        <SaveButton state={saveState} onClick={() => save(rules, blackoutDates)} />
      </div>

      {/* Stay requirements */}
      <Card title="Stay Requirements">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1.5">
              Min nights (default)
            </label>
            <input
              type="number"
              min={1}
              value={rules.minNights}
              onChange={(e) => updateRules({ ...rules, minNights: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors"
            />
            <p className="font-sans text-[10px] text-dark/25 mt-1">Per-season overrides set in Pricing</p>
          </div>
          <div>
            <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1.5">
              Max guests
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={rules.maxGuests}
              onChange={(e) => updateRules({ ...rules, maxGuests: parseInt(e.target.value) || 4 })}
              className="w-full px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1.5">
              Check-in time
            </label>
            <input
              type="time"
              value={rules.checkInTime}
              onChange={(e) => updateRules({ ...rules, checkInTime: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1.5">
              Check-out time
            </label>
            <input
              type="time"
              value={rules.checkOutTime}
              onChange={(e) => updateRules({ ...rules, checkOutTime: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors"
            />
          </div>
        </div>
      </Card>

      {/* Weekend rule */}
      <Card title="Weekend Rule" className="mt-5">
        <div className="flex items-start gap-4">
          <button
            onClick={() => updateRules({ ...rules, weekendRule: !rules.weekendRule })}
            className={`mt-0.5 w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${
              rules.weekendRule ? "bg-moss" : "bg-dark/15"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                rules.weekendRule ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <div>
            <p className="font-sans text-sm text-dark font-medium">
              {rules.weekendRule ? "Enabled" : "Disabled"}
            </p>
            <p className="font-sans text-xs text-dark/40 mt-0.5">
              When enabled: if a booking includes a Friday night, checkout must be Sunday or later. Prevents guests booking just Friday night and leaving Saturday morning.
            </p>
          </div>
        </div>
      </Card>

      {/* Blackout dates */}
      <Card title="Blocked Dates" className="mt-5">
        <p className="font-sans text-xs text-dark/40 mb-4">
          Block dates for personal use, maintenance, or other reasons. Guests cannot book these dates.
        </p>

        {/* Add range */}
        <div className="flex items-end gap-3 mb-4">
          <div className="flex-1">
            <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1">From</label>
            <input
              type="date"
              value={newBlackout.start}
              onChange={(e) => setNewBlackout((b) => ({ ...b, start: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1">To</label>
            <input
              type="date"
              value={newBlackout.end}
              onChange={(e) => setNewBlackout((b) => ({ ...b, end: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors"
            />
          </div>
          <button
            onClick={addBlackoutRange}
            disabled={!newBlackout.start || !newBlackout.end}
            className="px-4 py-2 rounded-lg bg-moss text-light-text font-sans text-xs font-medium hover:bg-moss-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Block
          </button>
        </div>

        {/* Existing blackouts */}
        {blackoutRanges.length === 0 ? (
          <p className="font-sans text-xs text-dark/25 italic">No dates blocked.</p>
        ) : (
          <div className="space-y-1.5">
            {blackoutRanges.map((range) => (
              <div
                key={range.start}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone/40 border border-dark/5"
              >
                <div className="font-mono text-[10px] text-dark/50">
                  {range.start === range.end
                    ? range.start
                    : `${range.start} → ${range.end}`}
                  <span className="ml-2 text-dark/30">({range.dates.length} night{range.dates.length !== 1 ? "s" : ""})</span>
                </div>
                <button
                  onClick={() => range.dates.forEach(removeBlackout)}
                  className="text-dark/20 hover:text-red-400 transition-colors font-sans text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={clearAllBlackouts}
              className="font-sans text-[10px] text-dark/25 hover:text-red-400 transition-colors mt-1"
            >
              Clear all blocked dates
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-dark/5 p-5 ${className}`}>
      <h2 className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function SaveButton({ state, onClick }: { state: SaveState; onClick: () => void }) {
  const labels = { idle: "Save changes", saving: "Saving…", saved: "Saved ✓", error: "Error — try again" };
  const styles = {
    idle: "bg-moss text-light-text hover:bg-moss-light",
    saving: "bg-moss/60 text-light-text cursor-not-allowed",
    saved: "bg-sage/40 text-dark",
    error: "bg-red-100 text-red-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={state === "saving"}
      className={`px-5 py-2 rounded-lg font-sans font-medium text-sm transition-all ${styles[state]}`}
    >
      {labels[state]}
    </button>
  );
}
