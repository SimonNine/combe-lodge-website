"use client";

import { useState, useEffect } from "react";
import type { SiteSettings } from "@/lib/admin-config";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const { setDirty } = useUnsavedChanges();

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => setSettings(d.siteSettings));
  }, []);

  const updateSettings = (updated: SiteSettings) => { setSettings(updated); setDirty(true); };

  const save = async () => {
    if (!settings) return;
    setSaveState("saving");
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteSettings: settings }),
    });
    if (res.ok) setDirty(false);
    setSaveState(res.ok ? "saved" : "error");
    setTimeout(() => setSaveState("idle"), 2500);
  };

  if (!settings) {
    return <div className="p-10 text-dark/30 font-sans text-sm">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-dark">Settings</h1>
          <p className="font-sans text-xs text-dark/40 mt-1">Content shown to guests and contact information</p>
        </div>
        <SaveButton state={saveState} onClick={save} />
      </div>

      {/* Site content */}
      <Card title="Site Content">
        <div className="space-y-4">
          <Field
            label="Hero tagline"
            value={settings.tagline}
            onChange={(v) => updateSettings({ ...settings, tagline: v })}
            hint='Shown under "Combe Lodge" on the homepage hero'
          />
          <TextareaField
            label="Check-in instructions"
            value={settings.checkInInstructions}
            onChange={(v) => updateSettings({ ...settings, checkInInstructions: v })}
            hint="Sent to guests in their booking confirmation email"
            rows={4}
          />
        </div>
      </Card>

      {/* Contact info */}
      <Card title="Contact Information" className="mt-5">
        <p className="font-sans text-xs text-dark/40 mb-4">
          Shown to guests in confirmation emails and on the booking page.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Phone number"
            value={settings.contactPhone}
            onChange={(v) => updateSettings({ ...settings, contactPhone: v })}
            placeholder="+44 7XXX XXXXXX"
          />
          <Field
            label="Email address"
            value={settings.contactEmail}
            onChange={(v) => updateSettings({ ...settings, contactEmail: v })}
            placeholder="hello@combelodge.co.uk"
          />
        </div>
      </Card>

      {/* Future integrations */}
      <Card title="Integrations" className="mt-5">
        <div className="space-y-3">
          <IntegrationRow
            label="Stripe"
            status={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "connected" : "not configured"}
            description="Add STRIPE_SECRET_KEY to .env.local to enable payments"
            statusColor={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "text-green-600" : "text-amber-500"}
          />
          <IntegrationRow
            label="Google Calendar"
            status="coming soon"
            description="Auto-create calendar events for Kentisbury Grange when bookings are confirmed"
            statusColor="text-dark/30"
          />
          <IntegrationRow
            label="Email (Resend)"
            status="coming soon"
            description="Send confirmation emails to guests automatically"
            statusColor="text-dark/30"
          />
        </div>
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
  label, value, onChange, hint, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors"
      />
      {hint && <p className="font-sans text-[10px] text-dark/25 mt-1">{hint}</p>}
    </div>
  );
}

function TextareaField({
  label, value, onChange, hint, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors resize-none"
      />
      {hint && <p className="font-sans text-[10px] text-dark/25 mt-1">{hint}</p>}
    </div>
  );
}

function IntegrationRow({
  label, status, description, statusColor,
}: {
  label: string; status: string; description: string; statusColor: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-dark/5 last:border-0">
      <div>
        <p className="font-sans text-sm text-dark font-medium">{label}</p>
        <p className="font-sans text-xs text-dark/35 mt-0.5">{description}</p>
      </div>
      <span className={`font-mono text-[10px] tracking-wide whitespace-nowrap mt-0.5 ${statusColor}`}>{status}</span>
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
