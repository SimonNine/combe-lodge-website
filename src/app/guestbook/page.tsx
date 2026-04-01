"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/sections/Footer";

interface Entry {
  id: number;
  name: string;
  location: string | null;
  stay_start: string | null;
  stay_end: string | null;
  message: string;
  rating: number;
  image_urls: string[];
  created_at: string;
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then((d) => { setEntries(d.entries || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="grain min-h-screen bg-warm-white">
      <Navigation light />

      {/* Hero */}
      <div className="pt-28 md:pt-36 pb-16 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-dark/30 mb-4">
              Our Guests
            </p>
            <h1 className="font-serif text-4xl md:text-6xl text-dark leading-[1.05]">
              The Guestbook
            </h1>
            <p className="font-sans font-light text-dark/45 text-base md:text-lg mt-4 max-w-lg leading-relaxed">
              Stories, memories, and moments from those who have stayed at Combe Lodge.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => { setShowForm(true); setSubmitted(false); }}
            className="mt-8 group inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300"
          >
            Leave a Message
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </motion.button>
        </div>
      </div>

      {/* Submission form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark-overlay/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-warm-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {submitted ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">&#10003;</div>
                  <h3 className="font-serif text-2xl text-dark">Thank you!</h3>
                  <p className="font-sans font-light text-dark/50 text-sm mt-2">
                    Your message will appear after we review it.
                  </p>
                  <button onClick={() => setShowForm(false)} className="mt-6 px-6 py-2.5 rounded-lg bg-moss text-light-text font-sans text-sm hover:bg-moss-light transition-colors">
                    Close
                  </button>
                </div>
              ) : (
                <SubmitForm onSuccess={() => setSubmitted(true)} onCancel={() => setShowForm(false)} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries grid */}
      <div className="px-6 md:px-10 pb-24">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <p className="font-sans font-light text-dark/30 text-sm text-center py-16">Loading...</p>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 border border-dark/8 rounded-2xl bg-stone/30">
              <p className="font-serif text-xl text-dark/25">No entries yet</p>
              <p className="font-sans font-light text-sm text-dark/30 mt-2">Be the first to leave a message.</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 gap-5 space-y-5">
              {entries.map((entry, i) => (
                <GuestbookCard key={entry.id} entry={entry} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

function GuestbookCard({ entry, index }: { entry: Entry; index: number }) {
  const date = new Date(entry.created_at);
  const dateStr = date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const stayStr = entry.stay_start
    ? `${new Date(entry.stay_start).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className="break-inside-avoid bg-white rounded-xl border border-dark/5 p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Images */}
      {entry.image_urls?.length > 0 && (
        <div className={`grid gap-2 mb-5 rounded-lg overflow-hidden ${entry.image_urls.length === 1 ? "grid-cols-1" : entry.image_urls.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {entry.image_urls.map((url, i) => (
            <div key={i} className="aspect-[4/3] bg-cover bg-center rounded-lg" style={{ backgroundImage: `url('${url}')` }} />
          ))}
        </div>
      )}

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= entry.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={s <= entry.rating ? "text-wheat" : "text-dark/15"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Message */}
      <p className="font-sans font-light text-dark/70 text-sm leading-relaxed italic">
        &ldquo;{entry.message}&rdquo;
      </p>

      {/* Author */}
      <div className="mt-5 pt-4 border-t border-dark/6 flex items-center justify-between">
        <div>
          <p className="font-sans font-medium text-sm text-dark">{entry.name}</p>
          {entry.location && (
            <p className="font-sans font-light text-xs text-dark/35 mt-0.5">{entry.location}</p>
          )}
        </div>
        <div className="text-right">
          {stayStr && (
            <p className="font-mono text-[9px] tracking-wider text-dark/30 uppercase">Stayed {stayStr}</p>
          )}
          <p className="font-mono text-[9px] tracking-wider text-dark/20 mt-0.5">{dateStr}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SubmitForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: "", location: "", stayStart: "", stayEnd: "", message: "", rating: 5 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      setError("Name and message are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl text-dark">Sign the Guestbook</h3>
        <button onClick={onCancel} className="text-dark/30 hover:text-dark/60 transition-colors p-1">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <Field label="Your name" value={form.name} onChange={(v) => set("name", v)} required />
      <Field label="Where are you from?" value={form.location} onChange={(v) => set("location", v)} placeholder="e.g. London, UK" />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Stay from" value={form.stayStart} onChange={(v) => set("stayStart", v)} type="date" />
        <Field label="Stay to" value={form.stayEnd} onChange={(v) => set("stayEnd", v)} type="date" />
      </div>

      {/* Star rating */}
      <div>
        <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => set("rating", s)} className="p-0.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill={s <= form.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={`transition-colors ${s <= form.rating ? "text-wheat" : "text-dark/20 hover:text-wheat/50"}`}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-2">Your message</label>
        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          rows={4}
          className="w-full p-3 rounded-lg border border-dark/10 font-sans text-sm text-dark placeholder:text-dark/20 bg-transparent focus:outline-none focus:border-sage transition-colors resize-none"
          placeholder="Tell us about your stay..."
        />
      </div>

      {error && <p className="font-sans text-xs text-red-500">{error}</p>}

      <button
        onClick={submit}
        disabled={saving}
        className="w-full py-3 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm hover:bg-moss-light transition-colors disabled:opacity-50"
      >
        {saving ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1.5">
        {label}{required && " *"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2.5 rounded-lg border border-dark/10 font-sans text-sm text-dark placeholder:text-dark/20 bg-transparent focus:outline-none focus:border-sage transition-colors"
      />
    </div>
  );
}
