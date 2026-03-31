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
  created_at: string;
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
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
    WHERE status = 'confirmed' AND check_out >= CURRENT_DATE
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
    ORDER BY check_in DESC
  `;
  return result.rows;
}
