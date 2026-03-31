import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getTrashedBookings, restoreBooking } from "@/lib/db";

export async function GET() {
  try {
    const bookings = await getTrashedBookings();
    return NextResponse.json({ bookings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load trash";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await restoreBooking(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to restore booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await sql`DELETE FROM bookings WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to permanently delete booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
