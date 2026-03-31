import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { calculatePrice } from "@/lib/booking-rules";
import { getAdminConfig } from "@/lib/admin-config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkIn, checkOut, adults, children, guestName, guestEmail, guestPhone } = body;

    if (!checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const config = await getAdminConfig();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const pricing = calculatePrice(checkInDate, checkOutDate, config.pricing);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Build line items — one per night for transparency, plus cleaning fee
    const lineItems: {
      price_data: {
        currency: string;
        product_data: { name: string };
        unit_amount: number;
      };
      quantity: number;
    }[] = pricing.nightlyBreakdown.map((night) => {
      const date = new Date(night.date + "T12:00:00");
      const label = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
      return {
        price_data: {
          currency: "gbp",
          product_data: { name: `Combe Lodge — ${label}` },
          unit_amount: night.rate, // already in pence
        },
        quantity: 1,
      };
    });

    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: { name: "Cleaning fee" },
        unit_amount: pricing.cleaningFee, // already in pence
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: guestEmail,
      line_items: lineItems,
      metadata: {
        checkIn,
        checkOut,
        adults: adults.toString(),
        children: children.toString(),
        guestName,
        guestEmail,
        guestPhone,
        nights: pricing.nights.toString(),
        totalAmount: pricing.total.toString(),
        depositAmount: pricing.deposit.toString(),
      },
      payment_intent_data: {
        description: `Combe Lodge — ${pricing.nights} nights, ${guestName}`,
      },
      success_url: `${baseUrl}/booking/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
