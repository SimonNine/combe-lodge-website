import { NextRequest, NextResponse } from "next/server";
import { getTrashedBookings, restoreBooking } from "@/lib/db";

export async function GET() {
  try {
    const bookings = await getTrashedBookings();
    return NextResponse.json({ bookings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch trashed bookings";
    return NextResponse.json({ error: message, bookings: [] }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
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
