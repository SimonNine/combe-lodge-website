import { sql } from "@vercel/postgres";

export interface GuestbookEntry {
  id: number;
  name: string;
  location: string | null;
  stay_start: string | null;
  stay_end: string | null;
  message: string;
  rating: number;
  image_urls: string[];
  status: "pending" | "approved" | "rejected" | "trash" | "draft";
  is_admin_entry: boolean;
  trashed_at: string | null;
  created_at: string;
}

export async function createGuestbookTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS guestbook_entries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      location VARCHAR(150),
      stay_start DATE,
      stay_end DATE,
      message TEXT NOT NULL,
      rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
      image_urls TEXT[] DEFAULT '{}',
      status VARCHAR(20) DEFAULT 'pending',
      is_admin_entry BOOLEAN DEFAULT FALSE,
      trashed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function getApprovedEntries(): Promise<GuestbookEntry[]> {
  const result = await sql<GuestbookEntry>`
    SELECT * FROM guestbook_entries
    WHERE status = 'approved'
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function getEntriesByStatus(status: string): Promise<GuestbookEntry[]> {
  const result = await sql<GuestbookEntry>`
    SELECT * FROM guestbook_entries
    WHERE status = ${status}
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function getAdminEntries(): Promise<GuestbookEntry[]> {
  const result = await sql<GuestbookEntry>`
    SELECT * FROM guestbook_entries
    WHERE is_admin_entry = TRUE
    ORDER BY created_at DESC
  `;
  return result.rows;
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
  const result = await sql<GuestbookEntry>`
    INSERT INTO guestbook_entries (name, location, stay_start, stay_end, message, rating, image_urls, is_admin_entry, status)
    VALUES (
      ${entry.name},
      ${entry.location || null},
      ${entry.stayStart || null},
      ${entry.stayEnd || null},
      ${entry.message},
      ${entry.rating},
      ${entry.imageUrls ? `{${entry.imageUrls.map(u => `"${u}"`).join(",")}}` : "{}"}::TEXT[],
      ${entry.isAdmin || false},
      ${entry.status || "pending"}
    )
    RETURNING *
  `;
  return result.rows[0];
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
