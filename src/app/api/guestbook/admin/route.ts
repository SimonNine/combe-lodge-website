import { NextRequest, NextResponse } from "next/server";
import { getEntriesByStatus, getAdminEntries, createEntry, updateEntryStatus, deleteEntry, cleanupTrash } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

// GET — admin: returns entries by status or admin's own
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || "pending";

  if (status === "admin") {
    const entries = await getAdminEntries();
    return NextResponse.json({ entries });
  }

  const entries = await getEntriesByStatus(status);
  return NextResponse.json({ entries });
}

// POST — admin: create own testimonial or update entry status
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Action: create admin testimonial
    if (body.action === "create") {
      const entry = await createEntry({
        name: body.name,
        location: body.location,
        stayStart: body.stayStart,
        stayEnd: body.stayEnd,
        message: body.message,
        rating: body.rating || 5,
        imageUrls: body.imageUrls || [],
        isAdmin: true,
        status: body.publish ? "approved" : "draft",
      });
      return NextResponse.json({ entry });
    }

    // Action: update status (approve, reject, trash, restore, publish, draft)
    if (body.action === "updateStatus" && body.id && body.status) {
      await updateEntryStatus(body.id, body.status);
      return NextResponse.json({ ok: true });
    }

    // Action: permanent delete
    if (body.action === "delete" && body.id) {
      await deleteEntry(body.id);
      return NextResponse.json({ ok: true });
    }

    // Action: cleanup trash (30-day expired)
    if (body.action === "cleanup") {
      const count = await cleanupTrash();
      return NextResponse.json({ ok: true, deleted: count });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Guestbook admin error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
