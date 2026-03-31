"use client";

import { useState, useEffect } from "react";
import type { PricingConfig, SeasonalPricing, DiscountPeriod } from "@/lib/booking-rules";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";

type SaveState = "idle" | "saving" | "saved" | "error";

function penceToGBP(pence: number): string {
  return (pence / 100).toFixed(2);
}
function gbpToPence(str: string): number {
  return Math.round(parseFloat(str) * 100);
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const { setDirty } = useUnsavedChanges();
  const [newSeason, setNewSeason] = useState<Partial<SeasonalPricing>>({});
  const [showAddSeason, setShowAddSeason] = useState(false);
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<SeasonalPricing>>({});

  const [newDiscount, setNewDiscount] = useState<Partial<DiscountPeriod>>({});
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [editDiscountDraft, setEditDiscountDraft] = useState<Partial<DiscountPeriod>>({});

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => setPricing(d.pricing));
  }, []);

  const save = async (updated: PricingConfig) => {
    setSaveState("saving");
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricing: updated }),
    });
    if (res.ok) {
      setSaveState("saved");
      setDirty(false);
    } else {
      setSaveState("error");
    }
    setTimeout(() => setSaveState("idle"), 2500);
  };

  const updateField = (field: keyof PricingConfig, value: number) => {
    if (!pricing) return;
    const updated = { ...pricing, [field]: value };
    setPricing(updated);
    setDirty(true);
  };

  const deleteSeason = (id: string) => {
    if (!pricing) return;
    const updated = {
      ...pricing,
      seasonalPricing: pricing.seasonalPricing.filter((s) => s.id !== id),
    };
    setPricing(updated);
    save(updated);
  };

  const startEdit = (season: SeasonalPricing) => {
    setEditingSeasonId(season.id || season.name);
    setEditDraft({
      ...season,
      // convert pence to display pounds for the rate field
      nightlyRate: season.nightlyRate / 100,
    });
    setDirty(true);
  };

  const saveEdit = () => {
    if (!pricing || !editDraft.name || !editDraft.startDate || !editDraft.endDate || !editDraft.nightlyRate) return;
    const updated = {
      ...pricing,
      seasonalPricing: pricing.seasonalPricing.map((s) =>
        (s.id || s.name) === editingSeasonId
          ? {
              ...s,
              name: editDraft.name!,
              startDate: editDraft.startDate!,
              endDate: editDraft.endDate!,
              nightlyRate: gbpToPence(String(editDraft.nightlyRate)),
              minNights: editDraft.minNights ? Number(editDraft.minNights) : undefined,
            }
          : s
      ),
    };
    setPricing(updated);
    setEditingSeasonId(null);
    setEditDraft({});
    save(updated);
  };

  const addSeason = () => {
    if (!pricing || !newSeason.name || !newSeason.startDate || !newSeason.endDate || !newSeason.nightlyRate) return;
    const season: SeasonalPricing = {
      id: Date.now().toString(),
      name: newSeason.name,
      startDate: newSeason.startDate,
      endDate: newSeason.endDate,
      nightlyRate: gbpToPence(String(newSeason.nightlyRate)),
      minNights: newSeason.minNights ? Number(newSeason.minNights) : undefined,
    };
    const updated = {
      ...pricing,
      seasonalPricing: [...pricing.seasonalPricing, season],
    };
    setPricing(updated);
    setNewSeason({});
    setShowAddSeason(false);
    save(updated);
  };

  const deleteDiscount = (id: string) => {
    if (!pricing) return;
    const updated = {
      ...pricing,
      discountPeriods: (pricing.discountPeriods || []).filter((d) => d.id !== id),
    };
    setPricing(updated);
    save(updated);
  };

  const startEditDiscount = (discount: DiscountPeriod) => {
    setEditingDiscountId(discount.id || discount.name);
    setEditDiscountDraft({ ...discount });
    setDirty(true);
  };

  const saveEditDiscount = () => {
    if (!pricing || !editDiscountDraft.name || !editDiscountDraft.startDate || !editDiscountDraft.endDate || !editDiscountDraft.discountPercent) return;
    const updated = {
      ...pricing,
      discountPeriods: (pricing.discountPeriods || []).map((d) =>
        (d.id || d.name) === editingDiscountId
          ? { ...d, name: editDiscountDraft.name!, startDate: editDiscountDraft.startDate!, endDate: editDiscountDraft.endDate!, discountPercent: Number(editDiscountDraft.discountPercent) }
          : d
      ),
    };
    setPricing(updated);
    setEditingDiscountId(null);
    setEditDiscountDraft({});
    save(updated);
  };

  const addDiscount = () => {
    if (!pricing || !newDiscount.name || !newDiscount.startDate || !newDiscount.endDate || !newDiscount.discountPercent) return;
    const discount: DiscountPeriod = {
      id: Date.now().toString(),
      name: newDiscount.name,
      startDate: newDiscount.startDate,
      endDate: newDiscount.endDate,
      discountPercent: Number(newDiscount.discountPercent),
    };
    const updated = {
      ...pricing,
      discountPeriods: [...(pricing.discountPeriods || []), discount],
    };
    setPricing(updated);
    setNewDiscount({});
    setShowAddDiscount(false);
    save(updated);
  };

  if (!pricing) {
    return (
      <div className="p-10 text-dark/30 font-sans text-sm">Loading…</div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-dark">Pricing</h1>
          <p className="font-sans text-xs text-dark/40 mt-1">Set your nightly rates, fees, and seasonal pricing</p>
        </div>
        <SaveButton state={saveState} onClick={() => save(pricing)} />
      </div>

      {/* Base rates */}
      <Card title="Base Rates">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Nightly rate"
            prefix="£"
            value={penceToGBP(pricing.baseNightlyRate)}
            onChange={(v) => updateField("baseNightlyRate", gbpToPence(v))}
          />
          <Field
            label="Cleaning fee"
            prefix="£"
            value={penceToGBP(pricing.cleaningFee)}
            onChange={(v) => updateField("cleaningFee", gbpToPence(v))}
          />
          <Field
            label="Weekend premium"
            suffix="%"
            value={String(pricing.weekendPremiumPercent)}
            onChange={(v) => updateField("weekendPremiumPercent", parseFloat(v) || 0)}
            hint="0 = no premium"
          />
          <Field
            label="Deposit required"
            suffix="%"
            value={String(pricing.depositPercent)}
            onChange={(v) => updateField("depositPercent", parseFloat(v) || 100)}
            hint="100 = full payment upfront"
          />
        </div>
      </Card>

      {/* Seasonal pricing */}
      <Card title="Seasonal Pricing" className="mt-5">
        <p className="font-sans text-xs text-dark/40 mb-4">
          Seasonal rates override the base nightly rate for the specified date range.
        </p>

        {pricing.seasonalPricing.length === 0 && (
          <p className="font-sans text-xs text-dark/30 italic mb-4">No seasonal pricing configured.</p>
        )}

        <div className="space-y-2 mb-4">
          {pricing.seasonalPricing.map((season) => {
            const id = season.id || season.name;
            const isEditing = editingSeasonId === id;

            if (isEditing) {
              return (
                <div key={id} className="border border-sage/40 rounded-lg p-4 space-y-3 bg-white">
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">Editing Season</p>
                  <div className="grid grid-cols-2 gap-3">
                    <InlineField
                      label="Name"
                      value={editDraft.name || ""}
                      onChange={(v) => setEditDraft((d) => ({ ...d, name: v }))}
                      className="col-span-2"
                    />
                    <InlineField
                      label="Start date"
                      type="date"
                      value={editDraft.startDate || ""}
                      onChange={(v) => setEditDraft((d) => ({ ...d, startDate: v }))}
                    />
                    <InlineField
                      label="End date"
                      type="date"
                      value={editDraft.endDate || ""}
                      onChange={(v) => setEditDraft((d) => ({ ...d, endDate: v }))}
                    />
                    <InlineField
                      label="Nightly rate (£)"
                      type="number"
                      value={editDraft.nightlyRate ? String(editDraft.nightlyRate) : ""}
                      onChange={(v) => setEditDraft((d) => ({ ...d, nightlyRate: parseFloat(v) }))}
                    />
                    <InlineField
                      label="Min nights (optional)"
                      type="number"
                      value={editDraft.minNights ? String(editDraft.minNights) : ""}
                      onChange={(v) => setEditDraft((d) => ({ ...d, minNights: parseInt(v) || undefined }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 rounded-lg bg-moss text-light-text font-sans text-xs font-medium hover:bg-moss-light transition-colors"
                    >
                      Save changes
                    </button>
                    <button
                      onClick={() => { setEditingSeasonId(null); setEditDraft({}); }}
                      className="px-4 py-2 rounded-lg border border-dark/10 text-dark/50 font-sans text-xs hover:border-dark/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setEditingSeasonId(null); deleteSeason(id); }}
                      className="ml-auto px-4 py-2 rounded-lg text-red-400 font-sans text-xs hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={id}
                className="flex items-center justify-between p-3 rounded-lg bg-stone/40 border border-dark/5 hover:border-dark/10 transition-colors"
              >
                <div>
                  <div className="font-sans text-sm text-dark font-medium">{season.name}</div>
                  <div className="font-mono text-[10px] text-dark/35 mt-0.5">
                    {season.startDate} → {season.endDate} · £{(season.nightlyRate / 100).toFixed(0)}/night
                    {season.minNights ? ` · ${season.minNights} night min` : ""}
                  </div>
                </div>
                <button
                  onClick={() => startEdit(season)}
                  className="text-dark/30 hover:text-moss transition-colors font-sans text-xs px-2 py-1"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>

        {showAddSeason ? (
          <div className="border border-dark/8 rounded-lg p-4 space-y-3">
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">New Season</p>
            <div className="grid grid-cols-2 gap-3">
              <InlineField
                label="Name"
                value={newSeason.name || ""}
                onChange={(v) => setNewSeason((s) => ({ ...s, name: v }))}
                placeholder="e.g. Peak Summer 2026"
                className="col-span-2"
              />
              <InlineField
                label="Start date"
                type="date"
                value={newSeason.startDate || ""}
                onChange={(v) => setNewSeason((s) => ({ ...s, startDate: v }))}
              />
              <InlineField
                label="End date"
                type="date"
                value={newSeason.endDate || ""}
                onChange={(v) => setNewSeason((s) => ({ ...s, endDate: v }))}
              />
              <InlineField
                label="Nightly rate (£)"
                type="number"
                value={newSeason.nightlyRate ? String(newSeason.nightlyRate) : ""}
                onChange={(v) => setNewSeason((s) => ({ ...s, nightlyRate: parseFloat(v) }))}
                placeholder="e.g. 350"
              />
              <InlineField
                label="Min nights (optional)"
                type="number"
                value={newSeason.minNights ? String(newSeason.minNights) : ""}
                onChange={(v) => setNewSeason((s) => ({ ...s, minNights: parseInt(v) }))}
                placeholder="e.g. 3"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={addSeason}
                className="px-4 py-2 rounded-lg bg-moss text-light-text font-sans text-xs font-medium hover:bg-moss-light transition-colors"
              >
                Add Season
              </button>
              <button
                onClick={() => { setShowAddSeason(false); setNewSeason({}); }}
                className="px-4 py-2 rounded-lg border border-dark/10 text-dark/50 font-sans text-xs hover:border-dark/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddSeason(true)}
            className="flex items-center gap-2 text-moss font-sans text-xs font-medium hover:text-moss-light transition-colors"
          >
            <span className="text-base leading-none">+</span> Add season
          </button>
        )}
      </Card>

      {/* Discount periods */}
      <Card title="Discount Periods" className="mt-5">
        <p className="font-sans text-xs text-dark/40 mb-4">
          Discounts apply a percentage off the total (accommodation + cleaning fee). Shown to guests as a crossed-out price on the booking page.
        </p>

        {(pricing.discountPeriods || []).length === 0 && (
          <p className="font-sans text-xs text-dark/30 italic mb-4">No discount periods configured.</p>
        )}

        <div className="space-y-2 mb-4">
          {(pricing.discountPeriods || []).map((discount) => {
            const id = discount.id || discount.name;
            const isEditing = editingDiscountId === id;

            if (isEditing) {
              return (
                <div key={id} className="border border-amber-200 rounded-lg p-4 space-y-3 bg-amber-50/50">
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">Editing Discount</p>
                  <div className="grid grid-cols-2 gap-3">
                    <InlineField label="Name" value={editDiscountDraft.name || ""} onChange={(v) => setEditDiscountDraft((d) => ({ ...d, name: v }))} className="col-span-2" placeholder="e.g. Spring Offer" />
                    <InlineField label="Start date" type="date" value={editDiscountDraft.startDate || ""} onChange={(v) => setEditDiscountDraft((d) => ({ ...d, startDate: v }))} />
                    <InlineField label="End date" type="date" value={editDiscountDraft.endDate || ""} onChange={(v) => setEditDiscountDraft((d) => ({ ...d, endDate: v }))} />
                    <InlineField label="Discount %" type="number" value={editDiscountDraft.discountPercent ? String(editDiscountDraft.discountPercent) : ""} onChange={(v) => setEditDiscountDraft((d) => ({ ...d, discountPercent: parseFloat(v) }))} placeholder="e.g. 15" className="col-span-2" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEditDiscount} className="px-4 py-2 rounded-lg bg-moss text-light-text font-sans text-xs font-medium hover:bg-moss-light transition-colors">Save changes</button>
                    <button onClick={() => { setEditingDiscountId(null); setEditDiscountDraft({}); }} className="px-4 py-2 rounded-lg border border-dark/10 text-dark/50 font-sans text-xs hover:border-dark/20 transition-colors">Cancel</button>
                    <button onClick={() => { setEditingDiscountId(null); deleteDiscount(id); }} className="ml-auto px-4 py-2 rounded-lg text-red-400 font-sans text-xs hover:text-red-600 transition-colors">Delete</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 hover:border-amber-300/60 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{discount.discountPercent}% off</span>
                    <span className="font-sans text-sm text-dark font-medium">{discount.name}</span>
                  </div>
                  <div className="font-mono text-[10px] text-dark/35 mt-0.5">{discount.startDate} → {discount.endDate}</div>
                </div>
                <button onClick={() => startEditDiscount(discount)} className="text-dark/30 hover:text-moss transition-colors font-sans text-xs px-2 py-1">Edit</button>
              </div>
            );
          })}
        </div>

        {showAddDiscount ? (
          <div className="border border-dark/8 rounded-lg p-4 space-y-3">
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">New Discount Period</p>
            <div className="grid grid-cols-2 gap-3">
              <InlineField label="Name" value={newDiscount.name || ""} onChange={(v) => setNewDiscount((s) => ({ ...s, name: v }))} placeholder="e.g. Early Bird Spring" className="col-span-2" />
              <InlineField label="Start date" type="date" value={newDiscount.startDate || ""} onChange={(v) => setNewDiscount((s) => ({ ...s, startDate: v }))} />
              <InlineField label="End date" type="date" value={newDiscount.endDate || ""} onChange={(v) => setNewDiscount((s) => ({ ...s, endDate: v }))} />
              <InlineField label="Discount %" type="number" value={newDiscount.discountPercent ? String(newDiscount.discountPercent) : ""} onChange={(v) => setNewDiscount((s) => ({ ...s, discountPercent: parseFloat(v) }))} placeholder="e.g. 10" className="col-span-2" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addDiscount} className="px-4 py-2 rounded-lg bg-moss text-light-text font-sans text-xs font-medium hover:bg-moss-light transition-colors">Add Discount</button>
              <button onClick={() => { setShowAddDiscount(false); setNewDiscount({}); }} className="px-4 py-2 rounded-lg border border-dark/10 text-dark/50 font-sans text-xs hover:border-dark/20 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddDiscount(true)} className="flex items-center gap-2 text-moss font-sans text-xs font-medium hover:text-moss-light transition-colors">
            <span className="text-base leading-none">+</span> Add discount period
          </button>
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

function Field({
  label, value, onChange, prefix, suffix, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1.5">{label}</label>
      <div className="flex items-center rounded-lg border border-dark/10 overflow-hidden focus-within:border-sage transition-colors">
        {prefix && <span className="px-2.5 font-sans text-sm text-dark/40 bg-stone/30">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2.5 py-2 font-sans text-sm text-dark bg-transparent focus:outline-none min-w-0"
          step="0.01"
        />
        {suffix && <span className="px-2.5 font-sans text-sm text-dark/40 bg-stone/30">{suffix}</span>}
      </div>
      {hint && <p className="font-sans text-[10px] text-dark/25 mt-1">{hint}</p>}
    </div>
  );
}

function InlineField({
  label, value, onChange, placeholder, type = "text", className = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors"
      />
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
