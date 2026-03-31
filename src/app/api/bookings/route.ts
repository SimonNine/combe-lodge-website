import { NextResponse } from "next/server";
import { getAllBookings } from "@/lib/db";

export async function GET() {
  try {
    const bookings = await getAllBookings();
    return NextResponse.json({ bookings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch bookings";
    return NextResponse.json({ error: message, bookings: [] }, { status: 500 });
  }
}
