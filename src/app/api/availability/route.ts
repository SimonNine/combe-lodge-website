import { NextResponse } from "next/server";
import { getBookedDateRanges } from "@/lib/db";
import { getAdminConfig } from "@/lib/admin-config";

function expandDateRange(checkIn: string, checkOut: string): string[] {
  const dates: string[] = [];
  const start = new Date(checkIn + "T12:00:00");
  const end = new Date(checkOut + "T12:00:00");
  const current = new Date(start);
  while (current < end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export async function GET() {
  try {
    const [ranges, config] = await Promise.all([
      getBookedDateRanges(),
      getAdminConfig(),
    ]);

    const bookedFromDB: string[] = [];
    for (const range of ranges) {
      bookedFromDB.push(...expandDateRange(range.check_in, range.check_out));
    }

    const blackoutDates: string[] = config.blackoutDates || [];
    const allDates = Array.from(new Set([...bookedFromDB, ...blackoutDates]));

    return NextResponse.json({ bookedDates: allDates });
  } catch {
    return NextResponse.json({ bookedDates: [] });
  }
}
