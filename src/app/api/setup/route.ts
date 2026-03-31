import { NextResponse } from "next/server";
import { createBookingsTable, migrateBookingsTable, migrateAddSoftDelete } from "@/lib/db";

export async function GET() {
  try {
    await createBookingsTable();
    await migrateBookingsTable();
    await migrateAddSoftDelete();
    return NextResponse.json({ ok: true, message: "Bookings table ready" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Setup failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
