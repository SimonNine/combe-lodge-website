import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createBooking } from "@/lib/db";
import type Stripe from "stripe";

// Stripe requires the raw body to verify signatures
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata;

    if (!meta) {
      console.error("No metadata on session", session.id);
      return NextResponse.json({ received: true });
    }

    try {
      await createBooking({
        stripe_session_id: session.id,
        check_in: meta.checkIn,
        check_out: meta.checkOut,
        adults: parseInt(meta.adults, 10),
        children: parseInt(meta.children, 10),
        guest_name: meta.guestName,
        guest_email: meta.guestEmail,
        guest_phone: meta.guestPhone,
        total_amount: parseInt(meta.totalAmount, 10),
        deposit_amount: parseInt(meta.depositAmount, 10),
        nights: parseInt(meta.nights, 10),
        status: "confirmed",
      });
    } catch (err) {
      console.error("Failed to save booking:", err);
      // Don't return an error — Stripe would retry, which could cause duplicates
      // The UNIQUE constraint on stripe_session_id handles idempotency
    }
  }

  return NextResponse.json({ received: true });
}
