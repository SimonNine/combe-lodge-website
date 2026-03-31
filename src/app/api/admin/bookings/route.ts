import { NextRequest, NextResponse } from "next/server";
import { createManualBooking, updateBooking, softDeleteBooking } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkIn, checkOut, source, guestName, guestEmail, guestPhone, totalAmount, adults, children } = body;

    if (!source || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Source, check-in and check-out are required" }, { status: 400 });
    }

    const booking = await createManualBooking({
      source,
      checkIn,
      checkOut,
      guestName: guestName || "",
      guestEmail: guestEmail || "",
      guestPhone: guestPhone || "",
      totalAmount: totalAmount ? Math.round(parseFloat(totalAmount) * 100) : 0,
      adults: adults ? parseInt(adults) : 0,
      children: children ? parseInt(children) : 0,
    });

    return NextResponse.json({ booking });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, checkIn, checkOut, source, guestName, guestEmail, guestPhone, totalAmount, adults, children, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
    }

    const booking = await updateBooking(id, {
      ...(source !== undefined && { source }),
      ...(checkIn !== undefined && { checkIn }),
      ...(checkOut !== undefined && { checkOut }),
      ...(guestName !== undefined && { guestName }),
      ...(guestEmail !== undefined && { guestEmail }),
      ...(guestPhone !== undefined && { guestPhone }),
      ...(totalAmount !== undefined && { totalAmount: Math.round(parseFloat(totalAmount) * 100) }),
      ...(adults !== undefined && { adults: parseInt(adults) }),
      ...(children !== undefined && { children: parseInt(children) }),
      ...(status !== undefined && { status }),
    });

    return NextResponse.json({ booking });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await softDeleteBooking(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
