"use client";

import { useState, useEffect, useCallback } from "react";

interface Entry {
  id: number;
  name: string;
  location: string | null;
  stay_start: string | null;
  stay_end: string | null;
  message: string;
  rating: number;
  image_urls: string[];
  status: string;
  is_admin_entry: boolean;
  trashed_at: string | null;
  created_at: string;
}

type Tab = "pending" | "approved" | "admin" | "trash";

export default function AdminGuestbookPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Entry>>({});
  const [counts, setCounts] = useState<Record<Tab, number>>({ pending: 0, approved: 0, admin: 0, trash: 0 });

  const loadTab = useCallback(async (t: Tab) => {
    setLoading(true);
    const res = await fetch(`/api/guestbook/admin?status=${t}`);
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  }, []);

  const loadCounts = useCallback(async () => {
    const tabs: Tab[] = ["pending", "approved", "admin", "trash"];
    const results = await Promise.all(
      tabs.map((t) => fetch(`/api/guestbook/admin?status=${t}`).then((r) => r.json()))
    );
    const c: Record<Tab, number> = { pending: 0, approved: 0, admin: 0, trash: 0 };
    tabs.forEach((t, i) => { c[t] = results[i].entries?.length || 0; });
    setCounts(c);
  }, []);

  useEffect(() => { loadTab(tab); loadCounts(); }, [tab, loadTab, loadCounts]);

  const action = async (actionType: string, id: number, status?: string) => {
    await fetch("/api/guestbook/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionType, id, status }),
    });
    loadTab(tab);
    loadCounts();
  };

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditDraft({ ...entry });
  };

  const saveEdit = async () => {
    if (!editingId || !editDraft.name || !editDraft.message) return;
    await fetch("/api/guestbook/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "edit",
        id: editingId,
        name: editDraft.name,
        location: editDraft.location || "",
        stayStart: editDraft.stay_start || "",
        stayEnd: editDraft.stay_end || "",
        message: editDraft.message,
        rating: editDraft.rating,
      }),
    });
    setEditingId(null);
    setEditDraft({});
    loadTab(tab);
  };

  const createEntry = async (form: { name: string; location: string; stayStart: string; stayEnd: string; message: string; rating: number; publish: boolean }) => {
    await fetch("/api/guestbook/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...form }),
    });
    setShowCreate(false);
    if (tab === "admin") loadTab(tab);
    loadCounts();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "admin", label: "My Entries" },
    { key: "trash", label: "Trash" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <h1 className="font-serif text-2xl text-dark mb-1">Guestbook</h1>
      <p className="font-sans font-light text-sm text-dark/40 mb-6">Review, approve, and manage guest entries.</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone rounded-lg p-1 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-sans text-xs transition-colors whitespace-nowrap ${
              tab === t.key ? "bg-white text-dark shadow-sm font-medium" : "text-dark/45 hover:text-dark/70"
            }`}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                t.key === "pending" && tab !== t.key ? "bg-moss/15 text-moss" : "bg-dark/8 text-dark/40"
              }`}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add button for admin tab */}
      {tab === "admin" && (
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="mb-4 flex items-center gap-2 text-moss font-sans text-xs font-medium hover:text-moss-light transition-colors"
        >
          <span className="text-base leading-none">+</span> Add testimonial
        </button>
      )}

      {/* Create form */}
      {showCreate && (
        <CreateForm onSubmit={createEntry} onCancel={() => setShowCreate(false)} />
      )}

      {/* Entries list */}
      {loading ? (
        <p className="font-sans text-sm text-dark/30 py-8 text-center">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="font-sans text-sm text-dark/30 py-8 text-center italic">No entries.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const isEditing = editingId === entry.id;

            if (isEditing) {
              return (
                <div key={entry.id} className="bg-white rounded-xl border border-sage/30 p-5 shadow-sm space-y-4">
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">Editing Entry</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Name</label>
                      <input value={editDraft.name || ""} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage" />
                    </div>
                    <div>
                      <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Location</label>
                      <input value={editDraft.location || ""} onChange={(e) => setEditDraft((d) => ({ ...d, location: e.target.value }))} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage" />
                    </div>
                    <div>
                      <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Stay from</label>
                      <input type="date" value={editDraft.stay_start ? editDraft.stay_start.split("T")[0] : ""} onChange={(e) => setEditDraft((d) => ({ ...d, stay_start: e.target.value }))} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage" />
                    </div>
                    <div>
                      <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Stay to</label>
                      <input type="date" value={editDraft.stay_end ? editDraft.stay_end.split("T")[0] : ""} onChange={(e) => setEditDraft((d) => ({ ...d, stay_end: e.target.value }))} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage" />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Message</label>
                    <textarea value={editDraft.message || ""} onChange={(e) => setEditDraft((d) => ({ ...d, message: e.target.value }))} rows={3} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage resize-none" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setEditDraft((d) => ({ ...d, rating: s }))}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={s <= (editDraft.rating || 5) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={s <= (editDraft.rating || 5) ? "text-wheat" : "text-dark/20"}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-moss text-light-text font-sans text-xs font-medium hover:bg-moss-light transition-colors">Save</button>
                    <button onClick={() => { setEditingId(null); setEditDraft({}); }} className="px-4 py-2 rounded-lg border border-dark/10 text-dark/50 font-sans text-xs hover:border-dark/20 transition-colors">Cancel</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={entry.id} className="bg-white rounded-xl border border-dark/5 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans font-medium text-sm text-dark">{entry.name}</span>
                      {entry.location && <span className="font-sans font-light text-xs text-dark/35">{entry.location}</span>}
                      {entry.is_admin_entry && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-sage/15 text-sage-dark">Admin</span>
                      )}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= entry.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={s <= entry.rating ? "text-wheat" : "text-dark/10"}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="font-sans font-light text-sm text-dark/60 mt-2 line-clamp-3">{entry.message}</p>
                    <p className="font-mono text-[10px] text-dark/25 mt-2">
                      {new Date(entry.created_at).toLocaleDateString("en-GB")}
                      {entry.stay_start && ` · Stayed ${new Date(entry.stay_start).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`}
                      {entry.trashed_at && ` · Trashed ${new Date(entry.trashed_at).toLocaleDateString("en-GB")}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <ActionBtn label="Edit" onClick={() => startEdit(entry)} color="moss" />
                    {tab === "pending" && (
                      <>
                        <ActionBtn label="Approve" onClick={() => action("updateStatus", entry.id, "approved")} color="moss" />
                        <ActionBtn label="Reject" onClick={() => action("updateStatus", entry.id, "trash")} color="red" />
                      </>
                    )}
                    {tab === "approved" && (
                      <ActionBtn label="Trash" onClick={() => action("updateStatus", entry.id, "trash")} color="red" />
                    )}
                    {tab === "admin" && (
                      <>
                        <ActionBtn
                          label={entry.status === "approved" ? "Unpublish" : "Publish"}
                          onClick={() => action("updateStatus", entry.id, entry.status === "approved" ? "draft" : "approved")}
                          color="moss"
                        />
                        <ActionBtn label="Delete" onClick={() => action("updateStatus", entry.id, "trash")} color="red" />
                      </>
                    )}
                    {tab === "trash" && (
                      <>
                        <ActionBtn label="Restore" onClick={() => action("updateStatus", entry.id, "pending")} color="moss" />
                        <ActionBtn label="Delete forever" onClick={() => action("delete", entry.id)} color="red" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, onClick, color }: { label: string; onClick: () => void; color: "moss" | "red" }) {
  const styles = color === "moss"
    ? "text-moss hover:bg-moss/10"
    : "text-red-400 hover:bg-red-50";
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg font-sans text-xs transition-colors ${styles}`}>
      {label}
    </button>
  );
}

function CreateForm({ onSubmit, onCancel }: {
  onSubmit: (form: { name: string; location: string; stayStart: string; stayEnd: string; message: string; rating: number; publish: boolean }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ name: "", location: "", stayStart: "", stayEnd: "", message: "", rating: 5, publish: false });
  const set = (field: string, value: string | number | boolean) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="bg-white rounded-xl border border-dark/5 p-5 mb-4 space-y-4 shadow-sm">
      <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40">New Testimonial</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Name</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage" placeholder="Guest name" />
        </div>
        <div>
          <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Location</label>
          <input value={form.location} onChange={(e) => set("location", e.target.value)} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage" placeholder="e.g. London" />
        </div>
        <div>
          <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Stay from</label>
          <input type="date" value={form.stayStart} onChange={(e) => set("stayStart", e.target.value)} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage" />
        </div>
        <div>
          <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Stay to</label>
          <input type="date" value={form.stayEnd} onChange={(e) => set("stayEnd", e.target.value)} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage" />
        </div>
      </div>
      <div>
        <label className="font-mono text-[9px] tracking-[0.12em] uppercase text-dark/35 block mb-1">Message</label>
        <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} className="w-full p-2 rounded-lg border border-dark/10 font-sans text-sm bg-transparent focus:outline-none focus:border-sage resize-none" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => set("rating", s)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={s <= form.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={s <= form.rating ? "text-wheat" : "text-dark/20"}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 font-sans text-xs text-dark/50 cursor-pointer">
          <input type="checkbox" checked={form.publish} onChange={(e) => set("publish", e.target.checked)} className="rounded border-dark/20" />
          Publish immediately
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSubmit(form)} className="px-4 py-2 rounded-lg bg-moss text-light-text font-sans text-xs font-medium hover:bg-moss-light transition-colors">
          Save
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-dark/10 text-dark/50 font-sans text-xs hover:border-dark/20 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
