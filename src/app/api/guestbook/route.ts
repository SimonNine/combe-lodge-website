import { NextRequest, NextResponse } from "next/server";
import { getApprovedEntries, createEntry } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

// GET — public: returns approved entries
export async function GET() {
  const entries = await getApprovedEntries();
  return NextResponse.json({ entries });
}

// POST — public: submit a new entry (goes to pending)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, location, stayStart, stayEnd, message, rating, imageUrls } = body;

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    const entry = await createEntry({
      name: name.trim(),
      location: location?.trim(),
      stayStart,
      stayEnd,
      message: message.trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      imageUrls: imageUrls || [],
      status: "pending",
    });

    return NextResponse.json({ entry, message: "Thank you! Your entry will appear after review." });
  } catch (err) {
    console.error("Guestbook POST error:", err);
    return NextResponse.json({ error: "Failed to submit entry" }, { status: 500 });
  }
}
