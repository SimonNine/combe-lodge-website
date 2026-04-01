import { NextResponse } from "next/server";
import { createBookingsTable, migrateBookingsTable, migrateAddSoftDelete } from "@/lib/db";
import { createConfigTable } from "@/lib/admin-config";
import { createGuestbookTable } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await createBookingsTable();
    await migrateBookingsTable();
    await migrateAddSoftDelete();
    await createConfigTable();
    await createGuestbookTable();
    return NextResponse.json({ ok: true, message: "Tables ready", v: 2 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Setup failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
