import { sql } from "@vercel/postgres";

export interface GuestbookEntry {
  id: number;
  name: string;
  location: string | null;
  stay_start: string | null;
  stay_end: string | null;
  message: string;
  rating: number;
  image_urls: string; // JSON string of URL array
  status: "pending" | "approved" | "rejected" | "trash" | "draft";
  is_admin_entry: boolean;
  trashed_at: string | null;
  created_at: string;
}

function parseImageUrls(entry: GuestbookEntry): string[] {
  try { return JSON.parse(entry.image_urls || "[]"); } catch { return []; }
}

// Parse image_urls for all entries in a result set
function withParsedImages(entries: GuestbookEntry[]) {
  return entries.map((e) => ({ ...e, image_urls: parseImageUrls(e) }));
}

export async function createGuestbookTable() {
  // Drop old table if it exists (safe — feature is brand new, no real data yet)
  await sql`DROP TABLE IF EXISTS guestbook_entries`;
  await sql`
    CREATE TABLE guestbook_entries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      location VARCHAR(150),
      stay_start DATE,
      stay_end DATE,
      message TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      image_urls TEXT DEFAULT '[]',
      status VARCHAR(20) DEFAULT 'pending',
      is_admin_entry BOOLEAN DEFAULT FALSE,
      trashed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function getApprovedEntries() {
  const result = await sql<GuestbookEntry>`
    SELECT * FROM guestbook_entries
    WHERE status = 'approved'
    ORDER BY created_at DESC
  `;
  return withParsedImages(result.rows);
}

export async function getEntriesByStatus(status: string) {
  if (status === "trash") {
    // Trash shows ALL trashed entries (guest + admin)
    const result = await sql<GuestbookEntry>`
      SELECT * FROM guestbook_entries
      WHERE status = 'trash'
      ORDER BY trashed_at DESC
    `;
    return withParsedImages(result.rows);
  }

  // Non-trash tabs exclude trashed entries
  const result = await sql<GuestbookEntry>`
    SELECT * FROM guestbook_entries
    WHERE status = ${status} AND (status != 'trash')
    ORDER BY created_at DESC
  `;
  return withParsedImages(result.rows);
}

export async function getAdminEntries() {
  // Only show admin entries that aren't trashed
  const result = await sql<GuestbookEntry>`
    SELECT * FROM guestbook_entries
    WHERE is_admin_entry = TRUE AND status != 'trash'
    ORDER BY created_at DESC
  `;
  return withParsedImages(result.rows);
}

export async function createEntry(entry: {
  name: string;
  location?: string;
  stayStart?: string;
  stayEnd?: string;
  message: string;
  rating: number;
  imageUrls?: string[];
  isAdmin?: boolean;
  status?: string;
}): Promise<GuestbookEntry> {
  const imgJson = JSON.stringify(entry.imageUrls || []);

  const result = await sql<GuestbookEntry>`
    INSERT INTO guestbook_entries (name, location, stay_start, stay_end, message, rating, image_urls, is_admin_entry, status)
    VALUES (
      ${entry.name},
      ${entry.location || null},
      ${entry.stayStart || null},
      ${entry.stayEnd || null},
      ${entry.message},
      ${entry.rating},
      ${imgJson},
      ${entry.isAdmin || false},
      ${entry.status || "pending"}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateEntry(id: number, fields: {
  name?: string; location?: string; stayStart?: string; stayEnd?: string;
  message?: string; rating?: number;
}): Promise<void> {
  await sql`
    UPDATE guestbook_entries
    SET name = COALESCE(${fields.name ?? null}, name),
        location = ${fields.location ?? null},
        stay_start = ${fields.stayStart || null},
        stay_end = ${fields.stayEnd || null},
        message = COALESCE(${fields.message ?? null}, message),
        rating = COALESCE(${fields.rating ?? null}, rating),
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function updateEntryStatus(id: number, status: string): Promise<void> {
  if (status === "trash") {
    await sql`
      UPDATE guestbook_entries
      SET status = 'trash', trashed_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE guestbook_entries
      SET status = ${status}, trashed_at = NULL, updated_at = NOW()
      WHERE id = ${id}
    `;
  }
}

export async function deleteEntry(id: number): Promise<void> {
  await sql`DELETE FROM guestbook_entries WHERE id = ${id}`;
}

export async function cleanupTrash(): Promise<number> {
  const result = await sql`
    DELETE FROM guestbook_entries
    WHERE status = 'trash' AND trashed_at < NOW() - INTERVAL '30 days'
  `;
  return result.rowCount ?? 0;
}
