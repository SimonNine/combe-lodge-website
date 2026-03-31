import { sql } from "@vercel/postgres";

export interface Booking {
  id: string;
  stripe_session_id: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  total_amount: number;
  deposit_amount: number;
  nights: number;
  status: "pending" | "confirmed" | "cancelled";
  source: string;
  created_at: string;
  deleted_at?: string | null;
}

// Call this once to set up the table (run via /api/setup in dev)
export async function createBookingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      stripe_session_id TEXT UNIQUE NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      adults INTEGER NOT NULL DEFAULT 2,
      children INTEGER NOT NULL DEFAULT 0,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      deposit_amount INTEGER NOT NULL,
      nights INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      source TEXT NOT NULL DEFAULT 'direct',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function migrateBookingsTable() {
  await sql`
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'direct'
  `;
}

export async function migrateAddSoftDelete() {
  await sql`
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ
  `;
}

export async function createManualBooking(data: {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  totalAmount?: number;
  adults?: number;
  children?: number;
  source: string;
}) {
  const nights =
    Math.round(
      (new Date(data.checkOut).getTime() - new Date(data.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  const stripeSessionId = `manual_${Date.now()}`;
  const result = await sql<Booking>`
    INSERT INTO bookings (
      stripe_session_id, check_in, check_out, adults, children,
      guest_name, guest_email, guest_phone, total_amount, deposit_amount, nights, status, source
    ) VALUES (
      ${stripeSessionId}, ${data.checkIn}, ${data.checkOut},
      ${data.adults ?? 0}, ${data.children ?? 0}, ${data.guestName ?? ''},
      ${data.guestEmail ?? ''}, ${data.guestPhone ?? ''},
      ${data.totalAmount ?? 0}, 0, ${nights}, 'confirmed', ${data.source}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateBooking(id: string, data: {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  totalAmount?: number;
  adults?: number;
  children?: number;
  source?: string;
  status?: string;
}) {
  const nights = data.checkIn && data.checkOut
    ? Math.round((new Date(data.checkOut).getTime() - new Date(data.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const result = await sql<Booking>`
    UPDATE bookings SET
      guest_name   = COALESCE(${data.guestName   ?? null}, guest_name),
      guest_email  = COALESCE(${data.guestEmail  ?? null}, guest_email),
      guest_phone  = COALESCE(${data.guestPhone  ?? null}, guest_phone),
      check_in     = COALESCE(${data.checkIn     ?? null}::date, check_in),
      check_out    = COALESCE(${data.checkOut    ?? null}::date, check_out),
      total_amount = COALESCE(${data.totalAmount ?? null}, total_amount),
      adults       = COALESCE(${data.adults      ?? null}, adults),
      children     = COALESCE(${data.children    ?? null}, children),
      source       = COALESCE(${data.source      ?? null}, source),
      status       = COALESCE(${data.status      ?? null}, status),
      nights       = COALESCE(${nights}, nights)
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function createBooking(data: Omit<Booking, "id" | "created_at">) {
  const result = await sql<Booking>`
    INSERT INTO bookings (
      stripe_session_id, check_in, check_out, adults, children,
      guest_name, guest_email, guest_phone, total_amount, deposit_amount, nights, status
    ) VALUES (
      ${data.stripe_session_id}, ${data.check_in}, ${data.check_out},
      ${data.adults}, ${data.children}, ${data.guest_name}, ${data.guest_email},
      ${data.guest_phone}, ${data.total_amount}, ${data.deposit_amount}, ${data.nights}, ${data.status}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function getBookingBySessionId(sessionId: string) {
  const result = await sql<Booking>`
    SELECT * FROM bookings WHERE stripe_session_id = ${sessionId}
  `;
  return result.rows[0] || null;
}

export async function getBookedDateRanges(): Promise<Array<{ check_in: string; check_out: string }>> {
  const result = await sql<{ check_in: string; check_out: string }>`
    SELECT check_in::text, check_out::text FROM bookings
    WHERE status = 'confirmed' AND check_out >= CURRENT_DATE AND deleted_at IS NULL
    ORDER BY check_in
  `;
  return result.rows;
}

export async function updateBookingStatus(sessionId: string, status: Booking["status"]) {
  await sql`
    UPDATE bookings SET status = ${status} WHERE stripe_session_id = ${sessionId}
  `;
}

export async function getAllBookings(): Promise<Booking[]> {
  const result = await sql<Booking>`
    SELECT * FROM bookings
    WHERE deleted_at IS NULL
    ORDER BY check_in DESC
  `;
  return result.rows;
}

export async function softDeleteBooking(id: string): Promise<void> {
  await sql`
    UPDATE bookings SET deleted_at = NOW() WHERE id = ${id}
  `;
}

export async function getTrashedBookings(): Promise<Booking[]> {
  const result = await sql<Booking>`
    SELECT * FROM bookings
    WHERE deleted_at IS NOT NULL AND deleted_at > NOW() - INTERVAL '30 days'
    ORDER BY deleted_at DESC
  `;
  return result.rows;
}

export async function restoreBooking(id: string): Promise<void> {
  await sql`
    UPDATE bookings SET deleted_at = NULL WHERE id = ${id}
  `;
}
